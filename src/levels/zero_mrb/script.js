import * as THREE from 'three';
import {
    Character
} from "./modules/character.js";
import {
    Camera
} from "./modules/camera.js";
import {
    Scene
} from "./modules/scene.js";
import {
    createRigidBody,
    physicsWorld,
    setupPhysicsWorld,
    updatePhysics
} from "./modules/physics.js";
// import Stats from 'three/addons/libs/stats.module.js';
import FirstPersonCamera from './fpc.js';
import {
    iterateGeometries,
    createCollisionShapes,
    TYPE,
    FIT,
} from '../../lib/TTA.js';
import {
    GLTFLoader
} from '../../lib/GLTF.js';

import GenManager from './modules/gm.js';
import { createPrefab } from './modules/create_prefab.js';
const GAME_STATE = {
    PAUSED: "PAUSED",
    GAME_OVER: "GAME_OVER",
    PLAYING: "PLAYING"
}
const GUN_STATE = {
    IDLE: "IDLE",
    FIRING: "FIRING"
}
let renderer, stats;
let GAME_STATUS = GAME_STATE.PAUSED;
let GUN_STATUS = GUN_STATE.IDLE;
let followCam = false
let lineA;
let lineB;
let debugGeometry;
let debugDrawer;
let DEBUGMODE = 0 // 0 = off , 1 = wireframe, 2 = aabb
let BALLS_COUNTER = 0;
let fpc;
const colorArray = [0x80FF33, 0x33E6FF, 0xFFF633, 0xFF33BB, 0xFF33CA, 0xFF5714, 0x6EEB83];
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const listener = new THREE.AudioListener();
const sound_bg = new THREE.Audio(listener);
const sound_lazer = new THREE.Audio(listener);
const sound_gameover = new THREE.Audio(listener);
const sound_hit = new THREE.Audio(listener);
const sound_error = new THREE.Audio(listener);
const keys = {
    a: 0,
    s: 0,
    d: 0,
    w: 0
};

let canGenNew = false;
let chunkR = 0;
let stopWatch = document.getElementById('stopwatch');
let remainingBalls = document.querySelector('#ball-remaining span');
let GenM;
const initDebug = () => {
    // const debugColors = new Float32Array(DefaultBufferSize);
    // debugGeometry.setAttribute("position", new THREE.BufferAttribute(debugVertices, 3).setUsage(THREE.DynamicDrawUsage));
    // const debugMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
    // debugMesh.frustumCulled = false;
    // debugDrawer = new AmmoDebugDrawer(null, debugVertices, debugColors, physicsWorld);
    // debugDrawer.setDebugMode(DEBUGMODE);
}

let offset = 2
let planeSize = 5

// function make(x, y, z) {
//     const planeMat = new THREE.MeshBasicMaterial({color: Math.random() > 0.5 ? "green" : "blue"})
//     const planeGeo = new THREE.PlaneGeometry(5,5);

//     const plane = new THREE.Mesh(planeGeo, planeMat);

//     plane.position.set(x, y, z)
//     plane.rotation.set(-Math.PI / 2, 0, 0)
//     return Scene.add(plane)
// }
export const make_ = function make(x, y, z) {
    const planeMat = new THREE.MeshBasicMaterial({color: Math.random() > 0.5 ? "green" : "blue"})
    const planeGeo = new THREE.PlaneGeometry(5,5);

    const plane = new THREE.Mesh(planeGeo, planeMat);

    plane.position.set(x, y, z)
    plane.rotation.set(-Math.PI / 2, 0, 0)
    return plane
}


export const make = function make(x,y,z) {
    window.ww.postMessage({
        x: x,
        y: y,
        z: z,
        toClone: window.s,
        scene: Scene
    })
    // let stfz = window.s.clone()
    // Scene.add(stfz)
    // stfz.position.set(x,y,z)
    // return stfz
}

function makce(x,y,z) {
    if (window.s) {
        try {
            Scene.add(window.s)
            window.s.positon.set(x,y,z)
        } catch(e) {

        }
    }
    

    
}

