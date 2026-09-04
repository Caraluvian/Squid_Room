import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120f1c);
scene.fog = new THREE.Fog(0x120f1c, 13, 29);

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 80);
camera.position.set(10.8, 7.2, 12.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(1.2, 2.2, 0);
controls.enableDamping = true;
controls.minDistance = 7;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.48;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.42;

const room = new THREE.Group();
scene.add(room);
const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2433, roughness: .92 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x686270, roughness: .78 });
function box(size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.receiveShadow = true; mesh.castShadow = true; room.add(mesh); return mesh;
}
box([12, .28, 9], [0, -.14, 0], floorMat);
box([12, 6.5, .25], [0, 3.1, -4.45], wallMat);
box([.25, 6.5, 9], [-5.9, 3.1, 0], wallMat);
const platformMat = new THREE.MeshStandardMaterial({ color: 0x19151f, roughness: .58 });
box([4.8, .38, 2.6], [2.55, .18, -2.6], platformMat);
box([3.3, .35, 2.1], [-3.7, .16, 2.5], platformMat);

// Stylized ink pools anchor the imported props without pretending to be game assets.
const inkMat = new THREE.MeshStandardMaterial({ color: 0xff35b5, roughness: .32, metalness: .05 });
for (const [x,z,s] of [[2.4,-2.5,1.45],[-3.7,2.45,1.1],[.5,1.5,.7]]) {
  const pool = new THREE.Mesh(new THREE.CircleGeometry(s, 11), inkMat);
  pool.rotation.x = -Math.PI/2; pool.position.set(x,.025,z); room.add(pool);
}

scene.add(new THREE.HemisphereLight(0xb7c9ff, 0x32223e, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const pink = new THREE.PointLight(0xff3db8, 22, 10); pink.position.set(-4, 3.5, 2); scene.add(pink);
const lime = new THREE.PointLight(0xd8ff22, 18, 9); lime.position.set(3, 3, -3); scene.add(lime);

const interactables = [];
const assetTag = document.querySelector('#assetTag');
const loadBar = document.querySelector('.loader i');
const loader = new GLTFLoader();
const assets = [
  { url: '/models/arcade-game.glb', name: 'ARCADE GAME', pos: [2.5,.38,-2.65], scale: 2.3, rot: -.18 },
  { url: '/models/monkey-crab-cushion.glb', name: 'MONKEY-CRAB CUSHION', pos: [-3.75,.36,2.45], scale: 2.4, rot: .35 },
  { url: '/models/buckets.glb', name: 'BLUE / RED BUCKETS', pos: [.55,.05,1.45], scale: 1.6, rot: -.6 }
];

function fitAndPlace(object, item) {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const factor = item.scale / Math.max(size.x, size.y, size.z);
  object.scale.setScalar(factor);
  object.position.set(-center.x * factor + item.pos[0], -bounds.min.y * factor + item.pos[1], -center.z * factor + item.pos[2]);
  object.rotation.y = item.rot;
  object.userData.label = item.name;
  object.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; child.userData.root = object; } });
  scene.add(object); interactables.push(object);
}

let loaded = 0;
assets.forEach(item => loader.load(item.url, gltf => {
  fitAndPlace(gltf.scene, item);
  loaded++; loadBar.style.width = `${loaded / assets.length * 100}%`;
  if (loaded === assets.length) setTimeout(() => document.querySelector('.loader').classList.add('done'), 350);
}, undefined, error => { console.error(item.name, error); loaded++; }));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
addEventListener('pointermove', event => {
  pointer.x = event.clientX / innerWidth * 2 - 1; pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactables, true)[0];
  if (hit) { const root = hit.object.userData.root || hit.object; assetTag.textContent = root.userData.label; assetTag.style.display = 'block'; assetTag.style.left = `${event.clientX + 14}px`; assetTag.style.top = `${event.clientY + 14}px`; document.body.style.cursor = 'pointer'; }
  else { assetTag.style.display = 'none'; document.body.style.cursor = ''; }
});

document.querySelector('#enter').addEventListener('click', () => { document.querySelector('.intro').classList.add('hidden'); controls.autoRotate = false; });
renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const clock = new THREE.Clock();
function animate() { requestAnimationFrame(animate); controls.update(); pink.intensity = 20 + Math.sin(clock.getElapsedTime()*1.7)*2; renderer.render(scene, camera); }
animate();
