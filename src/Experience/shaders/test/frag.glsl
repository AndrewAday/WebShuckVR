precision mediump float;

uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;
varying float vRandom;  // way to pass random attrib from js --> vertex shader --> frag shader
// alternatively, use a simplex noise generator from within frag shader, if not too expensive

void main() {
    // gl_FragColor = vec4(1.0, vRandom, abs(sin(uTime)), .4);
    // gl_FragColor = vec4(uColor, 1.0);
    vec4 texColor = texture2D(uTexture, vUv);
    texColor.rgb *= vElevation * 2.0 + 0.5;
    gl_FragColor = texColor;

    gl_FragColor = vec4(vUv, 0.0, 1.0);

}