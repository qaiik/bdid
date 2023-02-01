import * as THREE from 'three'
import { GLTFLoader } from './GLTF.js';

export const prefabArray = [];

//red
// prefabArray.push((rs) => {
//     return new THREE.Mesh(
//         new THREE.BoxGeometry(rs,1,rs),
//         new THREE.MeshBasicMaterial({color: 0xff0000})
//     )
// })

//green
// prefabArray.push((rs) => {
//     return new THREE.Mesh(
//         new THREE.BoxGeometry(rs,1,rs),
//         new THREE.MeshBasicMaterial({color: 0x00ff00})
//     )
// })

//blue
// new GLTFLoader().load("./modules/roomtype/Rt_1.gltf", function(gltf) {
//     prefabArray.push((rs) => {
//         return gltf.scene
//     })
// })

//brown / empty
// prefabArray.push((rs) => {
//     return new THREE.Mesh(
//         new THREE.BoxGeometry(rs,1,rs),
//         new THREE.MeshBasicMaterial({color: new THREE.Color("brown")})
//     )
// })


new GLTFLoader().load("./modules/roomtype/Prefab_ER.gltf", function(gltf) {
    prefabArray.push((rs) => {
        return gltf.scene
    })
})