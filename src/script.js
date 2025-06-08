import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
import Stats from 'stats.js';
import Car from './world/car';

var stats = new Stats();
stats.showPanel(0); // 0: fps
document.body.appendChild(stats.dom);

/**
 * Base
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xffffff, 10, 50);
scene.background = new THREE.Color(0xffffff);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
});
world.broadphase = new CANNON.SAPBroadphase(world);

const car = new Car(scene, world);
car.init();

/**
 * Lights
 */
const spotLight = new THREE.SpotLight(0xffffff, 100, 100, Math.PI / 2, 0.7);
spotLight.position.set(0, 97, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

/**
 * Floor
 */
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMesh = new THREE.Mesh(
    floorGeo,
    new THREE.MeshToonMaterial({ color: 0x454545 })
);
floorMesh.rotation.x = -Math.PI * 0.5;
scene.add(floorMesh);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({ mass: 0 });
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

/**
 * Camera
 */
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 10000);
camera.position.set(0, 2, -6);

/**
 * Orbit Controls
 * We will attach OrbitControls to the camera and the canvas.
 * The controls target will be updated every frame to the car's position.
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minPolarAngle = Math.PI / 4;  // Limit vertical rotation (avoid flipping)
controls.maxPolarAngle = Math.PI / 2;  // Look slightly downwards only
controls.enablePan = false;             // Disable panning to keep camera focused on car
controls.target.set(0, 1.5, 0);         // Initial target (will be updated every frame)

/**
 * Resize handling
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animation loop
 */
const timeStep = 1 / 60;
let lastCallTime;

const tick = () => {
    stats.begin();

    const time = performance.now() / 1000;
    if (!lastCallTime) {
        world.step(timeStep);
    } else {
        const dt = time - lastCallTime;
        world.step(timeStep, dt);
    }
    lastCallTime = time;

    if (car.car && car.car.chassisBody) {
        const pos = car.car.chassisBody.position;
        const quat = car.car.chassisBody.quaternion;

        // Update OrbitControls target to the car position plus height offset
        controls.target.set(pos.x, pos.y + 1.5, pos.z);

        // Optionally, limit camera distance (zoom)
        controls.minDistance = 6;
        controls.maxDistance = 8;

        // Update controls to apply changes
        controls.update();
    }

    renderer.render(scene, camera);
    stats.end();

    window.requestAnimationFrame(tick);
}

tick();
