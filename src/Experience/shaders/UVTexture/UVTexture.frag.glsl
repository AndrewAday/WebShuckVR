precision mediump float;

uniform sampler2D iUVTexture;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(iUVTexture, vUv);
}