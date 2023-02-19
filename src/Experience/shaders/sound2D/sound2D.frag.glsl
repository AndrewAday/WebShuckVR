// #include <common>  // https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/common.glsl.js
 
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iAudioTexture;
uniform sampler2D iFlagTexture;

varying vec2 vUv;

// Created by inigo quilez - iq/2013
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/


// source: https://www.shadertoy.com/view/Xds3Rr
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = vUv;

    // the sound texture is 512x2
    int tx = int(uv.x*512.0);
    
	// first chan is frequency data (48Khz/4 in 512 texels, meaning 23 Hz per texel)
	float fft  = texelFetch( iAudioTexture, ivec2(tx,0), 0 ).x; 

    // second channel is the sound wave, one texel is one mono sample
    float wave = texelFetch( iAudioTexture, ivec2(tx,0), 0 ).y;

    // third channel is the amplitude history. first / leftmost texel is most recent RMS
    float amp = texelFetch( iAudioTexture, ivec2(tx,0), 0 ).z;
	
	// convert frequency to colors
	vec3 col = vec3( fft, 4.0*fft*(1.0-fft), 1.0-fft ) * fft * step(.5, uv.y);

    // add wave form on top	
	col += 1.0 -  smoothstep( 0.0, 0.005, abs(wave - uv.y) );

    // add amplitude bargraph
    col += step(uv.y, 0.5) * step(uv.y, amp) * vec3(1.0);
	
	// output final color
	fragColor = vec4(col,1.0);

    // fragColor = vec4(vec3(amp), 1.0);
}
 
void main() {  // if you want procedural textures, just pass UVs from default frag shader
  mainImage(gl_FragColor, gl_FragCoord.xy);
//   mainImage(gl_FragColor, vUv * iResolution.xy);
}
