import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 10, 0);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;

// BASE_URL funciona tanto en local como en GitHub Pages.
const base = import.meta.env.BASE_URL;
const textureLoader = new THREE.TextureLoader();
const branchNormal = textureLoader.load(base + 'branch05_normal.png');
const barkNormal = textureLoader.load(base + 'mossybark02_normal.png');

const mtlLoader = new MTLLoader();
mtlLoader.setPath(base);
mtlLoader.setResourcePath(base);
mtlLoader.load('QuickMapleOptimized.mtl', (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load(base + 'tree.obj', (object) => {
    object.traverse((child) => {
      if (!child.isMesh) return;
      const original = Array.isArray(child.material) ? child.material : [child.material];
      const updated = original.map((material) => {
        const name = material.name.toLowerCase();
        const result = new THREE.MeshStandardMaterial({
          map: material.map || null,
          side: THREE.DoubleSide,
          roughness: 1,
        });
        if (name.includes('branch05')) {
          result.normalMap = branchNormal;
          result.transparent = false;
          result.alphaTest = 0.5;
        } else if (name.includes('mossybark')) {
          result.normalMap = barkNormal;
        }
        return result;
      });
      child.material = Array.isArray(child.material) ? updated : updated[0];
    });

    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    const group = new THREE.Group();
    group.add(object);
    group.scale.setScalar(5 / Math.max(size.x, size.y, size.z));
    scene.add(group);
    camera.position.set(0, 0, 10);
    controls.target.set(0, 0, 0);
    controls.update();
    console.log('Árbol cargado con sus texturas originales');
  }, undefined, (error) => console.error('Error al cargar tree.obj:', error));
}, undefined, (error) => console.error('Error al cargar materiales:', error));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();