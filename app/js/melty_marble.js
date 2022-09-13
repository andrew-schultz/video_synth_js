// Option 1: Import the entire three.js core library.
import * as THREE from 'three';
// var THREE = require('three')


// const scene = new THREE.Scene();


// Option 2: Import just the parts you need.
// import { Scene } from 'three';

// const scene = new Scene();
//==================================
// import * as THREE from '../../node_modules/three/build/three.module.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();


// ========================

// function fbm(p) {
//     return vec3(
//         fractalNoise(p),
//         fractalNoise(p + 200),
//         0
//     )
// }
  
// let timer = time*0.01
// let p = enable2D()

// p = 0.5*vec3(p.x, p.y, 0) + 2 * (timer / 10)

// let composition = fbm( p + fbm( p + fbm( p )) ) *0.5+0.5


// color( composition )
  