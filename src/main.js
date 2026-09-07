import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8d3d8);
scene.fog = new THREE.Fog(0xd8d3d8, 15, 32);

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 80);
camera.position.set(3.0, 7.2, 14.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .84;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#app').appendChild(renderer.domElement);

const environmentGenerator = new THREE.PMREMGenerator(renderer);
const metalEnvironment = environmentGenerator.fromScene(new RoomEnvironment(), .04).texture;
environmentGenerator.dispose();

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
const PURPLE = 0x9b899d;
const wallMat = new THREE.MeshStandardMaterial({ color: 0xc0b4c1, roughness: .92 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe1dbd2, roughness: .82 });
function box(size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.receiveShadow = true; mesh.castShadow = true; room.add(mesh); return mesh;
}
box([12, .28, 9], [0, -.14, 0], floorMat);
// Build the back wall around the window so transparent glass reveals outdoors.
box([2.78, 6.5, .25], [-4.61, 3.1, -4.45], wallMat);
box([6.58, 6.5, .25], [2.71, 3.1, -4.45], wallMat);
box([2.64, 3.065, .25], [-1.9, 1.3825, -4.45], wallMat);
box([2.64, 1.265, .25], [-1.9, 5.7175, -4.45], wallMat);
box([.25, 6.5, 9], [-5.9, 3.1, 0], wallMat);

const inkopolisTexture = new THREE.TextureLoader().load('/textures/inkopolis-square.png');
inkopolisTexture.colorSpace = THREE.SRGBColorSpace;
const inkopolisBackdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(2.5, 2.17),
  new THREE.MeshBasicMaterial({ map: inkopolisTexture, transparent: true, alphaTest: .02, fog: false })
);
inkopolisBackdrop.position.set(-2, 3.9, -4.7);
scene.add(inkopolisBackdrop);

function makeWindow() {
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-1.9, 4.0, -4.29);
  windowGroup.userData.label = 'NIGHT WINDOW';
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x67596b, roughness: .5, metalness: .16 });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xcce9f4,
    roughness: .06,
    metalness: 0,
    transparent: true,
    opacity: .16,
    depthWrite: false
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
  desk.position.set(-4.7, 0, -1.7);
  desk.rotation.y = Math.PI / 2;
  desk.scale.set(1.2, 1.05, 1.7);
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

function makeDeskShelf() {
  const shelf = new THREE.Group();
  shelf.position.set(-5.55, 3.42, 2);
  shelf.userData.label = 'TWO-TIER SHELF';
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0xc88d52,
    roughness: .62,
    metalness: .02
  });

  function shelfPart(size, position) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 4, .045), shelfMaterial);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.root = shelf;
    shelf.add(mesh);
  }

  // Two floating rows, with compact wall brackets below each ledge.
  shelfPart([.62, .12, 2.65], [0, 0, 0]);
  shelfPart([.62, .12, 2.65], [0, .9, 0]);
  for (const y of [-.24, .66]) {
    shelfPart([.12, .48, .12], [-.24, y, -.95]);
    shelfPart([.12, .48, .12], [-.24, y, .95]);
  }

  scene.add(shelf);
  return shelf;
}

function makeSofaShelf() {
  const shelf = new THREE.Group();
  shelf.position.set(2.75, 3.55, -4.14);
  shelf.userData.label = 'SOFA DISPLAY SHELF';
  const wood = new THREE.MeshStandardMaterial({
    color: 0xc89a70,
    roughness: .68,
    metalness: .01
  });

  function shelfPart(size, position) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 4, .045), wood);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.root = shelf;
    shelf.add(mesh);
  }

  shelfPart([3.25, .14, .65], [0, 0, 0]);
  shelfPart([.14, .42, .14], [-1.08, -.22, -.22]);
  shelfPart([.14, .42, .14], [1.08, -.22, -.22]);
  scene.add(shelf);
  return shelf;
}

function makeCorkBoardArt() {
  const artwork = new THREE.Group();
  artwork.position.set(-5.54, 3.82, -2.65);
  artwork.rotation.y = Math.PI / 2;

  artwork.userData.label = 'CORK BOARD ART';

  const border = new THREE.Mesh(
    new THREE.PlaneGeometry(.78, .78),
    new THREE.MeshStandardMaterial({ color: 0xf4eee8, roughness: .82 })
  );
  artwork.add(border);

  const texture = new THREE.TextureLoader().load('/textures/cork-board-art.jpeg');
  texture.colorSpace = THREE.SRGBColorSpace;
  const print = new THREE.Mesh(
    new THREE.PlaneGeometry(.7, .71),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  print.position.z = .006;
  artwork.add(print);

  artwork.traverse(child => {
    if (!child.isMesh) return;
    child.userData.root = artwork;
  });
  scene.add(artwork);
  return artwork;
}

function makeSofaWallPhoto() {
  const photo = new THREE.Group();
  photo.position.set(5.15, 4.48, -4.2);
  photo.scale.setScalar(.85);
  photo.userData.label = 'SPLATOON EXHIBIT PHOTO';
  const texture = new THREE.TextureLoader().load('/textures/splatoon-exhibit-photo.jpeg');
  texture.colorSpace = THREE.SRGBColorSpace;
  const print = new THREE.Mesh(
    new THREE.PlaneGeometry(.89, 1.58),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  print.position.z = .025;
  print.userData.root = photo;
  photo.add(print);

  const gold = new THREE.MeshStandardMaterial({
    color: 0xb29445,
    roughness: .38,
    metalness: .38
  });
  for (const [size, position] of [
    [[.97, .035, .025], [0, .81, .04]],
    [[.97, .035, .025], [0, -.81, .04]],
    [[.035, 1.655, .025], [-.465, 0, .04]],
    [[.035, 1.655, .025], [.465, 0, .04]]
  ]) {
    const trim = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, .008), gold);
    trim.position.set(...position);
    trim.castShadow = true;
    trim.userData.root = photo;
    photo.add(trim);
  }
  scene.add(photo);
  return photo;
}

