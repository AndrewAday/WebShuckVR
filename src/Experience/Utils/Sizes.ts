import EventEmitter from "./EventEmitter";

export default class Sizes extends EventEmitter {

	width: number;
	height: number;
	pixelRatio: number;

	constructor() {

		super();

		// Setup
		this.updateSizeInfo();


		// event listener (observer pattern!)
		window.addEventListener( 'resize', () => { // arrow function to bind `this`

			this.updateSizeInfo();

		} );
		console.log( "constructed sizes" );

	}

	updateSizeInfo() {

		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.pixelRatio = Math.min( window.devicePixelRatio, 2 );
		this.trigger( 'resize', this.width, this.height, this.pixelRatio );

	}

}
