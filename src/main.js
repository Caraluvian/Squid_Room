import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
const INK_BLACK = 0x17131d;
const wallMat = new THREE.MeshStandardMaterial({ color: 0x29143a, roughness: .92 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x51485a, roughness: .78 });
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
const yellowInk = new THREE.MeshStandardMaterial({ color: YELLOW, roughness: .28, metalness: .04 });
const purpleInk = new THREE.MeshStandardMaterial({ color: PURPLE, roughness: .28, metalness: .04 });
for (const [x,z,s,material] of [[2.4,-2.5,1.45,purpleInk],[-3.7,2.45,1.1,yellowInk],[.5,1.5,.7,purpleInk],[-2.2,-2.25,1.25,yellowInk]]) {
  const pool = new THREE.Mesh(new THREE.CircleGeometry(s, 11), material);
  pool.rotation.x = -Math.PI/2; pool.position.set(x,.025,z); room.add(pool);
}

const charcoal = new THREE.MeshStandardMaterial({ color: INK_BLACK, roughness: .62, metalness: .22 });
const pale = new THREE.MeshStandardMaterial({ color: 0xe8e2d5, roughness: .72 });
const yellowMat = new THREE.MeshStandardMaterial({ color: YELLOW, roughness: .46 });
const purpleMat = new THREE.MeshStandardMaterial({ color: PURPLE, roughness: .42 });
const screenMat = new THREE.MeshStandardMaterial({ color: PURPLE, emissive: PURPLE, emissiveIntensity: 2.2, roughness: .2 });

function part(parent, geometry, material, position, rotation = [0,0,0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.root = parent; parent.add(mesh); return mesh;
}

function makeDesk() {
  const desk = new THREE.Group(); desk.position.set(-2.25, 0, -3.15); desk.rotation.y = .02; desk.userData.label = 'INKWORK DESK';
  part(desk, new THREE.BoxGeometry(4.3,.22,1.65), pale, [0,2.15,0]);
  part(desk, new THREE.BoxGeometry(4.45,.12,1.72), yellowMat, [0,2.31,0]);
  for (const x of [-1.82,1.82]) for (const z of [-.58,.58]) part(desk, new THREE.BoxGeometry(.13,2.12,.13), charcoal, [x,1.07,z], [0,0,x*.025]);
  scene.add(desk); return desk;
}

function makeComputer() {
  const computer = new THREE.Group(); computer.position.set(-2.2, 2.33, -3.18); computer.userData.label = 'SQUID TERMINAL';
  part(computer, new THREE.BoxGeometry(1.72,1.12,.18), charcoal, [0,.72,0]);
  part(computer, new THREE.PlaneGeometry(1.45,.84), screenMat, [0,.73,.101]);
  part(computer, new THREE.CylinderGeometry(.08,.11,.48,8), charcoal, [0,.02,0]);
  part(computer, new THREE.BoxGeometry(.78,.08,.46), charcoal, [0,-.2,.08]);
  part(computer, new THREE.BoxGeometry(1.5,.08,.48), pale, [0,-.25,.63], [-.08,0,0]);
  part(computer, new THREE.BoxGeometry(.52,1.28,1.06), charcoal, [1.55,.4,.18]);
  part(computer, new THREE.BoxGeometry(.55,.18,1.09), purpleMat, [1.55,.74,.18]);
  scene.add(computer); return computer;
}

function makeChair() {
  const chair = new THREE.Group(); chair.position.set(-2.2,0,-1.38); chair.rotation.y = Math.PI; chair.userData.label = 'BATTLE CHAIR';
  part(chair, new THREE.BoxGeometry(1.35,.22,1.25), purpleMat, [0,1.45,0], [-.08,0,0]);
  part(chair, new THREE.BoxGeometry(1.38,1.7,.22), yellowMat, [0,2.25,.52], [-.18,0,0]);
  part(chair, new THREE.CylinderGeometry(.1,.1,1.15,8), charcoal, [0,.82,0]);
  part(chair, new THREE.CylinderGeometry(.08,.08,1.7,8), charcoal, [0,.25,0], [0,0,Math.PI/2]);
  for (const x of [-.78,.78]) part(chair, new THREE.CylinderGeometry(.12,.12,.18,10), charcoal, [x,.12,0], [Math.PI/2,0,0]);
  scene.add(chair); return chair;
}

scene.add(new THREE.HemisphereLight(0xb7c9ff, 0x32223e, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const purpleLight = new THREE.PointLight(PURPLE, 24, 10); purpleLight.position.set(-4, 3.5, 2); scene.add(purpleLight);
const yellowLight = new THREE.PointLight(YELLOW, 22, 9); yellowLight.position.set(3, 3, -3); scene.add(yellowLight);

const interactables = [];
interactables.push(makeDesk(), makeComputer(), makeChair());
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
function animate() { requestAnimationFrame(animate); controls.update(); purpleLight.intensity = 22 + Math.sin(clock.getElapsedTime()*1.7)*2; renderer.render(scene, camera); }
animate();