const hemisphereLight = new THREE.HemisphereLight(0xfffaf4, 0x918891, 1.68); scene.add(hemisphereLight);
const key = new THREE.DirectionalLight(0xfff5e8, 2.05); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const purpleLight = new THREE.PointLight(PURPLE, 4.5, 10); purpleLight.position.set(-4, 3.5, -1.5); scene.add(purpleLight);
const shelfLight = new THREE.PointLight(0xffffff, 2.25, 4.5, 2); shelfLight.position.set(-4.35, 4.65, 2); scene.add(shelfLight);
const windowGlow = new THREE.PointLight(0xb4a8b9, 1.8, 5); windowGlow.position.set(-1.55, 3.3, -3.8); scene.add(windowGlow);
const subWeaponLight = new THREE.PointLight(0xd8b7ef, 2.5, 6.5, 2); subWeaponLight.position.set(3.2, 1.8, 3.25); scene.add(subWeaponLight);
const tvFillLight = new THREE.PointLight(0xeee5f5, 8, 6.5, 1.5); tvFillLight.position.set(2.75, 2.35, .45); scene.add(tvFillLight);

const roomLights = [hemisphereLight, key, purpleLight, shelfLight, windowGlow, subWeaponLight, tvFillLight];
const roomLightIntensities = roomLights.map(light => light.intensity);
const roomLightSlider = document.querySelector('#roomLight');
const roomLightValue = document.querySelector('#roomLightValue');
roomLightSlider.addEventListener('input', () => {
  const level = Number(roomLightSlider.value);
  const scales = [
    .25 + level * .75, // Keep ambient fill restrained to preserve surface color.
    level,             // The main ceiling light carries most of the adjustment.
    .55 + level * .45,
    .8 + level * .2,
    .8 + level * .2,
    .8 + level * .2,
    .8 + level * .2
  ];
  roomLights.forEach((light, index) => { light.intensity = roomLightIntensities[index] * scales[index]; });
  roomLightValue.value = `${Math.round(level * 100)}%`;
});

