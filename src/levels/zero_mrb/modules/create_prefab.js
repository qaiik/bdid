import * as THREE from 'three'
import { prefabArray as _prefabArray } from './prefabs.js'
const s = new THREE.TextureLoader().load("./cc.jpg")
import * as A from "../../../lib/TTA.js"
let pfaCache = {}
export const createPrefab = (createRigidBody, physicsWorld, pos, qt, rms, emptyLevel) => {
    let prefabArray;
    if (pfaCache[rms]) {
        prefabArray = pfaCache[rms]
    } else {
        prefabArray = _prefabArray.map(n => n(rms))
        pfaCache[rms] = prefabArray
    }

    if (prefabArray.length < _prefabArray.length + emptyLevel) {
        let e_rt = prefabArray.at(-1)
        for (let i = 0; i < emptyLevel; i++) {
            prefabArray.push(e_rt)
        }
    }

    const index = THREE.MathUtils.randInt(0, prefabArray.length - 1)
    const pfb = prefabArray[index].clone()

    pfb.position.set(pos.x,pos.y, pos.z)
    pfb.quaternion.set(qt.x,qt.y,qt.z,qt.w)

    return pfb
}