uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iCameraPos;
uniform vec4 iCameraQuat;

varying vec2 vUv;

/*
Domain repetition is a very useful operator, 
since it allows you to create infinitely many primitives 
with a single object evaluator and without increasing the 
memory footprint of your application. 
The code below shows how to perform the operation in the simplest way:
from: https://iquilezles.org/articles/distfunctions/
*/

/*
float opRep( in vec3 p, in vec3 c, in sdf3d primitive )
{
    vec3 q = mod(p+0.5*c,c)-0.5*c;
    return primitive( q );
}
*/

/*
Moves for combining distance functions

min: union 
max: intersection
negate: take the inverse of the shape (inside-out)
*/

float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opIntersect(float d1, float d2) {
    return max(d1, d2);
}

float opSmoothIntersect(float d1, float d2, float k) {
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}

// subract shape d1 from d2
float opSubtract(float d1, float d2) {
    return max(-d1, d2);
}

float opSmoothSubtract(float d1, float d2, float k) {
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

/*============Domain Repetition=============*/



const int MAX_MARCHING_STEPS = 155;
const float MIN_DIST = 0.0;
const float MAX_DIST = 250.0;
const float PRECISION = 0.001;
const float EPSILON = 0.0005;
const float PI = 3.14159265359;
const vec3 COLOR_BACKGROUND = vec3(.741, .675, .82);
const vec3 COLOR_AMBIENT = vec3(0.42, 0.20, 0.1);

mat2 rotate2d(float theta) {
  float s = sin(theta), c = cos(theta);
  return mat2(c, -s, s, c);
}


float sdSphere(vec3 p, float r, vec3 offset)
{
  return length(p - offset) - r;
}

float opSymXSphere(vec3 p, float r, vec3 o)
{
  p.x = abs(p.x);
  return sdSphere(p, r, o);
}

// this shit works with lighting too!!!
float opRep( in vec3 p, in vec3 c )
{
    vec3 q = mod(p+0.5*c,c)-0.5*c;
    return sdSphere( q, 1.0, vec3(0.0) );
}

float scene(vec3 p) {
  float d1 = sdSphere(p, 1., vec3(0, 0, 0));
  float d2 = sdSphere(p, 1., vec3(0, 1.5, 0));
  float d3 = opSymXSphere(p, 1.0, vec3(1, -1, 0));
  
  float d = opUnion(d2, d1);
  d = opUnion(d, d3);
  
  // return d;
  return opRep(p, vec3(7));
}

float rayMarch(vec3 ro, vec3 rd) {
  float depth = MIN_DIST;
  float d; // distance ray has travelled

  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = ro + depth * rd;
    d = scene(p);
    depth += d;
    if (d < PRECISION || depth > MAX_DIST) break;
  }
  
  d = depth;
  
  return d;
}

vec3 calcNormal(in vec3 p) {
    vec2 e = vec2(1, -1) * EPSILON;
    return normalize(
      e.xyy * scene(p + e.xyy) +
      e.yyx * scene(p + e.yyx) +
      e.yxy * scene(p + e.yxy) +
      e.xxx * scene(p + e.xxx));
}

// returns basis vectors of new coordinate system
// with z axis going from cameraPos --> lookAtPoint
mat3 camera(vec3 cameraPos, vec3 lookAtPoint) {
	vec3 cd = normalize(lookAtPoint - cameraPos);
	vec3 cr = normalize(cross(vec3(0, 1, 0), cd));
	vec3 cu = normalize(cross(cd, cr));
	
	return mat3(-cr, cu, -cd);
}

// https://iquilezles.org/articles/rmshadows/
// t: distance traveled along ray so far
// tmax: distance to light source
float hardShadow(vec3 ro, vec3 rd, float tmax) {
  float res = 1.0;

  for( float t = 0.001; t < tmax; ) {
      float h = scene(ro + rd * t); // h: current min dist to scene
      if (h < 0.001) {  // object blocking light source
          res = 0.0;
          break;
      }
      t += max(h, .02);
  }

  return clamp( res, 0.9, 1.0 ); // clamp to .2 to soften shadow
}

void mainImage( out vec4 fragColor, in vec2 fragCoord, in vec3 fragRayOri, in vec3 fragRayDir )
{
  // get uv in range [-0.5, 0.5] with 0,0 at center of screen
  // scaled by viewport aspect ratio
  vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
  
  vec3 col = vec3(0);
  vec3 lp = vec3(0);  // lookat point
  vec3 ro = fragRayOri;
  
  float cameraRadius = 2.;

  vec3 rd = fragRayDir;

  float d = rayMarch(ro, rd); // signed distance value to closest object

  if (d > MAX_DIST) {
    col = COLOR_BACKGROUND; // ray didn't hit anything
  } else {
    vec3 p = ro + rd * d; // point discovered from ray marching
    vec3 normal = calcNormal(p); // surface normal

    vec3 lightPosition = vec3(
        10.0 * sin(iTime), // + 10.0 * mix(-1., 1., mouseUV.x), 
        // 2.0 + 10.0 * mix(-1., 1., mouseUV.y), 
        0,
        0
    );
    vec3 lightDirection = normalize(lightPosition - p) * .65; // The 0.65 is used to decrease the light intensity a bit
    
    // shadow pass
    vec3 newRayOrigin = p + normal * .001; // nudge origin so it doesn't intersect same point immediately
    float lightDist = length(lightPosition - newRayOrigin);
    float shadowMod = hardShadow(newRayOrigin, lightDirection, lightDist); 
    
    // modified lambertion diffuse
    float dif = clamp(dot(normal, lightDirection), 0., 1.) * 0.5 + 0.5; // diffuse reflection mapped to values between 0.5 and 1.0

    col = vec3(dif) + COLOR_AMBIENT;    
  }

  fragColor = vec4(col, 1.0);
}

vec3 rotate_vector( vec4 quat, vec3 vec) {
  return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

void main() {  // if you want procedural textures, just pass UVs from default frag shader, and don't scale by screen resolution
  vec2 uv = (gl_FragCoord.xy-.5*iResolution.xy)/iResolution.y;
  vec3 rd = rotate_vector(iCameraQuat, normalize(vec3(uv, -1))); // ray direction
  vec3 ro = iCameraPos;
  mainImage(gl_FragColor, gl_FragCoord.xy, ro, rd);
//   mainImage(gl_FragColor, vUv * iResolution.xy);a
}