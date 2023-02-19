import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Experience from './Experience.js';

type CameraType = 'ortho' | 'perspective';

export default class Camera {

	scene: THREE.Scene;
	canvas: HTMLElement;
	instance: THREE.Camera;
	controls?: OrbitControls;



	constructor( canvas: HTMLElement, scene: THREE.Scene, ctype: CameraType = 'perspective' ) {

		this.scene = scene;
		this.canvas = canvas;

		if ( ctype == 'ortho' )
			this.setInstanceOrtho();
		else if ( ctype == 'perspective' ) {

			this.setInstancePerspective();
			this.setControls();

		}

	}

	setInstanceOrtho() {

		this.instance = new THREE.OrthographicCamera(
			- 1, // left
			1, // right
			1, // top
			- 1, // bottom
			- 1, // near,
			1, // far
		);

	}

	setInstancePerspective() {

		this.instance = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.instance.position.set( 6, 4, 8 );
		this.scene.add( this.instance );

	}

	setControls() {

		this.controls = new OrbitControls( this.instance, this.canvas );
		this.controls.enableDamping = true;

	}

	resize( width: number, height: number ) {

		if ( this.instance instanceof THREE.PerspectiveCamera ) {

			console.log( 'persp cam resize' );

			this.instance.aspect = width / height;
			this.instance.updateProjectionMatrix();

		} else if ( this.instance instanceof THREE.OrthographicCamera ) {

			// TODO also need to resize shader geometry

			// don't do this, just update the iResolution uniform.
			// const aspect = width / height;
			// this.instance.left = - aspect;
			// this.instance.right = aspect;
			// this.instance.updateProjectionMatrix();

		}

	}

	update() {

		this.controls?.update(); // to apply damping

	}

}