let l=($,a,f,r)=>{f(r||0),$((r=a(r||0))||0)&&setTimeout(() => l($,a,f,r), 100)};
let td = 0
function gen() {
    let zp = ~~Camera.position.z

    l
        (i => i < 20, i => i + 5, i => {
            setTimeout(() => {
                if (window.s) {
                    make(~~Camera.position.x + i, 0, zp + (offset * planeSize))
                    make(~~Camera.position.x + -i, 0, zp + (offset * planeSize))
                    td += 10
                }
            }, td)
        })

}

const initEnvironment = () => {

  // const floor = new THREE.Mesh(
  //   new THREE.BoxGeometry(15, 1, 15),
  //   new THREE.MeshBasicMaterial({color: "grey"})
  // )

  // Scene.add(floor)
  // floor.position.set(0, 0, 0)

  // let floorShape = new Ammo.btBoxShape(new Ammo.btVector3(15 / 2, 1 / 2, 15 / 2));
  // floorShape.setMargin(0.05);
  // createRigidBody(physicsWorld, floor, floorShape, 0, floor.position, floor.quaternion);
  Character.userData.physicsBody.getWorldTransform().getOrigin().setY(1)
  GenM.generate()

}

const spawnats = []
const init = () => {
    // stats = new Stats();
    // document.body.appendChild(stats.dom);
    // followCam.position.copy(Camera.position);
    // followCam.parent = Character;
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * (
        (localStorage.graphicsp ? localStorage.graphicsp : 100) / 100));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding
    // renderer.shadowMap.enabled = true;
    const AmbientLight = new THREE.AmbientLight(0xffffff, 1);
    Scene.add(AmbientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 10, -2);
    // dirLight.shadow.camera.top += 10;
    // dirLight.shadow.camera.left -= 10;
    // dirLight.shadow.mapSize.width = 2048;
    dirLight.target.position.set(0, 0, 0)
    Scene.add(dirLight);
    Scene.add(dirLight.target);
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('mousemove', mouselocation);
    window.addEventListener('pointerdown', checkCollision);
    window.addEventListener('pointerup', function() {
        GUN_STATUS = GAME_STATE.IDLE
    });
    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');
    instructions.addEventListener('click', function() {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        GAME_STATUS = GAME_STATE.PLAYING;
        sound_bg.play();
    });
    initEnvironment();
    // setPlane();
}
window.addEventListener('keyup', k => {
    if (k.code == "ShiftLeft") {
        sms(151)
    }
    console.log(k.code)
    if (k.code == "ShiftRight") {
        sms(6)
    }
})
const characterMovement = () => {
    let movementSpeed = 20;
    const rotationSpeed = 10;
    window.sms = (s) => {
        movementSpeed = s
        console.log(movementSpeed)
    }
    let moveX = keys.d - keys.a;
    let moveZ = keys.s - keys.w;
    let moveY = 0;
    const physicsBody = Character.userData.physicsBody;
    physicsBody.setDamping(0.9, 0.9)
    if (moveZ || moveX) {
        const temporaryEuler = new THREE.Vector3(moveX * movementSpeed, 0, moveZ * movementSpeed).applyQuaternion(Character.quaternion)
        physicsBody.applyForce(new Ammo.btVector3(temporaryEuler.x, temporaryEuler.y, temporaryEuler.z))
    }
    if (mouse.y) {
        // Camera.quaternion.copy(fpc.rotation_, Math.sqrt(1 - fpc.rotation_.x**2 - fpc.rotation_.y**2 - fpc.rotation_.z**2))
        //     Math.sqrt(1 - fpc.rotation_.x**2 - fpc.rotation_.y**2 - fpc.rotation_.z**2))
        let {
            x,
            y,
            z,
            w
        } = fpc.rotation_
        // y = 0 
        const quat = new Ammo.btQuaternion(x, y, z, w)
        var transform = new Ammo.btTransform()
        transform.setRotation(quat)
        transform.setOrigin(physicsBody.getWorldTransform().getOrigin())
        physicsBody.setWorldTransform(transform)
        // physicsBody.setAngularVelocity(resultantImpulseRotation);
    }
}

