// TODO: should move these into a common glsl include
// can be done using the vite glsl plugin
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iCameraPos;
uniform vec4 iCameraQuat;
uniform sampler2D iAudioTexture;
uniform float iVolume;
uniform float iVolScale;

uniform int maxIterations;
uniform float maxDistance;

varying vec2 vUv;



const vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));

float sphere(vec3 p, vec3 center, float radius) {
  return length(p - center) - radius;
}

float box(vec3 p, vec3 center, vec3 size) {
  vec3 d = abs(p - center) - size;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

// from https://www.shadertoy.com/view/wstcDN
#define Power 3.0

float fixedMandel(vec3 pos, out int steps) {
  // shift up in space
  pos.y -= 3.0;

	vec3 z = pos;
	float dr = 1.0;
	float r = 0.0;
	for (int i = 0; i < 10 ; i++) {
		r = length(z);
        steps = i;
		if (r>4.0) break;
		
		// convert to polar coordinates
		float theta = acos(z.z/r);
		float phi = atan(z.y,z.x);
		dr =  pow( r, Power-1.0)*Power*dr + 1.0;
		
		// scale and rotate the point
		float zr = pow( r,Power);
		theta = theta*Power;
		phi = phi*Power;
		
		// convert back to cartesian coordinates
		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
		z+=pos;
	}

	return 0.5*log(r)*r/dr;
}

// chatgpt failed here
float mandelbulb(vec3 p) {
  float power = 8.0;
  float bailout = 100.0;
  float scale = 0.5;
  vec3 z = p;
  float dr = 1.0;
  float r = 0.0;
  
  for (int i = 0; i < 5; i++) {
    r = length(z);
    if (r > bailout) {
      break;
    }
    
    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    dr = pow(r, power - 1.0) * power * dr + 1.0;
    
    float zr = pow(r, power);
    theta = theta * power;
    phi = phi * power;
    z = scale * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + p;
    z = z * zr;
    z += p;
  }
  
  return 0.5 * log(r) * r / dr;
}

float terrain(vec3 p) {
  float y = (
    p.y 
    - 0.25 * sin(8.0 * p.x + 4.0 * iTime) * iVolume * iVolScale
    // - 0.25 * sin(p.x + 4.0 * iTime) 
    - 0.25 * sin(8.0 * p.z + 4.0 * iTime) * iVolume * iVolScale
  );
  return y;
}

float distanceField(vec3 p, out int steps) {
  float sphereDistance = sphere(p, vec3(0.0, 0.0, 0.0), 1.0);
  float boxDistance = box(p, vec3(1.5, -0.5, -1.5), vec3(1.0, 1.0, 1.0));
  // mandelbulb broken af
  // float mandelbulbDistance = mandelbulb(p);
  
  // this just for normal
  float mandelbulbDistance = fixedMandel(p, steps);
  
  float terrainDistance = terrain(p);
  
  
  float m1 = min(sphereDistance, min(boxDistance, terrainDistance));
  return min(m1, mandelbulbDistance);
}

// vec3 getNormal(vec3 p) {
//   float eps = 0.001;
//   int steps = 0
//   return normalize(vec3(
//     distanceField(p + vec3(eps, 0.0, 0.0)) - distanceField(p - vec3(eps, 0.0, 0.0)),
//     distanceField(p + vec3(0.0, eps, 0.0)) - distanceField(p - vec3(0.0, eps, 0.0)),
//     distanceField(p + vec3(0.0, 0.0, eps)) - distanceField(p - vec3(0.0, 0.0, eps))
//   ));
// }

// my own fn
vec3 calcNormal(in vec3 p) {
    const float EPSILON = 0.0005;
    vec2 e = vec2(1, -1) * EPSILON;
    int steps = 0;
    return normalize(
      e.xyy * distanceField(p + e.xyy, steps) +
      e.yyx * distanceField(p + e.yyx, steps) +
      e.yxy * distanceField(p + e.yxy, steps) +
      e.xxx * distanceField(p + e.xxx, steps));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord, in vec3 fragRayOri, in vec3 fragRayDir ) 
{
  // vec2 position = fragCoord.xy / iResolution.xy;
  vec2 position = vUv - 0.5;
  vec3 ray = fragRayDir;
  vec3 cameraPosition = fragRayOri;
  ray = normalize(ray);
  
  float t = 0.0;
  float totalDistance = 0.0;
  const float PRECISION = 0.001;
  vec3 p = vec3(0.0);
  
  int steps = 0;
  for (int i = 0; i < maxIterations; i++) {
    p = cameraPosition + t * ray;
    float d = distanceField(p, steps);
    totalDistance += d;
    
    if (d < PRECISION || totalDistance > maxDistance) {
      break;
    }
    
    t += d;
  }
  
  vec3 color = vec3(0.0);
  if (totalDistance < maxDistance) {
    // hit something, find color
    vec3 normal = calcNormal(p);
    // chatgpt likes  lambertion diffuse
    float diffuse = max(dot(normal, lightDirection), 0.0);

    // fractal coloring (if normal takes too long)
    // (clamp(float(steps) / 20.0, 0.0, 1.0)), 1.0);

    color = vec3(diffuse);
  }
  
  fragColor = vec4(color, 1.0);
}

vec3 rotate_vector( vec4 quat, vec3 vec) {
  return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

void main() {  // if you want procedural textures, just pass UVs from default frag shader, and don't scale by screen resolution
  vec2 uv = (vUv - .5) * iResolution.xy / iResolution.y;
  vec3 rd = rotate_vector(iCameraQuat, normalize(vec3(uv, -1))); // ray direction
  vec3 ro = iCameraPos;
  mainImage(gl_FragColor, gl_FragCoord.xy, ro, rd);
//   mainImage(gl_FragColor, vUv * iResolution.xy);a
}
