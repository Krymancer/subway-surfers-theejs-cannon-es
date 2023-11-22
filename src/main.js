import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'

const scene = new THREE.Scene();

const scoreDOM = document.getElementById('score');

let score = 0;

let player;
let obstacle;

const GROUP_1 = 2;
const GROUP_2 = 64;
const GROUP_3 = 512;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('keydown', event => {
  if (event.key === " ") {
    jump();
  }
});


const world = new CANNON.World();
world.gravity.set(0, -20, 0);

function initThreeScene() {
  const skybox = new THREE.SphereGeometry(100, 10, 10);
  const skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.BackSide });
  const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
  scene.add(skyboxMesh);

  const grassGeometry = new THREE.BoxGeometry(1000, -0.1, 500);
  const grassTexture = new THREE.TextureLoader().load("../assets/grass.png", function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(1000 / 1.8, 500 / 1.8);
  });

  const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
  const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
  scene.add(grassMesh);

  const planeGeometry = new THREE.BoxGeometry(25, 0, 500);
  const texture = new THREE.TextureLoader().load("../assets/rock.png", function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(30 / 1.8, 500 / 1.8);
  });

  const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(planeMesh);

}

function initCannonWorld() {
  const planeBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(12, 500, 0.1)),
    type: CANNON.Body.STATIC,
    collisionFilterGroup: GROUP_3,
    collisionFilterMask: GROUP_1 | GROUP_2
  });
  planeBody.position.set(0, 0, 0);
  planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

  world.addBody(planeBody);
}

function initPlayer() {
  const geometry = new THREE.CapsuleGeometry(1.5, 1.5, 8, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(1.4, 2.3, 1.4));
  const body = new CANNON.Body({
    mass: 1,
    collisionFilterGroup: GROUP_1,
    collisionFilterMask: GROUP_2 | GROUP_3,
    shape,
    position: new CANNON.Vec3(0, 4, 10),
  });
  world.addBody(body);
  player = { mesh, body };
}

function initObstacle() {
  const geometry = new THREE.BoxGeometry(25, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(12, 0.5, 0.5));
  const body = new CANNON.Body({
    mass: 100,
    collisionFilterGroup: GROUP_2,
    collisionFilterMask:  GROUP_1 | GROUP_3,
    shape,
    position: new CANNON.Vec3(0, 1, -80),
    velocity: new CANNON.Vec3(0, 0, 80)
  });
  world.addBody(body);

  obstacle = { mesh, body };
}

const cannonDebugger = new CannonDebugger(scene, world, {});

initThreeScene();
initCannonWorld();
initPlayer();
initObstacle();

function jump() {
  // prevent player to jump in the air
  // This is kind bad, but nothing to worry about it
  // TODO: Refactor this
  if (player.body.position.y > 4) return;
    player.body.applyForce(new CANNON.Vec3(0, 700, 0))
}

function resetObstacle() {
  score++;
  scoreDOM.innerHTML = score;
  obstacle.body.position = new CANNON.Vec3(0, 1, -80);
  obstacle.body.velocity = new CANNON.Vec3(0, 0, 80);
}

obstacle.body.addEventListener('collide', event => {
  if(event.body === player.body) {
    // MORREU
    foidebase();
  }
});

function foidebase() {
  alert('Tu é mto rum pvt!');
  location.reload();
}

function animate() {
  requestAnimationFrame(animate);
  world.fixedStep();
  cannonDebugger.update();

  obstacle.body.velocity.y = 0;

  player.mesh.position.copy(player.body.position)
  player.mesh.quaternion.copy(player.body.quaternion)
  obstacle.mesh.position.copy(obstacle.body.position)
  obstacle.mesh.quaternion.copy(obstacle.body.quaternion)

  if (obstacle.body.position.z >= 15) resetObstacle();

  renderer.render(scene, camera);
}


animate();