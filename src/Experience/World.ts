import * as THREE from 'three';
import Experience from './Experience.js';
import ShaderMan from './shaders/ShaderMan.js';

// responsible for handling all scene mesh objects
export default class World {

	scene: THREE.Scene;
	shaderMan: ShaderMan;
	mesh: THREE.Mesh;

	constructor( scene : THREE.Scene ) {

		this.scene = scene; // threejs scene

		const geometry = new THREE.PlaneGeometry( 2, 2, 1, 1 );
		this.shaderMan = new ShaderMan( Experience.i.canvas );
		this.mesh = new THREE.Mesh( geometry, this.shaderMan.shaderMat );

		this.mesh.onBeforeRender = ( renderer, scene, camera, geometry, material, group ) => {

			// console.log( camera );

			this.shaderMan.update( Experience.i.time.elapsed, Experience.i.time.delta );

		};

		scene.add( this.mesh );
		this.mesh.position.set( 0, 0, 0 );

	}

	resourcesLoaded() {

		return;

	}

	update() {


		return;

	}

}
