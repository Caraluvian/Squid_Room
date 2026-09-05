import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xccc5cb);
scene.fog = new THREE.Fog(0xccc5cb, 15, 32);

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 80);
camera.position.set(3.0, 7.2, 14.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .78;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(3.0, 2.2, -0.8);
controls.enableDamping = true;
controls.minDistance = 7;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.48;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.42;

const room = new THREE.Group();
scene.add(room);
const YELLOW = 0xeee7dc;
const PURPLE = 0x9b899d;
const wallMat = new THREE.MeshStandardMaterial({ color: 0xb2a5b4, roughness: .92 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc4, roughness: .82 });
function box(size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.receiveShadow = true; mesh.castShadow = true; room.add(mesh); return mesh;
}
box([12, .28, 9], [0, -.14, 0], floorMat);
box([12, 6.5, .25], [0, 3.1, -4.45], wallMat);
box([.25, 6.5, 9], [-5.9, 3.1, 0], wallMat);

function makeWindow() {
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-1.9, 4.0, -4.29);
  windowGroup.userData.label = 'NIGHT WINDOW';
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x67596b, roughness: .5, metalness: .16 });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e8491,
    emissive: 0x665a6d,
    emissiveIntensity: .07,
    roughness: .18,
    metalness: .25
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.9), glassMaterial);
  glass.position.z = .015;
  windowGroup.add(glass);
  for (const [size, position] of [
    [[2.62,.13,.13],[0,1.02,.05]],
    [[2.62,.13,.13],[0,-1.02,.05]],
    [[.13,2.17,.13],[-1.25,0,.05]],
    [[.13,2.17,.13],[1.25,0,.05]],
    [[.08,1.92,.09],[0,0,.08]],
    [[2.36,.08,.09],[0,0,.08]]
  ]) {
    const framePart = new THREE.Mesh(new THREE.BoxGeometry(...size), frameMaterial);
    framePart.position.set(...position);
    framePart.castShadow = true;
    framePart.userData.root = windowGroup;
    windowGroup.add(framePart);
  }
  glass.userData.root = windowGroup;
  scene.add(windowGroup);
  return windowGroup;
}

function makeDesk() {
  const desk = new THREE.Group();
  desk.position.set(-4.7, 0, -1.35);
  desk.rotation.y = Math.PI / 2;
  desk.scale.set(1.25, 1.05, 1.7);
  desk.userData.label = 'EMPTY DESK';
  const wood = new THREE.MeshStandardMaterial({ color: 0xb99d83, roughness: .7 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xeee8e2, roughness: .66, metalness: .03 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x9b7e65, roughness: .54, metalness: .04 });

  function deskPart(geometry, material, position) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.root = desk;
    desk.add(mesh);
    return mesh;
  }

  deskPart(new RoundedBoxGeometry(3.7, .26, 1.45, 4, .11), wood, [0, 1.72, 0]);
  deskPart(new RoundedBoxGeometry(3.78, .09, 1.5, 3, .04), accent, [0, 1.84, 0]);
  deskPart(new RoundedBoxGeometry(.9, 1.55, 1.28, 4, .1), edge, [-1.35, .82, 0]);
  deskPart(new RoundedBoxGeometry(.15, 1.57, .16, 3, .05), edge, [1.5, .81, -.48]);
  deskPart(new RoundedBoxGeometry(.15, 1.57, .16, 3, .05), edge, [1.5, .81, .48]);

  for (const y of [.45, .82, 1.19]) {
    deskPart(new RoundedBoxGeometry(.6, .32, 1.31, 3, .06), new THREE.MeshStandardMaterial({ color: 0xeee8e2, roughness: .66 }), [-1.35, y, .02]);
    deskPart(new THREE.BoxGeometry(.08, .045, .28), accent, [-.96, y, .02]);
  }

  scene.add(desk);
  return desk;
}

scene.add(new THREE.HemisphereLight(0xf5efe8, 0x887f87, 1.55));
const key = new THREE.DirectionalLight(0xfff2df, 1.9); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const purpleLight = new THREE.PointLight(PURPLE, 4.5, 10); purpleLight.position.set(-4, 3.5, 2); scene.add(purpleLight);
const yellowLight = new THREE.PointLight(YELLOW, 5, 9); yellowLight.position.set(3, 3, -3); scene.add(yellowLight);
const windowGlow = new THREE.PointLight(0xb4a8b9, 1.8, 5); windowGlow.position.set(-1.55, 3.3, -3.8); scene.add(windowGlow);

