import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14051f);
scene.fog = new THREE.Fog(0x14051f, 13, 29);

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
const YELLOW = 0xceb121;
const PURPLE = 0x9025c6;
const wallMat = new THREE.MeshStandardMaterial({ color: 0x29143a, roughness: .92 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x51485a, roughness: .78 });
function box(size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.receiveShadow = true; mesh.castShadow = true; room.add(mesh); return mesh;
}
box([12, .28, 9], [0, -.14, 0], floorMat);
box([12, 6.5, .25], [0, 3.1, -4.45], wallMat);
box([.25, 6.5, 9], [-5.9, 3.1, 0], wallMat);
// Stylized ink pools anchor the imported props without pretending to be game assets.
const yellowInk = new THREE.MeshStandardMaterial({ color: YELLOW, roughness: .28, metalness: .04 });
const purpleInk = new THREE.MeshStandardMaterial({ color: PURPLE, roughness: .28, metalness: .04 });
for (const [x,z,s,material] of [[2.4,-2.5,1.45,purpleInk],[-3.7,2.45,1.1,yellowInk],[.5,1.5,.7,purpleInk],[-2.2,-2.25,1.25,yellowInk]]) {
  const pool = new THREE.Mesh(new THREE.CircleGeometry(s, 11), material);
  pool.rotation.x = -Math.PI/2; pool.position.set(x,.025,z); room.add(pool);
}

scene.add(new THREE.HemisphereLight(0xb7c9ff, 0x32223e, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const purpleLight = new THREE.PointLight(PURPLE, 24, 10); purpleLight.position.set(-4, 3.5, 2); scene.add(purpleLight);
const yellowLight = new THREE.PointLight(YELLOW, 22, 9); yellowLight.position.set(3, 3, -3); scene.add(yellowLight);

const interactables = [];
const assetTag = document.querySelector('#assetTag');
const loadBar = document.querySelector('.loader i');
const loader = new ColladaLoader();
const assets = [
  { url: '/models/couch/Obj_Sofa.dae', name: 'COUCH', pos: [-.65,.03,2.25], scale: 4.4, rot: Math.PI * .92 },
  { url: '/models/tv/Obj_StaffRollTV.dae', name: 'STAFF CREDITS TV', pos: [2.65,.03,-2.65], scale: 2.9, rot: -.08 },
  { url: '/models/music-selector/Obj_LobbyMusicSelecter.dae', name: 'LOBBY MUSIC SELECTOR', pos: [4.5,.03,-1.7], scale: 2.2, rot: -.42 }
];

function fitAndPlace(object, item) {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const factor = item.scale / Math.max(size.x, size.y, size.z);
  // Preserve unit conversion already applied by format loaders (DAE commonly uses 0.01).
  object.scale.multiplyScalar(factor);
  object.position.set(-center.x * factor + item.pos[0], -bounds.min.y * factor + item.pos[1], -center.z * factor + item.pos[2]);
  object.rotation.y = item.rot;
  object.userData.label = item.name;
  object.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; child.userData.root = object; } });
  scene.add(object); interactables.push(object);
}

let loaded = 0;
function finishAssetLoad() {
  loaded++;
  loadBar.style.width = `${loaded / assets.length * 100}%`;
  if (loaded === assets.length) setTimeout(() => document.querySelector('.loader').classList.add('done'), 350);
}
assets.forEach(item => loader.load(item.url, collada => {
  fitAndPlace(collada.scene, item);
  finishAssetLoad();
}, undefined, error => { console.error(`Could not load ${item.name}`, error); finishAssetLoad(); }));

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
function animate() { requestAnimationFrame(animate); controls.update(); purpleLight.intensity = 22 + Math.sin(clock.getElapsedTime()*1.7)*2; renderer.render(scene, camera); }
animate();