const interactables = [];
interactables.push(makeWindow());
interactables.push(makeDesk());
interactables.push(makeDeskShelf());
interactables.push(makeSofaShelf());
interactables.push(makeCorkBoardArt());
interactables.push(makeSofaWallPhoto());
const assetTag = document.querySelector('#assetTag');
const loadBar = document.querySelector('.loader i');
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
const colladaLoader = new ColladaLoader();
let musicPropObject = null;
let musicPropRestPosition = null;
const musicPropMaterials = [];
const phoneEmissiveMap = new THREE.TextureLoader().load('/models/sea-cucumber-phone/m_body_emm.png');
phoneEmissiveMap.colorSpace = THREE.SRGBColorSpace;
const goldenEggEmissiveMap = new THREE.TextureLoader().load('/models/golden-egg-s2/M_CoopIkuraDrop_Core_Emm.png');
goldenEggEmissiveMap.colorSpace = THREE.SRGBColorSpace;
const newspaperAlphaMap = new THREE.TextureLoader().load('/models/newspaper/M_body_Opa.png');
const yellowTicketColorMap = new THREE.TextureLoader().load('/models/lobby-ticket/M_ticket_Alb.0.png');
yellowTicketColorMap.colorSpace = THREE.SRGBColorSpace;
const yellowTicketNormalMap = new THREE.TextureLoader().load('/models/lobby-ticket/M_Ticket_Nrm.0.png');
const yellowTicketRoughnessMap = new THREE.TextureLoader().load('/models/lobby-ticket/M_ticket_Rgh.0.png');
const seaSnailEmissiveMap = new THREE.TextureLoader().load('/models/super-sea-snails-s3/Turbanshell00_Emm.png');
seaSnailEmissiveMap.colorSpace = THREE.SRGBColorSpace;
const eliterColorMap = new THREE.TextureLoader().load('/models/eliter-4k-scope/M_Body_Alb.png');
eliterColorMap.colorSpace = THREE.SRGBColorSpace;
const eliterNormalMap = new THREE.TextureLoader().load('/models/eliter-4k-scope/M_Body_Nrm.png');
const eliterRoughnessMap = new THREE.TextureLoader().load('/models/eliter-4k-scope/M_Body_Rgh.png');
const eliterMetalnessMap = new THREE.TextureLoader().load('/models/eliter-4k-scope/M_Body_Mtl.png');
const eliterAoMap = new THREE.TextureLoader().load('/models/eliter-4k-scope/M_Body_Ao.png');
eliterAoMap.channel = 0;
const reefsliderBodyTeamMap = new THREE.TextureLoader().load('/models/reefslider/M_Body_Tcl.png');
const reefsliderBottleTeamMap = new THREE.TextureLoader().load('/models/reefslider/M_Bottle_Tcl.png');
const autobombTeamMap = new THREE.TextureLoader().load('/models/sub-weapons/autobomb/M_Body_Tcl.png');
const curlingBombTeamMap = new THREE.TextureLoader().load('/models/sub-weapons/curling-bomb/M_Body_Tcl.png');
const octagramStarEmissiveMap = new THREE.TextureLoader().load('/models/octagram-star/WallLightSteel_Emm.png');
octagramStarEmissiveMap.colorSpace = THREE.SRGBColorSpace;
const assets = [
  { url: '/models/couch/Obj_Sofa.fbx', name: 'COUCH', pos: [2.75,.03,-3.2], scale: 4.4, rot: Math.PI / 3, againstBackWall: true, style: 'sofa' },
  { url: '/models/eliter-4k-scope/Wmn_Charger_LongScope.fbx', name: 'E-LITER 4K SCOPE', pos: [2.75,3.64,-4.08], scale: 3, rot: Math.PI / 2, style: 'eliter', tankStretch: 1.16 },
  { url: '/models/photo-frame/scene.gltf', name: 'SPLATOON PHOTO FRAME', pos: [5.15,3.77,-4.2], scale: 1.51, scaleX: .92, scaleY: .68, rot: 0, localRotZ: Math.PI / 2, format: 'gltf', style: 'photoFrame' },
  { url: '/models/squid-cushion/Fig_SquidCushion00.fbx', name: 'YELLOW SQUID CUSHION', pos: [2.7,.82,-2.5], scale: .92, rot: -.28, rotX: -Math.PI / 2, style: 'yellowDecor' },
  { url: '/models/zapfish/Obj_Namazu.fbx', name: 'YELLOW ZAPFISH', pos: [-5.43,4.41,1.8], scale: 1, rot: Math.PI / 2, originalColor: true },
  { url: '/models/clam/Obj_Clam_A.fbx', name: 'CLAM', pos: [-5.43,4.41,1.3], scale: .52, rot: Math.PI / 2, originalColor: true },
  { url: '/models/cereal/Fig_CerealBox00.fbx', name: 'CEREAL — COLOR 1', pos: [-5.43,4.41,2.6], scale: .36, rot: Math.PI / 2, originalColor: true },
  { url: '/models/cereal-01/Fig_CerealBox00.fbx', name: 'CEREAL — COLOR 2', pos: [-5.43,4.41,2.88], scale: .36, rot: Math.PI / 2, originalColor: true },
  { url: '/models/cereal-02/Fig_CerealBox00.fbx', name: 'CEREAL — COLOR 3', pos: [-5.43,4.41,3.16], scale: .36, rot: Math.PI / 2, originalColor: true },
  { url: '/models/sardinium-gray/Obj_WeaponParts.fbx', name: 'GRAY SARDINIUM', pos: [-5.43,4.41,2.2], scale: .52, rot: Math.PI / 2, originalColor: true },
  // { url: '/models/mr-grizz/Obj_KumasanRadio.fbx', name: 'MR. GRIZZ', pos: [-5.43,3.51,1.18], scale: .9, rot: Math.PI / 2, style: 'mrGrizz', originalColor: true },
  { url: '/models/maries-boombox/Obj_IdolBoombox.fbx', name: "MARIE'S BOOM BOX", pos: [-5.43,3.51,1.18], scale: .68, rot: Math.PI / 2, style: 'musicPlayer', originalColor: true },
  { url: '/models/super-sea-snails/Obj_PlazaTurbanshells.dae', name: 'SUPER SEA SNAILS', pos: [-5.43,3.51,2], scale: .62, rot: Math.PI / 2, format: 'dae', originalColor: true },
  { url: '/models/golden-egg-s2/Obj_CoopIkuraDrop.fbx', name: 'GOLDEN EGG', pos: [-5.43,3.51,2.78], scale: .62, rot: Math.PI / 2, style: 'goldenEgg', originalColor: true },
  { url: '/models/power-egg-pack/Obj_Sphere10.fbx', name: 'POWER EGG PACK', pos: [-5.43,3.51,2], scale: .6, rot: Math.PI / 2, originalColor: true },
  { url: '/models/splatoon-guitars/Obj_VenueGuitarBass.fbx', name: 'OCTOSLAPPER QX-2 BASS', pos: [-5.15,.03,1.15], scale: 2.6, rot: Math.PI /2, geometrySide: -1, originalColor: true },
  // { url: '/models/dynamo-roller/Wmn_Roller_Heavy.fbx', name: 'DYNAMO ROLLER', pos: [-5.12,.03,3], scale: 2.4, rot: Math.PI * .5, localRotX: -.16, localRotZ: Math.PI, originalColor: true },
  { url: '/models/super-sea-snails-s3/Obj_PlazaTurbanshellCase.fbx', name: 'SUPER SEA SNAILS CASE', pos: [-5.12,.03,3], scale: 2.2, rot: Math.PI / 2, style: 'seaSnailsS3', originalColor: true },
  { url: '/models/splatoon-guitars/Obj_VenueGuitarBass.fbx', name: 'SQUIDSHREDDER GUITAR', pos: [4.55,.03,-3.25], scale: 2.6, rot: Math.PI * 2, geometrySide: 1, originalColor: true },
  // { url: '/models/sub-weapons/autobomb/Wsb_Bomb_Robo.fbx', name: 'AUTOBOMB', pos: [1.45,.03,1.8], scale: 1, rot: Math.PI - .35, style: 'subWeapon', tint: 0xf065dd, teamMaps: { m_body: autobombTeamMap }, originalColor: true },
  // { url: '/models/reefslider/Wsp_SkewerTackle.fbx', name: 'REEFSLIDER', pos: [2.75,.03,3.5], scale: 2.8, rot: Math.PI * .5, style: 'subWeapon', tint: 0x6668d9, teamMaps: { m_body: reefsliderBodyTeamMap, m_bottle: reefsliderBottleTeamMap }, originalColor: true },
  // { url: '/models/sub-weapons/curling-bomb/Wsb_Bomb_Curling.fbx', name: 'CURLING BOMB', pos: [4.05,.03,1.8], scale: 1.1, rot: .35, style: 'subWeapon', tint: 0xf065dd, teamMaps: { m_body: curlingBombTeamMap }, originalColor: true },
  // { url: '/models/octagram-star/Obj_DeliDebli_Star.fbx', name: 'OCTAGRAM STAR', pos: [1.45,.03,1.8], scale: 1, rot: -.35, style: 'octagramStar', originalColor: true },
  { url: '/models/octagram-star/Obj_DeliDebli_Star.fbx', name: 'OCTAGRAM STAR', pos: [2.05,.03,2.9], scale: 1, rot: .48, style: 'octagramStar', originalColor: true },
  { url: '/models/octagram-star/Obj_DeliDebli_Star.fbx', name: 'OCTAGRAM STAR', pos: [3.45,.03,2.9], scale: 1, rot: -.58, style: 'octagramStar', originalColor: true },
  // { url: '/models/octagram-star/Obj_DeliDebli_Star.fbx', name: 'OCTAGRAM STAR', pos: [4.05,.03,1.8], scale: 1, rot: .3, style: 'octagramStar', originalColor: true },
  { url: '/models/tv/Obj_StaffRollTV.fbx', name: 'STAFF CREDITS TV', pos: [2.75,.03,2.2], scale: 2.9, rot: Math.PI, style: 'tv' },
  { url: '/models/little-salmon/scene.gltf', name: 'SMALLFRY', pos: [2.4,1.9,1.9], scale: .78, rot: Math.PI * .85, format: 'gltf' },
  { url: '/models/marinas-laptop.glb', name: "MARINA'S LAPTOP", pos: [-5.05,1.95,-1.35], scale: 1.45, rot: Math.PI * 1.5, format: 'glb' },
  { url: '/models/sea-cucumber-phone/Fig_NamacoPhone.fbx', name: 'SEA-CUCUMBER PHONE', pos: [-5.05,1.95,0], scale: .68, rot: Math.PI * 2.7, style: 'phone' },
  { url: '/models/haikara-magazine.glb', name: 'HAIKARAWALKER MAGAZINE', pos: [-4.3,1.8,-2.9], scale: 1.1, rot: .9, rotX: Math.PI * 1.556 , format: 'glb' },
  { url: '/models/tall-coffee-to-go.glb', name: 'TALL COFFEE TO GO', pos: [-5.3,1.95,-2.5], scale: .62, rot: .4, format: 'glb' },
  { url: '/models/desk-lamp/scene.gltf', name: 'DESK LAMP', pos: [-5.2,1.92,-3.45], scale: 1.35, rot: -.7, format: 'gltf' },
  { url: '/models/office-chair/scene.gltf', name: 'OFFICE CHAIR', pos: [-3.25,.03,-1.5], scale: 2.45, rot: Math.PI * 1.5, format: 'gltf' },
  { url: '/models/cork-board/scene.gltf', name: 'CORK BOARD', pos: [-5.68,3.25,-2], scale: 2.8, rot: 0, format: 'gltf' },
  { url: '/models/squid-charm/Fig_StrapInkFish.fbx', name: 'SQUID CELLIE CHARM', pos: [-5.55,4.3,-2.8], scale: .7, rot: Math.PI / 2, originalColor: true },
  { url: '/models/octo-charm/Fig_StrapOctopus.fbx', name: 'OCTO CELLIE CHARM', pos: [-5.55,4.3,-2.2], scale: .7, rot: Math.PI / 2, originalColor: true },
  { url: '/models/agent3-drawing/Obj_SketchAgent3_Octa.fbx', name: 'AGENT 3 DRAWING', pos: [-5.55,3.4,-1.35], scale: .95, rot: Math.PI / 2, style: 'agentDrawing', originalColor: true },
  { url: '/models/lobby-ticket/Obj_TicketLob.fbx', name: 'YELLOW LOBBY TICKET', pos: [-5.4,4.25,-1.25], scale: .82, rot: Math.PI / 2, style: 'yellowTicket', originalColor: true },
  // { url: '/models/newspaper/Obj_Newspaper.fbx', name: 'NEWSPAPER', pos: [-5.55,4,-1.25], scale: .9, rot: Math.PI * .5, rotX: Math.PI / 2, localRotY: -Math.PI / 2, style: 'newspaper', originalColor: true }
];

