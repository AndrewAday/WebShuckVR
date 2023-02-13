precision mediump float;
// writing chuck in unity is like writing glsl in ... THREEjs? lol
// modelMatrix m = Translation * Rot * Scale. Transforms a vertex position from local model space
// e.g. (0, 0, 0) to world space. With a single mesh instance centered in model space (0,0,0), the
// M = T*R*S modelMatrix can apply any arbitrary translation + rotation + scale
uniform mat4 modelMatrix;  

/*
Camera space is coordinate system defined at camera pos = (0,0,0), facing down -Z axis
the camera itself has a model matrix to transform its position into world space.
Inverse of the cameras model matrix is the *viewMatrix*, which transforms objects from
world space into camera/view space
any vertex that will be rendered must be in front of camera, and have a value Z < 0 in camera space
*/
uniform mat4 viewMatrix;

/*
vertices now must be transformed from camera space into *clip* space. 
proj matrix defines extents of camera's view. common types: perspective and orthographic.
After mult with projection matrix, vertices are now in clip space as 4D homogeneous coords
orth proj matrices will keep the 4th dim w = 1
perspective proj Matrices will make w decrease wrt the distance from camera: z
after returning this 4d vector from the vertex shader, rendering pipeline automatically performs
*perspective division* dividing each scalar in [x,y,z] by the homogenous coord w, resulting 
in a vertex position in *normalized device coordinates*: [x/w, y/w, z/w]

Any coordinate outside a unit cube is considered outside the camera's view space/clip space and discarded


*/
uniform mat4 projectionMatrix;


/*
lastly, the NDC-space positions undergo a *viewport transformation* that translates into a pixel position and depth
appropriate for the physical display
*/


uniform vec2 uFrequency;
uniform float uTime; 

attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;  // must match name in js land

varying vec2 vUv;
varying float vRandom;
varying float vElevation;

void main() {
    // position in model space
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // now in world space
    float elevation = sin(modelPosition.x * uFrequency.x + uTime) * .1;
    elevation += sin(modelPosition.y * uFrequency.y + uTime) * .1;
    modelPosition.z += elevation;
    // modelPosition.z += aRandom * .1;

    vec4 viewPosition = viewMatrix * modelPosition;
    // now in camera space

    vec4 projectedPosition = projectionMatrix * viewPosition;
    // now in ndc space

    vUv = uv;
    vElevation = elevation;
    vRandom = aRandom;
    gl_Position = projectedPosition;
}