const setCharacterPhysics = () => {
    let pos = {
        x: 0,
        y: 0,
        z: 0
    };
    let quat = {
        x: 0,
        y: 0,
        z: 0,
        w: 1
    };
    let mass = 1;
    let scale = {
        x: 0.3,
        y: 0.3,
        z: 0.3
    };
    Character.position.set(pos.x, pos.y, pos.z);
    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);
    const playerBody = createRigidBody(physicsWorld, Character, colShape, mass, pos, quat);
    playerBody.setAngularFactor(0, 1, 0);
}
const createBall = () => {
    const totalEnemies = 25
    for (let i = 0; i < totalEnemies; i++) {
        let pos = {
            x: getRandomInt(-8, 8),
            y: 20,
            z: getRandomInt(-8, 8)
        };
        let radius = getRandomInt(4, 8) * 0.1;
        let quat = {
            x: 0,
            y: 0,
            z: 0,
            w: 1
        };
        let mass = 1;
        let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({
            color: colorArray[Math.floor(Math.random() * colorArray.length)]
        }));
        ball.position.set(pos.x, pos.y, pos.z);
        ball.name = "enemy"
        ball.castShadow = false;
        ball.receiveShadow = true;
        ball.isHit = false;
        ball.hitSound = sound_hit;
        ball.errorSound = sound_error;
        let colShape = new Ammo.btSphereShape(radius);
        colShape.setMargin(0.05);
        createRigidBody(physicsWorld, ball, colShape, mass, pos, quat);
    }
    remainingBalls.innerHTML = totalEnemies;
    BALLS_COUNTER = totalEnemies;
}

let rc = []
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

let size = 80
let genP = 20

const animate = () => {
    let delta = clock.getDelta();
    if (GAME_STATUS === GAME_STATE.PLAYING) {
        characterMovement();
    }

    if (~~Camera.position.z < 0 && ~~Camera.position.z % (-size * (genP / 100)) == 0 && !spawnats.includes(~~Camera.position.z)) {
        console.log("generated, " + Camera.position.z, ~~Camera.position.z)
        spawnats.push(~~Camera.position.z)
        GenM.generate()
    }

  //   if (~~Camera.position.z < 0 && ~~Camera.position.z % -160 == 0 && !rc.includes(~~Camera.position.z)) {
  //     console.log("remove, " + Camera.position.z, ~~Camera.position.z)
  //     rc.push(~~Camera.position.z)
  //     Gen
  // }

    if (followCam) {
        Camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.085);
        Camera.lookAt(Character.position.x, Character.position.y + .5, Character.position.z);
    }
    fpc.update(delta)
    requestAnimationFrame(animate);
    updatePhysics(delta);
    if (debugDrawer) {
        if (debugDrawer.index !== 0) {
            debugGeometry.attributes.position.needsUpdate = true;
            debugGeometry.attributes.color.needsUpdate = true;
        }
        debugGeometry.setDrawRange(0, debugDrawer.index);
        debugDrawer.update();
    }
    renderer.render(Scene, Camera);
    Camera.updateProjectionMatrix();
}
const checkCollision = () => {
    if (GAME_STATUS != GAME_STATE.PLAYING) {
        return;
    }
    const dir = new THREE.Vector3();
    Character.getWorldDirection(dir)
    raycaster.set(Character.position, new THREE.Vector3(-dir.x, dir.y, -dir.z), 10, 50);
    const intersects = raycaster.intersectObjects(Scene.children);
    if (sound_lazer.isPlaying) {
        sound_lazer.stop();
    }
    GUN_STATUS = GUN_STATE.FIRING;
    sound_lazer.play();
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name === "enemy") {
            if (GAME_STATUS == GAME_STATE.PLAYING) {
                const physicsBody = intersects[i].object.userData.physicsBody;
                physicsBody.applyForce(new Ammo.btVector3(0, 250, 0))
                if (!intersects[i].object.isHit) {
                    intersects[i].object.material.color.setHex(0xff0000);
                    BALLS_COUNTER -= 1;
                    intersects[i].object.isHit = true;
                    intersects[i].object.hitSound.play();
                } else {
                    intersects[i].object.material.color.setHex(colorArray[Math.floor(Math.random() * colorArray.length)]);
                    BALLS_COUNTER += 1;
                    intersects[i].object.isHit = false;
                    intersects[i].object.errorSound.play();
                }
                remainingBalls.innerHTML = BALLS_COUNTER
            }
            if (BALLS_COUNTER === 0) {
                GAME_STATUS = GAME_STATE.GAME_OVER;
                sound_gameover.play();
            }
            break;
        }
    }
}
const onWindowResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    Camera.aspect = width / height;
    Camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
