
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// CÁMARA
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);

// RENDERIZADOR
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

document.body.style.margin = '0';
document.body.replaceChildren(renderer.domElement);

// ILUMINACIÓN CENITAL
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 10, 0);
scene.add(light);

// ILUMINACIÓN AMBIENTAL
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  1.5
);
scene.add(ambientLight);

// CONTROLES DEL RATÓN
const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;

// CARGAR ÁRBOL OBJ
const loader = new OBJLoader();

console.log('Cargando tree.obj...');

loader.load(
  import.meta.env.BASE_URL + 'tree.obj',

  (object) => {
    console.log('Árbol cargado correctamente');

    // Material visible
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x228b22,
          side: THREE.DoubleSide
        });
      }
    });

    // Calcular dimensiones originales
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('Dimensiones:', size);

    // Crear grupo para centrar el árbol
    const group = new THREE.Group();

    // Mover el modelo al centro
    object.position.set(
      -center.x,
      -center.y,
      -center.z
    );

    // Escalar el grupo completo
    const maxSize = Math.max(
      size.x,
      size.y,
      size.z
    );

    if (maxSize > 0) {
      group.scale.setScalar(5 / maxSize);
    }

    group.add(object);
    scene.add(group);

    // Colocar cámara mirando al centro
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    controls.target.set(0, 0, 0);
    controls.update();

    console.log('Árbol centrado y añadido');
  },

  undefined,

  (error) => {
    console.error('Error cargando árbol:', error);
  }
);

// ADAPTAR A LA VENTANA
window.addEventListener('resize', () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// ANIMACIÓN
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
