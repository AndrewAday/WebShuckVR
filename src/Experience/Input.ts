// User Input helper class
import * as THREE from 'three';
export default class Input {

	controllers = [];
	renderer: THREE.WebGLRenderer;
	Lcontroller: THREE.XRTargetRaySpace;
	Rcontroller: THREE.XRTargetRaySpace;

	constructor( renderer: THREE.WebGLRenderer ) {

		this.renderer = renderer;
		if ( renderer.xr.enabled ) {

			this.Lcontroller = renderer.xr.getController( 0 );
			this.Rcontroller = renderer.xr.getController( 1 );

			this.controllers = [ this.Lcontroller, this.Rcontroller ];

		}
		// this.Lcontroller.addEventListener
		// renderer.xr.getCamera()

	}

	getControllerPos( controller: THREE.XRTargetRaySpace ) {

		const ray = new THREE.Raycaster();
		// ray.ray.origin.setFromMatrixPosition

	}

}
