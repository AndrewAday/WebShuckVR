import * as THREE from 'three';
import BaseShader from "./BaseShader";
import fragmentShader from "./test3D/test3D.frag.glsl";

export default class Test3DShader extends BaseShader {

	static shaderName = 'Test3DShader';

	getFragShader(): string {

		return fragmentShader;

	}

	setDebug(): void {

		super.setDebug();

		// set keys
		this.uniforms.MAX_MARCHING_STEPS = { value: 155 };
		this.uniforms.MAX_DIST = { value: 250.0 };
		this.uniforms.COLOR_AMBIENT = { value: new THREE.Color( 0x612700 ) };
		//X11 color name - all 140 color names are supported.
		this.uniforms.COLOR_BACKGROUND = { value: new THREE.Color( 'skyblue' ) };
		this.uniforms.iVolScale = { value: .01 };
		this.uniforms.iVolDisplace = { value: .01 };

		this.debugFolder.add( this.uniforms.MAX_MARCHING_STEPS, 'value' ).min( 0 ).max( 500 ).step( 1 ).name( "Raymarch max steps" );
		this.debugFolder.add( this.uniforms.MAX_DIST, 'value' ).min( 0 ).max( 1000 ).step( 1 ).name( 'far plane distance' );
		this.debugFolder.add( this.uniforms.iVolScale, 'value' ).min( 0 ).max( .1 ).step( .001 ).name( 'vol scale factor' );
		this.debugFolder.add( this.uniforms.iVolDisplace, 'value' ).min( 0 ).max( .1 ).step( .001 ).name( 'vol perturb factor' );
		this.debugFolder.addColor( this.uniforms.COLOR_AMBIENT, 'value' ).name( 'ambient light color' );
		this.debugFolder.addColor( this.uniforms.COLOR_BACKGROUND, 'value' ).name( 'background color' );

	}

	destroy( uniforms: ShaderUniforms ): void {

		super.destroy( uniforms );

		// remove custom uniforms
		delete ( uniforms.MAX_MARCHING_STEPS );
		delete ( uniforms.MAX_DIST );
		delete ( uniforms.COLOR_AMBIENT );
		delete ( uniforms.COLOR_BACKGROUND );
		delete ( uniforms.iVolScale );
		delete ( uniforms.iVolDisplace );

	}

}
