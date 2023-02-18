
import { assert } from 'console';
import * as THREE from 'three';
// TODO: check out https://tympanus.net/codrops/2023/02/07/audio-reactive-shaders-with-three-js-and-shader-park/

// Implement DSP features found in:
// https://github.com/unconed/ThreeAudio.js/tree/master/src


export default class AudioManager {

	listener: THREE.AudioListener;
	out: THREE.Audio<GainNode>;
	audioLoader: THREE.AudioLoader;
	FFT_SIZE = 512;
	analyser: THREE.AudioAnalyser;
	rawDataArray: Uint8Array;
	audioTexture: THREE.DataTexture;
	width: number;
	height: number;
	size: number;
	color: THREE.Color;


	constructor( listenerSource: THREE.Object3D ) {

		this.listener = new THREE.AudioListener();
		listenerSource.add( this.listener );

		this.out = new THREE.Audio( this.listener );

		this.audioLoader = new THREE.AudioLoader();
		this.audioLoader.load(
			'./sounds/beatles-day.wav', ( buffer ) => {

				this.out.setBuffer( buffer );
				this.out.setLoop( true );
				this.out.setVolume( 0.5 );
				this.out.play();

			}
		);

		// analysis

		this.analyser = new THREE.AudioAnalyser( this.out, 2 * this.FFT_SIZE );
		// this.rawDataArray = new Uint8Array( 2 * this.FFT_SIZE );

		// prep data texture
		this.width = this.FFT_SIZE;
		this.height = 2;

		this.size = this.width * this.height;
		this.rawDataArray = new Uint8Array( 4 * this.size );
		const green = new THREE.Color( 0x00ff00 );
		const red = new THREE.Color( 0xff0000 );

		let r = 0;
		let g = 0;
		const b = 0;

		// example loading green then red
		for ( let i = 0; i < this.size; i ++ ) {

			const stride = i * 4;
			if ( i < this.size / 2 ) {

				g = 255;
				r = 0;

			} else {

				r = 255;
				g = 0;

			}

			this.rawDataArray[ stride ] = r;
			this.rawDataArray[ stride + 1 ] = g;
			this.rawDataArray[ stride + 2 ] = b;
			this.rawDataArray[ stride + 3 ] = 255;

		}


		// used the buffer to create a DataTexture
		this.audioTexture = new THREE.DataTexture( this.rawDataArray, this.width, this.height );
		this.audioTexture.needsUpdate = true;



		// TODO: fix shader aspect resizing

		// this.audioTexture.format = THREE.RGBAFormat,
		// this.audioTexture.minFilter = THREE.LinearFilter;
		// this.audioTexture.magFilter = THREE.LinearFilter;
		// this.audioTexture.mapping = THREE.UVMapping;
		// this.audioTexture.type = THREE.UnsignedByteType;


		// this.audioTexture = new THREE.DataTexture( this.rawDataArray, this.FFT_SIZE, 2, THREE.RGBfor );

		// const audioContext = new window.AudioContext();
		// const analyser = audioContext.createAnalyser();

	}

	_mergeArrays( arr1: Uint8Array, arr2: Uint8Array ) {

		return;

		console.assert( this.rawDataArray.length == arr1.length + arr2.length,
			`err, arrays are not same length ${this.rawDataArray.length} != ${arr1.length} + ${arr2.length}` );
		console.assert( arr1.length == arr2.length );

		this.rawDataArray.set( arr1 ); // fft first
		this.rawDataArray.set( arr2, arr1.length ); // then waveform

	}

	getAmplitude() {

	}



	update() {

		console.assert( this.FFT_SIZE == this.width );

		// analysis
		// this.analyser.
		const freq_data = this.analyser.getFrequencyData();

		const waveform_data = new Uint8Array( this.FFT_SIZE );
		this.analyser.analyser.getByteTimeDomainData( waveform_data );

		// used the buffer to create a DataTexture
		// the actual webaudio analyzer
		// this.analyser.analyser

		// load freq then waveform
		for ( let i = 0; i < this.size; i ++ ) {

			const stride = i * 4;
			if ( i < this.size / 2 ) { // first row fft

				this.rawDataArray[ stride ] = freq_data[ i ];

			} else { // second row waveform

				this.rawDataArray[ stride ] = waveform_data[ i - this.width ];

			}


			// TODO: can make more space efficient.
			// rn channels .yzw are unused
			// add amplitude history
			this.rawDataArray[ stride + 1 ] = 0;
			this.rawDataArray[ stride + 2 ] = 0;
			this.rawDataArray[ stride + 3 ] = 255;

		}

		// used the buffer to create a DataTexture
		this.audioTexture = new THREE.DataTexture( this.rawDataArray, this.width, this.height );
		this.audioTexture.needsUpdate = true;

		// this.audioTexture.source.data = this.rawDataArray;
		return;


		// this.audioTexture.image.data = this.rawDataArray;
		this.audioTexture.source.data = this.rawDataArray;
		this.audioTexture.needsUpdate = true;

		// console.log( this.audioTexture );

	}

}
