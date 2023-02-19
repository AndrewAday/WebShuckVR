import BaseShader from "./BaseShader";
import fragmentShader from "./mandelbub/mandelbulb.frag.glsl";

export default class ChatGPTTerrainShader extends BaseShader {

	static shaderName = 'ChatGPTTerrainShader';

	getFragShader(): string {

		return fragmentShader;

	}

	setDebug(): void {

		super.setDebug();

		// set keys
		this.uniforms.maxIterations = { value: 250 };
		this.uniforms.maxDistance = { value: 1000.0 };
		this.uniforms.iVolScale = { value: .01 };

		this.debugFolder.add( this.uniforms.maxIterations, 'value' ).min( 0 ).max( 500 ).step( 1 ).name( "Raymarch max steps" );
		this.debugFolder.add( this.uniforms.maxDistance, 'value' ).min( 0 ).max( 1000 ).step( 1 ).name( 'far plane distance' );
		this.debugFolder.add( this.uniforms.iVolScale, 'value' ).min( 0 ).max( .1 ).step( .001 ).name( 'vol scale factor' );

	}

	destroy( uniforms: ShaderUniforms ): void {

		super.destroy( uniforms );

		// remove custom uniforms
		delete ( uniforms.maxIterations );
		delete ( uniforms.maxDistance );
		delete ( uniforms.iVolScale );

	}

}