function keepGeometrySide(object, side) {
  object.traverse(child => {
    if (!child.isMesh || !child.geometry.attributes.position) return;
    const source = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry;
    const position = source.attributes.position;
    const keptVertices = [];
    for (let index = 0; index < position.count; index += 3) {
      const centerX = (position.getX(index) + position.getX(index + 1) + position.getX(index + 2)) / 3;
      if (centerX * side > 0) keptVertices.push(index, index + 1, index + 2);
    }
    if (!keptVertices.length) {
      child.visible = false;
      return;
    }
    const geometry = new THREE.BufferGeometry();
    for (const [name, attribute] of Object.entries(source.attributes)) {
      const values = new attribute.array.constructor(keptVertices.length * attribute.itemSize);
      keptVertices.forEach((sourceIndex, targetIndex) => {
        for (let component = 0; component < attribute.itemSize; component++) {
          values[targetIndex * attribute.itemSize + component] = attribute.array[sourceIndex * attribute.itemSize + component];
        }
      });
      geometry.setAttribute(name, new THREE.BufferAttribute(values, attribute.itemSize, attribute.normalized));
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    child.geometry = geometry;
  });
}

function fitAndPlace(object, item) {
  if (item.geometrySide) keepGeometrySide(object, item.geometrySide);
  if (item.style === 'eliter' && item.tankStretch) {
    object.traverse(child => {
      if (!child.isMesh || !child.geometry.attributes.position) return;
      child.geometry = child.geometry.clone();
      const position = child.geometry.attributes.position;
      const tankStart = .08;
      for (let index = 0; index < position.count; index++) {
        const alongWeapon = position.getY(index);
        const height = position.getZ(index);
        if (alongWeapon > tankStart && height > -.12) {
          position.setY(index, tankStart + (alongWeapon - tankStart) * item.tankStretch);
        }
      }
      position.needsUpdate = true;
      child.geometry.computeVertexNormals();
      child.geometry.computeBoundingBox();
      child.geometry.computeBoundingSphere();
    });
  }
  if (item.style === 'agentDrawing') {
    object.traverse(child => {
      if (!child.isMesh) return;
      child.visible = child.name.startsWith('Paper__') || child.name.startsWith('Tape');
    });
  }
  let bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const factor = item.scale / Math.max(size.x, size.y, size.z);
  // Preserve unit conversion already applied by format loaders (DAE commonly uses 0.01).
  object.scale.multiplyScalar(factor);
  if (item.scaleX) object.scale.x *= item.scaleX;
  if (item.scaleY) object.scale.y *= item.scaleY;
  if (item.rotX || item.standVertical) {
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), item.rot);
    const tilt = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      item.standVertical ? -Math.PI / 2 : item.rotX
    );
    object.quaternion.copy(yaw).multiply(tilt);
    if (item.localRotY) {
      const localYaw = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        item.localRotY
      );
      object.quaternion.multiply(localYaw);
    }
  } else {
    object.rotation.y = item.rot;
  }
  if (item.localRotX) {
    const localTilt = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      item.localRotX
    );
    object.quaternion.multiply(localTilt);
  }
  if (item.localRotZ) {
    const localRoll = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      item.localRotZ
    );
    object.quaternion.multiply(localRoll);
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
  if (item.style === 'musicPlayer') {
    object.userData.musicPlayer = true;
    musicPropObject = object;
    musicPropRestPosition = object.position.clone();
  }
  object.traverse(child => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.root = object;
    if (item.style === 'eliter') {
      const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
      const pbrMaterials = sourceMaterials.map(source => new THREE.MeshPhysicalMaterial({
        name: source?.name || 'E-liter PBR',
        map: eliterColorMap,
        normalMap: eliterNormalMap,
        roughnessMap: eliterRoughnessMap,
        roughness: .68,
        metalnessMap: eliterMetalnessMap,
        metalness: .86,
        aoMap: eliterAoMap,
        aoMapIntensity: .8,
        envMap: metalEnvironment,
        envMapIntensity: .65,
        clearcoat: .24,
        clearcoatRoughness: .34,
        vertexColors: source?.vertexColors ?? true,
        side: source?.side ?? THREE.FrontSide
      }));
      child.material = Array.isArray(child.material) ? pbrMaterials : pbrMaterials[0];
    }
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) continue;
      const materialName = (material.name || '').toLowerCase();
      if (item.style === 'photoFrame' && materialName.includes('material.001')) {
        material.map = null;
        material.color.set(0x49362f);
        material.roughness = .58;
        material.metalness = .04;
      }
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
        material.color.set(0x685b78);
        material.roughness = .56;
        material.metalness = .06;
      } else if (item.style === 'tv' && materialName.includes('screen')) {
        material.color.set(0xe6d5e2);
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
      if (item.style === 'yellowDecor' && material.map) {
        material.color.setRGB(1.12, 1.08, .96);
        if (material.emissive) {
          material.emissiveMap = material.map;
          material.emissive.set(0xc4ac7c);
          material.emissiveIntensity = .32;
        }
      }
      if (item.originalColor && material.map) material.color.set(0xffffff);
      if (item.style === 'musicPlayer') {
        material.color.multiplyScalar(1.08);
        if (material.map && material.emissive) {
          material.emissiveMap = material.map;
          material.emissive.set(0x725d73);
          material.emissiveIntensity = .24;
          musicPropMaterials.push(material);
        }
      }
      if (item.style === 'subWeapon') {
        const inkTint = new THREE.Color(item.tint);
        const tintVector = `${inkTint.r.toFixed(3)}, ${inkTint.g.toFixed(3)}, ${inkTint.b.toFixed(3)}`;
        const teamColorMap = item.teamMaps?.[materialName];
        if (material.map && teamColorMap) {
          material.color.set(0xffffff);
          material.onBeforeCompile = shader => {
            shader.uniforms.teamColorMap = { value: teamColorMap };
            shader.fragmentShader = `uniform sampler2D teamColorMap;\n${shader.fragmentShader}`;
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_fragment>',
              `#ifdef USE_MAP
                vec4 weaponTexel = texture2D(map, vMapUv);
                float weaponLuma = dot(weaponTexel.rgb, vec3(0.299, 0.587, 0.114));
                float teamMask = texture2D(teamColorMap, vMapUv).r;
                vec3 inkColor = vec3(${tintVector}) * mix(0.52, 1.08, weaponLuma);
                weaponTexel.rgb = mix(weaponTexel.rgb, inkColor, teamMask * 0.82);
                diffuseColor *= weaponTexel;
              #endif`
            );
          };
          material.customProgramCacheKey = () => `sub-weapon-tcl-${item.tint.toString(16)}`;
        }
      }
      if (item.style === 'yellowTicket') {
        material.map = yellowTicketColorMap;
        material.normalMap = yellowTicketNormalMap;
        material.roughnessMap = yellowTicketRoughnessMap;
        material.color.set(0xffffff);
      }
      if (item.style === 'seaSnailsS3' && materialName.includes('turbanshell')) {
        material.emissiveMap = seaSnailEmissiveMap;
        material.emissive.set(0xffffff);
        material.emissiveIntensity = .2;
      }
      if (item.style === 'octagramStar') {
        material.emissiveMap = octagramStarEmissiveMap;
        material.emissive.set(0xffffff);
        material.emissiveIntensity = .45;
      }
      if (item.style === 'newspaper') {
        material.alphaMap = newspaperAlphaMap;
        material.transparent = true;
        material.opacity = 1;
        material.alphaTest = .16;
        material.side = THREE.DoubleSide;
        material.depthWrite = true;
      } else if (item.style === 'goldenEgg' && !materialName.includes('core')) {
        // Keep the round outer shell, but let the fish-shaped core show through.
        material.transparent = true;
        material.opacity = .52;
        material.alphaTest = 0;
        material.side = THREE.DoubleSide;
        material.depthWrite = false;
        material.roughness = .22;
      } else {
        material.transparent = false;
        material.opacity = 1;
        material.alphaTest = 0;
        material.side = THREE.FrontSide;
        material.depthWrite = true;
        if (item.style === 'goldenEgg' && materialName.includes('core')) {
          material.emissiveMap = goldenEggEmissiveMap;
          material.emissive.set(0xffffff);
          material.emissiveIntensity = .22;
        }
      }
      material.depthTest = true;
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
  const loader = item.format === 'glb' || item.format === 'gltf'
    ? gltfLoader
    : item.format === 'dae' ? colladaLoader : fbxLoader;
  let completed = false;
  const complete = () => {
    if (completed) return;
    completed = true;
    clearTimeout(timeout);
    finishAssetLoad();
  };
  const timeout = setTimeout(() => {
    console.error(`Timed out while loading ${item.name}`);
    complete();
  }, 12000);
  loader.load(item.url, loadedAsset => {
    try {
      fitAndPlace(loadedAsset.scene || loadedAsset, item);
    } catch (error) {
      console.error(`Could not place ${item.name}`, error);
    } finally {
      complete();
    }
  }, undefined, error => {
    console.error(`Could not load ${item.name}`, error);
    complete();
  });
});

