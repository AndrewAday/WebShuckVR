/* Util imports */
import Sizes from './Utils/Sizes';
import Time from './Utils/Time';
import Camera from './Camera';
import Renderer from './Renderer';
import World from './World';
import AudioManager from './AudioManager';

import * as THREE from 'three';
import * as dat from 'lil-gui';
// import { VRButton } from 'three/addons/webxr/VRButton.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import Stats from 'three/examples/jsm/libs/stats.module';

// TODO: migrate to use https://threejs.org/docs/index.html?q=event#api/en/core/EventDispatcher
export default class Experience {

	static i: Experience;
	canvas: HTMLElement;
	sizes: Sizes;
	time: Time;
	scene: THREE.Scene;
	camera: Camera;
	renderer: Renderer;
	world: World;
	static debug?: dat.GUI;
	XREnabled = true;
	stats: Stats;
	audioMan?: AudioManager;
	urlParams: URLSearchParams;

	// static i;
	constructor( canvas: HTMLElement ) {

		// singleton...just to quickly prototype. can refactor later
		if ( Experience.i )
			return Experience.i;

		Experience.i = this;

		// get url params
		this.urlParams = new URLSearchParams( window.location.search );

		// window is the global javascript context. window is implicit. document is a field of window.
		// window.experience = this; // quality of life, allow access from debug console

		// Options
		this.canvas = canvas;

		// Setup utility classes
		this.sizes = new Sizes();
		this.time = new Time();
		if ( Experience.inDebugMode() && Experience.debug == undefined )
			Experience.debug = new dat.GUI();
		this.stats = Stats();
		document.body.appendChild( this.stats.dom );

		// THREE setup
		this.scene = new THREE.Scene();
		this.camera = new Camera( this.canvas, this.scene, 'ortho' );
		this.renderer = new Renderer( this.canvas, this.scene, this.camera.instance, this.XREnabled );
		if ( this.XREnabled )
			this.renderer.instance.setAnimationLoop( this.xrUpdate.bind( this ) );


		this.world = new World( this.scene );

		// Audio setup
		// TODO: want to dynamically attach to correct camera
		// can only trigger audio on user interaction
		this.canvas.addEventListener( 'click', ( e ) => {

			this.audioMan = new AudioManager( this.getActiveCamera() );

		}, { once: true } );


		// event listeners
		this.sizes.on( 'resize', this.resize.bind( this ) );

		if ( ! this.XREnabled ) { // use requestAnimationFrame when XR not supported disabled

			this.time.on( 'tick', () => {

				this.update();

			} );

		}

		if ( this.XREnabled ) {

			this.renderer.instance.xr.addEventListener( 'sessionstart', ( e ) => {

				console.log( e );

				this.renderer.instance.xr.getCamera().add( this.world.mesh );


			} );

			this.renderer.instance.xr.addEventListener( 'sessionend', ( e ) => {

				console.log( e );

				this.camera.instance.add( this.world.mesh );
				// this.world.mesh.position.set( 0, 0, 0 );

			} );

		}

	}

	static inDebugMode() {

		return window.location.hash === '#debug';

	}

	getActiveCamera(): THREE.Camera {

		if ( this.renderer.instance.xr.isPresenting ) {

			return this.renderer.instance.xr.getCamera();

		} else {

			return this.camera.instance;

		}

	}

	resize( width, height, pixelRatio ) {

		console.log( 'resize detected!' );
		// propagate events from Experience to other classes! E.g. don't listen for 'resize' event in Camera.
		// this allows for better encapsulation of other classes
		// Experience class handles the routing, controls order of execution
		this.camera.resize( width, height );
		this.renderer.resize( width, height, pixelRatio );

	}

	xrUpdate( time: DOMHighResTimeStamp, frame: XRFrame ) { // game loop for XR mode

		console.assert( this.XREnabled === true, `should not be running this xrUpdate() loop when XREnabled = ${this.XREnabled}` );
		// console.log( 'xrupdate()' );




		// get camera quat and position
		const camera = this.renderer.instance.xr.getCamera();
		const pos = camera.position;
		const quat = camera.quaternion.clone().invert();

		// TODO: try using arraycamera to update shader uniforms for virtualcamerapos and rot

		// add virtual camera, controllers to dolly
		// add mesh as child to camera
		// implement flying by moving the entire dolly, and
		// reporting camera global position to shader uniform

		// make camera parent of the shader mesh
		// resize mesh dynamically when re-parenting to fill screen
		// in shader, compute ray origin as sum localCamerapos + virtualCameraPos
		// should be ok since one will always be constant
		// do same for rotation

		// update virtual camera pos
		const shaderUniforms = this.world.shaderMan.uniforms;
		shaderUniforms.iVirtualCameraPos.value = pos;
		shaderUniforms.iVirtualCameraQuat.value = quat;

		// console.log( `Ivirtualcamerapos:` );
		// console.log( pos );
		// console.log( `Ivirtualcameraquat: ${quat}` );
		// console.log( quat );

		// update audio data texture
		if ( this.audioMan !== undefined ) {

			this.audioMan?.update();
			console.log( "updateing audio text" );
			shaderUniforms.iAudioTexture.value = this.audioMan.audioTexture;
			shaderUniforms.iVolume.value = this.audioMan.volume;

		}

		// console.log( this.world.mesh.material );




		this.stats.update();
		this.world.update();
		this.camera.update();

		this.renderer.update();

	}

	update() {

		console.assert( this.XREnabled === false, `should not be running this update loop when XREnabled = ${this.XREnabled}` );

		this.stats.update();
		this.world.update();
		this.camera.update();

		// always render last
		this.renderer.update();

	}

	destroy() {

		this.sizes.off( 'resize' ); // removes every listener for 'resize' event
		this.time.off( 'tick' );

		// free camera control object
		this.camera.controls.dispose();

		// free renderer
		this.renderer.instance.dispose();

		// free postprocessing effects (none rn)

		// free dat gui debug console
		// Experience.debug?.destroy();

		// Traverse the whole scene to free geometry and textures
		this.scene.traverse( ( child ) => {

			// Test if it's a mesh
			if ( child instanceof THREE.Mesh ) {

				child.geometry.dispose();

				// Loop through the material properties
				for ( const key in child.material ) {

					const value = child.material[ key ];

					// Test if there is a dispose function
					if ( value && typeof value.dispose === 'function' ) {

						value.dispose();

					}

				}

			}

		} );

	}

}
