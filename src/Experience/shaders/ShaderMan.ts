/// <reference types="vite-plugin-glsl/ext" />

import * as THREE from 'three';
import * as dat from 'lil-gui';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import Experience from '../Experience';
import BaseShader from './BaseShader';
import ShaderFactory from './ShaderFactory';

// shaders
import UVShader from './UVShader';


export default class ShaderMan {

	shaderMat: THREE.ShaderMaterial;
	uniforms: ShaderUniforms;
	virtualCamera: THREE.Object3D;
	controls: FlyControls;
	debugFolder: dat.GUI;
	activeShader: BaseShader;

	constructor( canvas: HTMLElement, shaderName = ShaderFactory.ShaderTypes[ 0 ].shaderName ) {

		this.activeShader = ShaderFactory.GetShader( shaderName );

		// uniforms shader by all shaders
		this.uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector3(
				window.innerWidth, window.innerHeight, window.devicePixelRatio
			) },
			iCameraPos: { value: new THREE.Vector3() },
			iCameraQuat: { value: new THREE.Vector4() },
			iVirtualCameraPos: { value: new THREE.Vector3() },
			iVirtualCameraQuat: { value: new THREE.Vector4() },
			iAudioTexture: { value: new THREE.Texture() },
			iVolume: { value: 0.0 }
		};

		// mat shared by all shaders
		this.shaderMat = new THREE.ShaderMaterial( {
			vertexShader: this.activeShader.getVertShader(),
			fragmentShader: this.activeShader.getFragShader(),
			// vertexShader: vertexShader,
			// fragmentShader: fragmentShader,
			uniforms: this.uniforms
		} );

		// imaginary camera controls
		this.virtualCamera = new THREE.Object3D();
		this.controls = new FlyControls( this.virtualCamera as THREE.Camera, canvas );
		this.controls.movementSpeed = 5;
		this.controls.rollSpeed = Math.PI / 24;
		this.controls.dragToLook = true;

		this.setDebug();

	}

	swapShader( shaderName: string ) {

		console.log( 'swapping to' + shaderName );

		const newShader = ShaderFactory.GetShader( shaderName );

		if ( newShader === undefined ) return;

		this.activeShader.destroy( this.uniforms );
		this.activeShader = newShader;

		// swap out shaders
		this.shaderMat.vertexShader = this.activeShader.getVertShader();
		this.shaderMat.fragmentShader = this.activeShader.getFragShader();
		this.shaderMat.needsUpdate = true;

		console.log( "swapped" );

	}

	setDebug() {

		if ( ! Experience.inDebugMode() )
			return;

		const debugObj = {
			activeShader: this.activeShader.getName()
		};

		this.debugFolder = Experience.debug.addFolder( "ShaderMan" );
		this.debugFolder.add( this.controls, 'movementSpeed' ).min( 0 ).max( 15 );
		this.debugFolder.add( this.controls, 'rollSpeed' ).min( 0 ).max( 1 );
		this.debugFolder.add( this.controls, 'dragToLook' );

		// shader switching
		this.debugFolder.add( debugObj, 'activeShader', ShaderFactory.ShaderTypes.map( ( st ) => st.shaderName ) ).onChange(
			( shaderName ) => this.swapShader( shaderName )
		);


	}

	// updates shader uniforms and virtual camera pos
	update( time: number, deltaTime: number ) {

		// convert to ms
		time /= 1000.0;
		deltaTime /= 1000.0;

		// console.log( "updating param" );
		// console.log( this.controls.object.position );

		this.uniforms.iTime.value = time;
		this.uniforms.iCameraPos.value.copy( this.controls.object.position );
		// TODO can optimize by not creating new quat instance each frame
		this.uniforms.iCameraQuat.value = this.controls.object.quaternion.clone().invert();
		this.controls.update( deltaTime );

		// update window resolution
		this.uniforms.iResolution.value = new THREE.Vector3(
			window.innerWidth, window.innerHeight, window.devicePixelRatio
		),

		// update shader-specific params
		this.activeShader.updateUniforms( this.uniforms );

		// console.log( this.uniforms );

	}



}
