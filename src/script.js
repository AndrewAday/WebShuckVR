// import Experience from "./Experience/Experience";
// console.log( "test" );


import * as THREE from 'three';
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
/* shader imports, vite-glsl plugin collects and returns as strings*/
import fragmentShader from './Experience/shaders/test3D/test3D.frag.glsl';
import Stats from 'three/examples/jsm/libs/stats.module';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObj = {
	tmp: 1,
	color: new THREE.Color( 'orange' )
};

const stats = Stats();
document.body.appendChild( stats.dom );

// Canvas
const canvas = document.querySelector( 'canvas.webgl' );

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load( './textures/flag-french.jpg' );

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry( 2, 2, 1, 1 );

// Shader uniforms

const uniforms = {
	iTime: { value: 0 },
	iResolution: { value: new THREE.Vector3(
		window.innerWidth, window.innerHeight, window.devicePixelRatio
	) },
	iCameraPos: { value: new THREE.Vector3() },
	iCameraQuat: { value: new THREE.Vector4() }
};

// Material
const shaderMat = new THREE.ShaderMaterial( {
	// verteaShader,
	fragmentShader,
	uniforms
} );

// gui.add( shaderMat.uniforms.uFrequency.value, 'x' ).min( 0 ).max( 20 ).step( 0.01 ).name( 'frequencyX' );
// gui.add( shaderMat.uniforms.uFrequency.value, 'y' ).min( 0 ).max( 20 ).step( 0.01 ).name( 'frequencyY' );
// gui.addColor( debugObj, 'color' );

// Mesh
const mesh = new THREE.Mesh( geometry, shaderMat );
scene.add( mesh );


// const box = new THREE.BoxGeometry( 1, 1, 1 );
// // const geometry = new THREE.SphereGeometry(1, 32, 32)
// // const geometry = new THREE.ConeGeometry(1, 1, 32)
// // const geometry = new THREE.TorusGeometry(1, 0.35, 32, 100)
// const material = new THREE.MeshBasicMaterial(
// );
// scene.add( new THREE.Mesh( box, material ) );

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

window.addEventListener( 'resize', () => {

	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize( sizes.width, sizes.height );
	renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

	// update shader uniforms
	uniforms.iResolution.value.set( sizes.width, sizes.height, window.devicePixelRatio );

} );

/**
 * Camera
 */
// Base camera
const camera = new THREE.OrthographicCamera(
	- 1, // left
	1, // right
	1, // top
	- 1, // bottom
	- 1, // near,
	1, // far
);



// const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 100 );
// camera.position.set( 0.25, - 0.25, 1 );
// scene.add( camera );

// Controls
// TODO: experiment with pointerlockcontrols

const virtualCamera = new THREE.Object3D();
const controls = new FlyControls( virtualCamera, canvas );
// controls.lock();
// controls.enableDamping = true;
controls.movementSpeed = 5;
controls.rollSpeed = Math.PI / 24;
controls.dragToLook = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer( {
	canvas: canvas,
	antialias: true
} );
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.autoClearColor = false;

/**
 * Animate
 */
const clock = new THREE.Clock();

// update shader uniforms
mesh.onBeforeRender = ( renderer, scene, camera, geometry, material, group ) => {

	// update uniforms here
	uniforms.iTime.value = clock.getElapsedTime();
	uniforms.iCameraPos.value = controls.object.position;
	uniforms.iCameraQuat.value = controls.object.quaternion.clone().invert();

};

let lastTime = 0;
const tick = () => {

	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - lastTime;
	lastTime = elapsedTime;

	if ( typeof controls.update === 'function' )
	    controls.update( deltaTime );

	stats.update();

	// Render
	renderer.render( scene, camera );

	// console.log( controls.object.getWorldPosition( new THREE.Vector3() ) );
	// console.log( controls.object.getWorldDirection( new THREE.Vector3() ) );

	// Call tick again on the next frame
	window.requestAnimationFrame( tick );

};

tick();