const musicPanel = document.querySelector('#musicPanel');
const musicFiles = document.querySelector('#musicFiles');
const trackList = document.querySelector('#trackList');
const musicPlay = document.querySelector('#musicPlay');
const musicProgress = document.querySelector('#musicProgress');
const musicCurrent = document.querySelector('#musicCurrent');
const musicDuration = document.querySelector('#musicDuration');
const musicFavorites = document.querySelector('#musicFavorites');
const audioPlayer = new Audio();
audioPlayer.volume = Number(document.querySelector('#musicVolume').value);
const builtInTrackFiles = [
  ['Anarchy Rainbow', 'Anarchy Rainbow.mp3'],
  ['Anarchy Rainbow (Alt)', 'Anarchy Rainbow__.mp3'],
  ['Bear With Me', 'Bear With Me_.mp3'],
  ['Blop Bop', 'Blop Bop__.mp3'],
  ['Calamari Inkantation 3MIX', 'Calamari Inkantation 3MIX__.mp3'],
  ['City of Color', 'City of Color.mp3'],
  ['Color Pulse (2024)', 'Color Pulse (2024)_.mp3'],
  ['Daybreaker Anthem', 'Daybreaker Anthem__.mp3'],
  ['Deepers Creepers', 'Deepers Creepers__.mp3'],
  ['Dressed to Krill', 'Dressed to Krill__.mp3'],
  ['Drip Feed', 'Drip Feed__.mp3'],
  ['Fresh Start', 'Fresh Start_.mp3'],
  ['Fuzzy Dazzler', 'Fuzzy Dazzler.mp3'],
  ['Fuzzy Dazzler (Alt)', 'Fuzzy Dazzler__.mp3'],
  ['Gilded Cage', 'Gilded Cage__.mp3'],
  ['Heliocentri City', 'Heliocentri City__.mp3'],
  ['Inkopolis Plaza — Grizzco Jingle', 'Inkopolis Plaza - Grizzco Jingle_.mp3'],
  ['Into the Light (After-Fest Mix)', 'Into the Light (After-Fest Mix)_.mp3'],
  ['Liquid Sunshine', 'Liquid Sunshine__.mp3'],
  ["Lobby — Crab 'n' Go (FrostyFest)", "Lobby - Crab 'n' Go (FrostyFest)__.mp3"],
  ["Lobby — Crab 'n' Go (SpringFest)", "Lobby - Crab 'n' Go (SpringFest)_.mp3"],
  ['Maritime Memory', 'Maritime Memory.mp3'],
  ['Meadowlark', 'Meadowlark_.mp3'],
  ["Pop 'n' Schlock", "Pop 'n' Schlock__.mp3"],
  ['Pour It On', 'Pour It On__.mp3'],
  ['Short Order', 'Short Order_.mp3'],
  ['Sinkopated', 'Sinkopated__.mp3'],
  ['Splatsville — Lobby (SpringFest)', 'Splatsville - Lobby (SpringFest)_.mp3'],
  ['Three Wishes (Main Stage)', 'Three Wishes (Main Stage)_.mp3'],
  ["Tomorrow's Nostalgia Today", "Tomorrow's Nostalgia Today__.mp3"],
  ['Wave Goodbye', 'Wave Goodbye.mp3'],
  ["We're So Back", "We're So Back_.mp3"],
  ['GF Live — Spicy Calamari Inkantation', '~GF Live~ Spicy Calamari Inkantation_.mp3']
];
const builtInTracks = builtInTrackFiles.map(([name, file]) => ({
  name,
  url: encodeURI(`/audio/mr-grizz/${file}`),
  objectUrl: false
}));
let musicTracks = [...builtInTracks];
let currentTrack = -1;
let favoriteOnly = false;
let favoriteTrackNames = new Set();
try {
  favoriteTrackNames = new Set(JSON.parse(localStorage.getItem('squid-room-favorite-tracks') || '[]'));
} catch {
  favoriteTrackNames = new Set();
}

