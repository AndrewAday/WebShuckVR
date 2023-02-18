/// <reference types="vite-plugin-glsl/ext" />

import * as THREE from 'three';
import * as dat from 'lil-gui';
import vertexShader from './default/vertex.glsl';
import fragmentShader from './test3D/test3D.frag.glsl';
import audioFragmentShader from './sound2D/sound2D.frag.glsl';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import Experience from '../Experience';

type ShaderUniforms = THREE.ShaderMaterialParameters[ 'uniforms' ]

export default class ShaderMan {

	shaderMat: THREE.ShaderMaterial;
	uniforms: ShaderUniforms;
	virtualCamera: THREE.Object3D;
	controls: FlyControls;
	debugFolder: dat.GUI;

	constructor( canvas: HTMLElement ) {

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
			iFlagTexture: { value: new THREE.Texture() }
		};

		this.shaderMat = new THREE.ShaderMaterial( {
			vertexShader,
			// fragmentShader: fragmentShader,
			fragmentShader: audioFragmentShader,
			uniforms: this.uniforms
		} );

		this.virtualCamera = new THREE.Object3D();
		this.controls = new FlyControls( this.virtualCamera as THREE.Camera, canvas );
		this.controls.movementSpeed = 5;
		this.controls.rollSpeed = Math.PI / 24;
		this.controls.dragToLook = true;

		// flag texture to debug
		const textureLoader = new THREE.TextureLoader();
		const flagTexture = textureLoader.load( './textures/uv-check.png' );
		this.uniforms.iFlagTexture.value = flagTexture;

		this.setDebug();


	}

	setDebug() {

		if ( ! Experience.inDebugMode() )
			return;

		this.debugFolder = Experience.debug.addFolder( "ShaderMan" );
		this.debugFolder.add( this.controls, 'movementSpeed' ).min( 0 ).max( 15 );
		this.debugFolder.add( this.controls, 'rollSpeed' ).min( 0 ).max( 1 );
		this.debugFolder.add( this.controls, 'dragToLook' );

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

	}



}
