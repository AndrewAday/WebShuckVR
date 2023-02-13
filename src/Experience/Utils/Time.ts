import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {

	start: number;
	current: number;
	elapsed: number;
	delta: number;

	constructor() {

		super();

		// Setup
		this.start = Date.now(); // start timestamp of Experience. constant
		this.current = this.start; // current timestamp. changes each frame
		this.elapsed = 0; // how much time since start
		this.delta = 16; // time since previous frame.

		window.requestAnimationFrame( () =>{

			this.tick();

		} );

	}

	tick() {

		const currentTime = Date.now();
		this.delta = currentTime - this.current;
		this.current = currentTime;
		this.elapsed = this.current - this.start;

		this.trigger( 'tick' );

		window.requestAnimationFrame( () => {

			this.tick();

		} );

	}

}