function saveFavorites() {
  try {
    localStorage.setItem('squid-room-favorite-tracks', JSON.stringify([...favoriteTrackNames]));
  } catch {
    // Favorites still work for this session when persistent storage is blocked.
  }
}

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function updateTrackList() {
  trackList.replaceChildren();
  const visibleTracks = musicTracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => !favoriteOnly || favoriteTrackNames.has(track.name));
  if (!visibleTracks.length) {
    const empty = document.createElement('li');
    empty.className = 'track-empty';
    empty.textContent = favoriteOnly ? 'No favorite tracks yet' : 'No tracks selected';
    trackList.appendChild(empty);
    return;
  }
  visibleTracks.forEach(({ track, index }) => {
    const row = document.createElement('li');
    row.classList.toggle('active', index === currentTrack);
    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'track-select';
    select.textContent = `${String(index + 1).padStart(2, '0')}  ${track.name}`;
    select.addEventListener('click', () => loadTrack(index, true));
    const favorite = document.createElement('button');
    const isFavorite = favoriteTrackNames.has(track.name);
    favorite.type = 'button';
    favorite.className = `track-favorite${isFavorite ? ' active' : ''}`;
    favorite.textContent = isFavorite ? '♥' : '♡';
    favorite.setAttribute('aria-label', `${isFavorite ? 'Remove' : 'Add'} ${track.name} ${isFavorite ? 'from' : 'to'} favorites`);
    favorite.setAttribute('aria-pressed', String(isFavorite));
    favorite.addEventListener('click', () => {
      if (favoriteTrackNames.has(track.name)) favoriteTrackNames.delete(track.name);
      else favoriteTrackNames.add(track.name);
      saveFavorites();
      updateTrackList();
    });
    row.append(select, favorite);
    trackList.appendChild(row);
  });
}

