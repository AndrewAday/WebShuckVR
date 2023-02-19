
import { assert, debug } from 'console';
import * as THREE from 'three';
import Experience from './Experience';
import * as dat from 'lil-gui';
// import CBuffer from 'CBuffer';



// TODO: check out https://tympanus.net/codrops/2023/02/07/audio-reactive-shaders-with-three-js-and-shader-park/

// Implement DSP features found in:
// https://github.com/unconed/ThreeAudio.js/tree/master/src


export default class AudioManager {

	listener: THREE.AudioListener;
	out: THREE.Audio<GainNode>;
	audioLoader: THREE.AudioLoader;
	FFT_SIZE = 512;
	analyser: THREE.AudioAnalyser;
	rawDataArray: Uint8Array; // copied to dataTexture for shader input
	waveform: Uint8Array;
	fft: Uint8Array;
	audioTexture: THREE.DataTexture;
	width: number;
	height: number;
	size: number;
	color: THREE.Color;
	volume = 0;

	// amplitde hist params
	smoothing = 0;
	// amplitudeHistory: CBuffer<number>;
	amplitudeHistory: Uint8Array;
	_ampHistTail = 0; // insertion index (most recent amplitude reading)
	debugFolder: dat.GUI;


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

			}
		);

		// analysis
		this.analyser = new THREE.AudioAnalyser( this.out, 2 * this.FFT_SIZE );

		// prep amplitude hist buffer
		this.amplitudeHistory = new Uint8Array( this.FFT_SIZE );

		// prep data texture
		this.width = this.FFT_SIZE;
		this.height = 1;
		this.size = this.width * this.height;

		this.rawDataArray = new Uint8Array( 4 * this.size ); // * 4 for each channel rgba
		this.waveform = new Uint8Array( this.FFT_SIZE );
		this.fft = new Uint8Array( this.FFT_SIZE );

		// used the buffer to create a DataTexture
		this.audioTexture = new THREE.DataTexture( this.rawDataArray, this.width, this.height );
		this.audioTexture.needsUpdate = true;

		this.setDebug();

	}

	/* Calculates RMS amplitude
	References:
	- https://github.com/processing/p5.js-sound/blob/main/src/amplitude.js
	- https://stackoverflow.com/questions/21247571/how-to-get-microphone-input-volume-value-with-web-audio-api/51859377#51859377
	- TODO:
		- add normalization toggle
		- should this be done in webchuck instead? curious to compare performance
		- process in webaudioworklet node, on separate audio thread
			- https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode
	*/
	getAmplitude( waveform: Uint8Array ) {


		// TODO: really should be doing this work on audio thread...
		// also this algo is borked. how to calculate amplited from 8bit fixed point??
		// NOTE: scriptProcessorNode is depracated. use AudioWorkletNode instead

		// Do a root-mean-square on the samples: sum up the squares...
		let x = 0;
		let sum = 0;
		for ( let i = 0; i < waveform.length; i ++ ) {

			// NOTE: waveform is using fixed point, centered on 128 = 0
			x = ( waveform[ i ] - 128 ) / 128; // remap to [-1, 1]

			/* clip detection
			if ( Math.abs( x ) >= this.clipLevel ) {
			  this.clipping = true;
			  this.lastClip = window.performance.now();
			}
			*/

			// TODO: normalization would happen here

			sum += x * x;

		}

		// ... then take the square root of the sum.
		// + remap back to 8bit [0, 255]
		// adding extra math.sqrt to get larger values. jank.
		const rms = Math.sqrt( Math.sqrt( ( sum / waveform.length ) ) ) * 255;

		return rms;

	}


	// calls getAmplitude, stores in ringBuffer
	updateAmplitudeHistory() {

		// Now smooth this out with the averaging factor applied
		// to the previous sample - take the max here because we
		// want "fast attack, slow release."
		const rms = this.getAmplitude( this.waveform );
		// console.log( rms );
		this.volume = Math.max( this.getAmplitude( this.waveform ), this.volume * this.smoothing );
		console.log( this.volume );
		// console.log( this.waveform );

		// insert into ring buffer
		this.amplitudeHistory[ this._ampHistTail ] = this.volume;
		this._ampHistTail = ( 1 + this._ampHistTail ) % this.amplitudeHistory.length;

	}


	// fetches new audio data (fft, waveform, amplitude history) and updates data texture
	update() {

		console.assert( this.FFT_SIZE == this.width );

		// fetch new audio data
		this.analyser.analyser.getByteFrequencyData( this.fft );
		this.analyser.analyser.getByteTimeDomainData( this.waveform );
		this.updateAmplitudeHistory();

		// used the buffer to create a DataTexture

		// load freq then waveform
		for ( let i = 0; i < this.size; i ++ ) {

			const stride = i * 4;
			// r/x channel: fft
			this.rawDataArray[ stride ] = this.fft[ i ];
			// g/y channel: waveform
			this.rawDataArray[ stride + 1 ] = this.waveform[ i ];
			// b/z channel: amplitude history ( most recent volume first )
			this.rawDataArray[ stride + 2 ] = this.amplitudeHistory[ ( this._ampHistTail + 1 + i ) % this.amplitudeHistory.length ];
			// a channel: nothing
			this.rawDataArray[ stride + 3 ] = 255;

		}

		// used the buffer to create a DataTexture
		this.audioTexture = new THREE.DataTexture( this.rawDataArray, this.width, this.height );
		this.audioTexture.needsUpdate = true;
		// this.audioTexture.source.data = this.rawDataArray;

		// console.log( this.amplitudeHistory );

		return;

	}

	setDebug() {

		if ( ! Experience.inDebugMode() )
			return;

		const debugObj = {
			volume: this.out.getVolume(),
			playbackRate: this.out.getPlaybackRate()
		};

		this.debugFolder = Experience.debug.addFolder( "AudioManager" );
		this.debugFolder.add( debugObj, 'volume' ).min( 0 ).max( 2.0 ).step( .01 ).onChange( ( v: number ) => {

			this.out.setVolume( v );

		} );
		this.debugFolder.add( this.out, 'pause' );
		this.debugFolder.add( this.out, 'play' );
		this.debugFolder.add( this.out, 'stop' );
		this.debugFolder.add( debugObj, 'playbackRate' ).min( 0 ).max( 10 ).step( .01 ).onChange( ( rate:number ) => {

			this.out.setPlaybackRate( rate );

		} );

	}

}