const interactables = [];
interactables.push(makeWindow());
interactables.push(makeDesk());
const assetTag = document.querySelector('#assetTag');
const loadBar = document.querySelector('.loader i');
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
const phoneEmissiveMap = new THREE.TextureLoader().load('/models/sea-cucumber-phone/m_body_emm.png');
phoneEmissiveMap.colorSpace = THREE.SRGBColorSpace;
const assets = [
  { url: '/models/couch/Obj_Sofa.fbx', name: 'COUCH', pos: [2.75,.03,-3.2], scale: 4.4, rot: Math.PI / 3, againstBackWall: true, style: 'sofa' },
  { url: '/models/squid-cushion/Fig_SquidCushion00.fbx', name: 'YELLOW SQUID CUSHION', pos: [2.7,.82,-2.5], scale: .92, rot: -.28, rotX: -Math.PI / 2 },
  { url: '/models/tv/Obj_StaffRollTV.fbx', name: 'STAFF CREDITS TV', pos: [2.75,.03,2.2], scale: 2.9, rot: Math.PI, style: 'tv' },
  { url: '/models/marinas-laptop.glb', name: "MARINA'S LAPTOP", pos: [-5.05,1.95,-1.35], scale: 1.45, rot: Math.PI * 1.5, format: 'glb' },
  { url: '/models/sea-cucumber-phone/Fig_NamacoPhone.fbx', name: 'SEA-CUCUMBER PHONE', pos: [-5.05,1.95,0], scale: .68, rot: Math.PI * 2.7, style: 'phone' },
  { url: '/models/haikara-magazine.glb', name: 'HAIKARAWALKER MAGAZINE', pos: [-4.5,1.8,-2.9], scale: 1.1, rot: .9, rotX: Math.PI * 1.556 , format: 'glb' },
  { url: '/models/tall-coffee-to-go.glb', name: 'TALL COFFEE TO GO', pos: [-5.3,1.95,-2.5], scale: .62, rot: .4, format: 'glb' },
  { url: '/models/office-chair/scene.gltf', name: 'OFFICE CHAIR', pos: [-3.25,.03,-1.35], scale: 2.45, rot: Math.PI * 1.5, format: 'gltf' }
];

function fitAndPlace(object, item) {
  let bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const factor = item.scale / Math.max(size.x, size.y, size.z);
  // Preserve unit conversion already applied by format loaders (DAE commonly uses 0.01).
  object.scale.multiplyScalar(factor);
  if (item.rotX) {
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), item.rot);
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), item.rotX);
    object.quaternion.copy(yaw).multiply(tilt);
  } else {
    object.rotation.y = item.rot;
  }
  object.updateMatrixWorld(true);
  bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  object.position.add(new THREE.Vector3(item.pos[0] - center.x, item.pos[1] - bounds.min.y, item.pos[2] - center.z));
  object.updateMatrixWorld(true);
  if (item.againstBackWall) {
    bounds.setFromObject(object);
    object.position.z += -5.5 - bounds.min.z;
    object.updateMatrixWorld(true);
  }
  object.userData.label = item.name;
  object.traverse(child => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.root = object;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) continue;
      const materialName = material.name.toLowerCase();
      if (item.style === 'sofa') {
        if (materialName.includes('sofa')) {
          // The couch atlas contains both fabric and wooden arms. Use the
          // original gold pixels as a mask so each surface gets its own color.
          material.color.set(0xffffff);
          material.onBeforeCompile = shader => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_fragment>',
              `#ifdef USE_MAP
                vec4 sofaTexel = texture2D(map, vMapUv);
                float woodMask = smoothstep(0.10, 0.30, sofaTexel.r - sofaTexel.b);
                float fabricDetail = clamp(dot(sofaTexel.rgb, vec3(0.299, 0.587, 0.114)) * 2.8, 0.72, 1.08);
                vec3 fabricColor = vec3(0.435, 0.353, 0.471) * fabricDetail;
                vec3 woodColor = vec3(0.733, 0.584, 0.431);
                diffuseColor.rgb *= mix(fabricColor, woodColor, woodMask);
                diffuseColor.a *= sofaTexel.a;
              #endif`
            );
          };
          material.customProgramCacheKey = () => 'deep-mauve-sofa-light-oak-arms-v2';
          material.roughness = .72;
          material.metalness = 0;
        } else if (materialName.includes('hotaru')) {
          material.map = null;
          material.color.set(0xcfc3d1);
          material.roughness = .78;
          material.metalness = 0;
        } else if (materialName.includes('lambert')) {
          material.map = null;
          material.color.set(0xeee9e3);
          material.roughness = .8;
          material.metalness = 0;
        }
      }
      if (item.style === 'tv' && !materialName.includes('screen')) {
        material.map = null;
        material.color.set(0x54434d);
        material.roughness = .56;
        material.metalness = .06;
      } else if (item.style === 'tv' && materialName.includes('screen')) {
        material.color.set(0xf1e8ef);
        material.emissive.set(0x8c718e);
        material.emissiveIntensity = .55;
        material.roughness = .3;
        material.metalness = 0;
      }
      if (item.style === 'phone') {
        material.emissiveMap = phoneEmissiveMap;
        material.emissive.set(0xf5f4f2);
        material.emissiveIntensity = .85;
      }
      material.transparent = false;
      material.opacity = 1;
      material.alphaTest = 0;
      material.depthTest = true;
      material.depthWrite = true;
      material.side = THREE.FrontSide;
      material.needsUpdate = true;
    }
  });
  scene.add(object); interactables.push(object);
}

let loaded = 0;
function finishAssetLoad() {
  loaded++;
  loadBar.style.width = `${loaded / assets.length * 100}%`;
  if (loaded === assets.length) setTimeout(() => document.querySelector('.loader').classList.add('done'), 350);
}
assets.forEach(item => {
  const loader = item.format === 'glb' || item.format === 'gltf' ? gltfLoader : fbxLoader;
  loader.load(item.url, loadedAsset => {
  fitAndPlace(loadedAsset.scene || loadedAsset, item);
  finishAssetLoad();
  }, undefined, error => { console.error(`Could not load ${item.name}`, error); finishAssetLoad(); });
});

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
function animate() { requestAnimationFrame(animate); controls.update(); purpleLight.intensity = 4.25 + Math.sin(clock.getElapsedTime()*1.7) * .25; renderer.render(scene, camera); }
animate();
