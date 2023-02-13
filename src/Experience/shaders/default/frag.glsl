// #include <common>  // https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/common.glsl.js
 
uniform vec3 iResolution;
uniform float iTime;

varying vec2 vUv;
 
// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
 
    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
 
    // Output to screen
    fragColor = vec4(uv, 0.0, 1.0);
    // fragColor = vec4(col,1.0);
}
 
void main() {  // if you want procedural textures, just pass UVs from default frag shader
  mainImage(gl_FragColor, gl_FragCoord.xy);
//   mainImage(gl_FragColor, vUv * iResolution.xy);
}
