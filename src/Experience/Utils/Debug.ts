import * as dat from 'lil-gui';

export default class Debug {

	ui: dat.GUI;

	constructor() {

		if ( Debug.isActive() ) {

			this.ui = new dat.GUI();

		}

	}

	static isActive() {

		return window.location.hash === '#debug';

	}

}
