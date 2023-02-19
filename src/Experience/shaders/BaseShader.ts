import vertexShader from './default/vertex.glsl';
import * as dat from 'lil-gui';
import Experience from '../Experience';
import { Shader } from 'three';

// base class for shader implementations
export default abstract class BaseShader {

	static shaderName = 'BaseShader';
	debugFolder: dat.GUI;
	uniforms: ShaderUniforms = {};

	// might regret this tight coupling later...
	constructor() {

		this.setDebug();
		console.log( 'set debug' );

		// inheriting classes should load texture dependencies here

	}

	getName() { // hack to access static member from obj instance

    	const shaderType = <typeof BaseShader> this.constructor;
		return shaderType.shaderName;

	}


	getVertShader() {

    	return vertexShader;

	}
    abstract getFragShader(): string;

    // add custom shader uniforms
    updateUniforms( uniforms: THREE.ShaderMaterialParameters['uniforms'] ) {

    	// copy local uniforms dict into shaderman
    	for ( const [ k, v ] of Object.entries( this.uniforms ) ) {

    		if ( k in uniforms ) {

    			uniforms[ k ].value = v.value;

    		} else {

    			uniforms[ k ] = { value: v.value };

    		}

    	}


    }


    // add debug params to gui
    setDebug() {

    	if ( ! Experience.inDebugMode() )
    		return;

    	// use to get static field from child type in parent type
    	const shaderType = <typeof BaseShader> this.constructor;
    	this.debugFolder = Experience.debug.addFolder( shaderType.shaderName );

    }

    destroy( uniforms: ShaderUniforms ) {

    	this.debugFolder?.destroy();
    	// inheriting classes should:
    	// - free textures
    	// - remove custom params from uniforms object

    }



}
