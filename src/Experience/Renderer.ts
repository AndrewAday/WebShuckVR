import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
// import { VRButton } from 'three/addons/webxr/VRButton.js';

import * as dat from 'lil-gui';
import Experience from './Experience.js';

export default class Renderer {

	canvas: HTMLElement;
	scene: THREE.Scene;
	camera: THREE.Camera;
	instance: THREE.WebGLRenderer;
	debugFolder?: dat.GUI;

	constructor(
		canvas: HTMLElement,
		scene: THREE.Scene,
		camera: THREE.Camera,
		enableXR: bool = false
	) {

		this.canvas = canvas;
		this.scene = scene;
		this.camera = camera;

		// webgl renderer setup
		this.instance = new THREE.WebGLRenderer( {
			canvas: this.canvas,
			antialias: true
		} );
		// renderer.autoClearColor = false;
		this.instance.physicallyCorrectLights = true;
		this.instance.outputEncoding = THREE.sRGBEncoding;
		this.instance.toneMapping = THREE.CineonToneMapping;
		this.instance.toneMappingExposure = 1.75;
		this.instance.shadowMap.enabled = true;
		this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
		this.instance.setSize( window.innerWidth, window.innerHeight );
		this.instance.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

		// xr config
		if ( enableXR ) {

			this.instance.xr.enabled = true;
			document.body.appendChild( VRButton.createButton( this.instance ) );

		}

		this.setDebug();

	}

	resize( width: number, height: number, pixelRatio: number ) {

		this.instance.setSize( width, height );
		this.instance.setPixelRatio( Math.min( pixelRatio, 2 ) );

	}

	update() {

		this.instance.render( this.scene, this.camera );

	}

	setDebug() {

		if ( ! Experience.inDebugMode() )
			return;


		this.debugFolder = Experience.debug.addFolder( 'renderer' );
		this.debugFolder.add( this.instance, 'toneMapping', {
			'NoToneMapping': THREE.NoToneMapping,
			'LinearToneMapping': THREE.LinearToneMapping,
			'ReinhardToneMapping': THREE.ReinhardToneMapping,
			'CineonToneMapping': THREE.CineonToneMapping,
			'ACESFilmicToneMapping': THREE.ACESFilmicToneMapping,
		} ).setValue( THREE.CineonToneMapping );

	}

}