const keyup = (e) => {
    keys[e.key] = 0;
    if (e.key === "Escape") {
        document.body.style.cursor = 'unset';
        instructions.style.display = 'flex';
        blocker.style.display = 'block';
        GAME_STATUS = GAME_STATE.PAUSED;
    }
}
const keydown = (e) => {
    keys[e.key] = 1;
}
const mouselocation = (event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    mouse.x = (event.clientX / width * 2 - 1);
    mouse.y = -(event.clientY / height) * 2 + 1;
}
const setProjectile = () => {
    const pointsA = [];
    const pointsB = [];
    const material = new THREE.LineBasicMaterial({
        color: "yellow"
    });
    pointsA.push(new THREE.Vector3(-0.08, 0, 0));
    pointsA.push(new THREE.Vector3(-0.08, 0, -1));
    pointsB.push(new THREE.Vector3(0.08, 0, 0));
    pointsB.push(new THREE.Vector3(0.08, 0, -1));
    const geometryA = new THREE.BufferGeometry().setFromPoints(pointsA);
    lineA = new THREE.Line(geometryA, material);
    const geometryB = new THREE.BufferGeometry().setFromPoints(pointsB);
    lineB = new THREE.Line(geometryB, material);
    lineA.geometry.attributes.position.needsUpdate = true;
    lineB.geometry.attributes.position.needsUpdate = true;
    Character.add(lineA);
    Character.add(lineB);
}
const addAudio = () => {
    Camera.add(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/background.mp3', function(buffer) {
        sound_bg.setBuffer(buffer);
        sound_bg.setLoop(true);
        sound_bg.setVolume(0.3);
    })
    audioLoader.load('sounds/lazer.mp3', function(buffer) {
        sound_lazer.setBuffer(buffer);
        sound_lazer.setVolume(1);
    })
    audioLoader.load('sounds/game-over.mp3', function(buffer) {
        sound_gameover.setBuffer(buffer);
        sound_gameover.setVolume(1);
        sound_gameover.setLoop(true);
    })
    audioLoader.load('sounds/error.mp3', function(buffer) {
        sound_error.setBuffer(buffer);
        sound_error.setVolume(0.5);
    })
    audioLoader.load('sounds/hit.mp3', function(buffer) {
        sound_hit.setBuffer(buffer);
        sound_hit.setVolume(0.5);
    })
}

function initFc() {
    fpc = new FirstPersonCamera(Camera, null, 0.3, Character.userData.physicsBody)
}

function CreateGenManager() {
  GenM = new GenManager({
    scene: Scene,
    createPrefab: createPrefab,
    mapSize: 256,
    roomSize: 7,
    extraEmptyLevel: 7,
    Ammo: Ammo,
    createRigidBody: createRigidBody,
    physicsWorld: physicsWorld,
    A: {
        FIT,
        iterateGeometries,
        createCollisionShapes,
        TYPE
    }
  })

  window.gm = GenM
}
const start = () => {
    setupPhysicsWorld();
    setCharacterPhysics();
    CreateGenManager()
    init();
    // createBall();
    // initDebug();
    // setProjectile();
    initFc()
    animate();
    // addAudio();
}

function rs() {
    Ammo().then(start)
    window.onclick = () => {
        document.querySelector('canvas').requestPointerLock({
            unadjustedMovement: true
        })
        window.fpc = fpc
    }
}
window.onkeyup = (e) => {
    if (e.code == "KeyK") {
        rs()
    }
}

window.Camera = Camera
window.Scene = Scene
window.Character = Character