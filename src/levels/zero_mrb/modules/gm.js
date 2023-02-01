import * as THREE from 'three'
export default class GenManager {
  constructor({
    createRigidBody,
    physicsWorld,
    Ammo,
    scene,
    createPrefab,
    mapSize,
    roomSize,
    extraEmptyLevel,
    A
  }) {
    this.mapSize = Math.round(Math.sqrt(mapSize)) ** 2
    this.rows = Math.sqrt(this.mapSize)
    this.roomSize = roomSize
    this.roomPtr = 0;
    this.pos = new THREE.Vector3(0, 0, 0);
    this.px = 0;
    this.pz = 0;
    this.chunks = []
    this.emptyLevel = extraEmptyLevel;
    this.scene = scene;
    this.createPrefab = createPrefab;
    this.Ammo = Ammo;
    this.createRigidBody = createRigidBody;
    this.physicsWorld = physicsWorld;
    this.A = A;
  }
  generate() {
    const {
      scene,
      createPrefab,
      createRigidBody,
      Ammo,
      physicsWorld,
      A
    } = this
    const chunk = new THREE.Object3D();
    this.chunks.push(chunk)
    scene.add(chunk)
    for (let i = 0; i < this.mapSize; i++) {
      if (this.roomPtr == this.rows) {
        this.px = 0;
        this.roomPtr = 0
        this.pz -= this.roomSize
      }
      this.pos.set(this.px, 0, this.pz)
      const p = createPrefab(createRigidBody, physicsWorld, this.pos, new THREE.Quaternion, this.roomSize, this.emptyLevel)
      chunk.add(p)

      p.children[0]?.children.forEach(c => {
        if (!c.isMesh) return
        let vertices = []
        let indexes = []
        let matrices = []
        A.iterateGeometries(c, {}, (vertexArray, matrixArray, indexArray) => {
            vertices.push(vertexArray);
            matrices.push(matrixArray);
            indexes.push(indexArray);
            const matrixWorld = new THREE.Matrix4();
            const options = {
                type: A.TYPE.MESH,
                fit: A.FIT.ALL
            }
            const shapes = A.createCollisionShapes(vertices, matrices, indexes, matrixWorld.elements, options);
            createRigidBody(physicsWorld, c, shapes[0], 1000, c.position, c.quaternion);
            console.log(c)
      })
    })
      
      this.roomPtr++
      this.px += this.roomSize
    }
  }
}