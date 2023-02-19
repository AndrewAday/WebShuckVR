import { IUniform, Shader, Texture, TextureLoader } from 'three';
import BaseShader from "./BaseShader";
import fragmentShader from "./UVTexture/UVTexture.frag.glsl";

export default class UVTextureShader extends BaseShader {

	static shaderName = 'UVTextureShader';
	uvTexture: Texture = new Texture();

	constructor() {

		super();

		// load texture
		// TODO: move inside uv texture shader
		// flag texture to debug
		const textureLoader = new TextureLoader();
		this.uvTexture = textureLoader.load( './textures/uv-check.png' );
		this.uniforms[ 'iUVTexture' ] = { value: this.uvTexture };

	}

	getFragShader(): string {

		return fragmentShader;

	}

	destroy( uniforms: ShaderUniforms ): void {

		super.destroy( uniforms );

		// free texture
		this.uvTexture.dispose();

		// remove uniform keys
		delete ( uniforms.iUVTexture );

	}

}