function loadTrack(index, autoplay = false) {
  if (!musicTracks.length) return;
  currentTrack = (index + musicTracks.length) % musicTracks.length;
  audioPlayer.src = musicTracks[currentTrack].url;
  audioPlayer.load();
  updateTrackList();
  if (autoplay) audioPlayer.play().catch(() => {});
}

function stepTrack(direction) {
  if (!musicTracks.length) return;
  const playableIndexes = musicTracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => !favoriteOnly || favoriteTrackNames.has(track.name))
    .map(({ index }) => index);
  if (!playableIndexes.length) return;
  const currentPosition = playableIndexes.indexOf(currentTrack);
  const nextPosition = currentPosition < 0
    ? 0
    : (currentPosition + direction + playableIndexes.length) % playableIndexes.length;
  loadTrack(playableIndexes[nextPosition], true);
}

function setPlayerState() {
  const playing = !audioPlayer.paused && !audioPlayer.ended;
  musicPlay.textContent = playing ? '❚❚' : '▶';
  musicPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  musicPanel.classList.toggle('playing', playing);
}

musicFiles.addEventListener('change', () => {
  musicTracks.filter(track => track.objectUrl).forEach(track => URL.revokeObjectURL(track.url));
  const addedTracks = Array.from(musicFiles.files, file => ({
    name: file.name.replace(/\.[^.]+$/, ''),
    url: URL.createObjectURL(file),
    objectUrl: true
  }));
  musicTracks = [...builtInTracks, ...addedTracks];
  currentTrack = -1;
  updateTrackList();
  if (musicTracks.length) loadTrack(0);
});
musicPlay.addEventListener('click', () => {
  if (!musicTracks.length) { musicFiles.click(); return; }
  if (audioPlayer.paused) audioPlayer.play().catch(() => {});
  else audioPlayer.pause();
});
document.querySelector('#musicPrevious').addEventListener('click', () => stepTrack(-1));
document.querySelector('#musicNext').addEventListener('click', () => stepTrack(1));
musicFavorites.addEventListener('click', () => {
  favoriteOnly = !favoriteOnly;
  musicFavorites.classList.toggle('active', favoriteOnly);
  musicFavorites.setAttribute('aria-pressed', String(favoriteOnly));
  musicFavorites.textContent = `${favoriteOnly ? '♥' : '♡'} FAVORITES`;
  updateTrackList();
});
document.querySelector('#musicVolume').addEventListener('input', event => { audioPlayer.volume = Number(event.target.value); });
document.querySelector('#musicClose').addEventListener('click', () => {
  musicPanel.classList.remove('open');
  musicPanel.setAttribute('aria-hidden', 'true');
});
musicProgress.addEventListener('input', () => {
  if (Number.isFinite(audioPlayer.duration)) audioPlayer.currentTime = musicProgress.value / 1000 * audioPlayer.duration;
});
audioPlayer.addEventListener('loadedmetadata', () => { musicDuration.textContent = formatAudioTime(audioPlayer.duration); });
audioPlayer.addEventListener('timeupdate', () => {
  musicCurrent.textContent = formatAudioTime(audioPlayer.currentTime);
  musicProgress.value = Number.isFinite(audioPlayer.duration) && audioPlayer.duration > 0
    ? Math.round(audioPlayer.currentTime / audioPlayer.duration * 1000) : 0;
});
audioPlayer.addEventListener('play', setPlayerState);
audioPlayer.addEventListener('pause', setPlayerState);
audioPlayer.addEventListener('ended', () => stepTrack(1));
updateTrackList();
loadTrack(0);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
addEventListener('pointermove', event => {
  pointer.x = event.clientX / innerWidth * 2 - 1; pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactables, true)[0];
  if (hit) { const root = hit.object.userData.root || hit.object; assetTag.textContent = root.userData.label; assetTag.style.display = 'block'; assetTag.style.left = `${event.clientX + 14}px`; assetTag.style.top = `${event.clientY + 14}px`; document.body.style.cursor = 'pointer'; }
  else { assetTag.style.display = 'none'; document.body.style.cursor = ''; }
});
renderer.domElement.addEventListener('click', event => {
  pointer.x = event.clientX / innerWidth * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactables, true)[0];
  const root = hit && (hit.object.userData.root || hit.object);
  if (root?.userData.musicPlayer) {
    musicPanel.classList.add('open');
    musicPanel.setAttribute('aria-hidden', 'false');
  }
});

document.querySelector('#enter').addEventListener('click', () => { document.querySelector('.intro').classList.add('hidden'); controls.autoRotate = false; });
renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const elapsed = clock.getElapsedTime();
  purpleLight.intensity = 4.25 + Math.sin(elapsed * 1.7) * .25;
  const musicPlaying = !audioPlayer.paused && !audioPlayer.ended;
  if (musicPropObject && musicPropRestPosition) {
    if (musicPlaying) {
      musicPropObject.position.copy(musicPropRestPosition);
      musicPropObject.position.x += Math.sin(elapsed * 28) * .012;
      musicPropObject.position.y += Math.abs(Math.sin(elapsed * 18)) * .014;
    } else {
      musicPropObject.position.lerp(musicPropRestPosition, .18);
    }
    const glow = .24 + (musicPlaying ? .22 + Math.sin(elapsed * 5) * .07 : 0);
    musicPropMaterials.forEach(material => { material.emissiveIntensity = glow; });
  }
  renderer.render(scene, camera);
}
animate();
