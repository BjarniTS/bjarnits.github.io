import * as THREE from "three";

function Entity(type, dir = null) {
  this.type = type;
  this.dir = dir;
}

function set_walls() {
  for(let i = 0; i < grid_size[0] + 2; ++i) {
    grid[0][i] = new Entity('w');
  }
  for(let i = 0; i < grid_size[0] + 2; ++i) {
    grid[grid_size[1] + 1][i] = new Entity('w');
  }
  for(let i = 1; i < grid_size[1] + 2; ++i) {
    grid[i][0] = new Entity('w');
  }
  for(let i = 1; i < grid_size[1] + 2; ++i) {
    grid[i][grid_size[0] + 1] = new Entity('w');
  }
}

function set_turn(col, row, dir) {
  const turn_entity = new Entity('t', dir);
  const turn = new THREE.Group();
  turn.userData = turn_entity;
  grid[row][col] = turn;
}

// Búa til gólfið með mynstrinu sem áferð
function make_floor(size, texture, scene) {
  const floorGeometry = new THREE.PlaneGeometry( size[0], size[1] );
  const floorMaterial = new THREE.MeshStandardMaterial( { map: texture, side: THREE.DoubleSide } );
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI;
  floor.position.set( size[0] / 2.0, -0.5, -size[1] / 2.0 );

  scene.add(floor);
}

function make_player(pos, camera, scene) {
  // Make player sphere
  const sphereGeo = new THREE.SphereGeometry(0.5, 32, 16);
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(0.73, 1, 0.5);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  const player = new THREE.Group();
  player.add(sphereMesh);
  player.add(camera);
  player.position.set(pos[0] + 0.5, 0.0, pos[1] - 0.5);

  scene.add(player);

  return player;
}

const centiheadGeo = new THREE.CapsuleGeometry(0.4, 0.1, 8, 16);
function make_centipede_head() {
  // Make centipede head for cloning
  const eyeGeo = new THREE.SphereGeometry(0.1, 8, 4);
  
  const centiheadMat = new THREE.MeshPhongMaterial();
  const eyeMat = new THREE.MeshPhongMaterial();
  centiheadMat.color.setRGB(0.0, 0.5, 0.0);
  eyeMat.color.setRGB(1.0, 0.2, 0.2);
  
  const centiheadMesh = new THREE.Mesh(centiheadGeo, centiheadMat);
  centiheadMesh.rotation.z = -0.5 * Math.PI;
  const eyeMesh1 = new THREE.Mesh(eyeGeo, eyeMat);
  eyeMesh1.position.x = 0.25;
  eyeMesh1.position.z = 0.25;
  eyeMesh1.position.y = 0.32;
  const eyeMesh2 = new THREE.Mesh(eyeGeo, eyeMat);
  eyeMesh2.position.x = 0.25;
  eyeMesh2.position.z = -0.25;
  eyeMesh2.position.y = 0.32;
  
  const centihead = new THREE.Group();
  centihead.add(centiheadMesh);
  centihead.add(eyeMesh1);
  centihead.add(eyeMesh2);

  return centihead;
}

const centihead = make_centipede_head();


function clone_centipede_head(dir) {
  const centihead_clone = centihead.clone(); 
  centihead_clone.rotation.y = Math.atan2(-dir[1], dir[0]);
  //console.log('make_centipede_head: atan2: ', Math.atan2(dir[1], dir[0]), Math.atan2(dir[1], dir[0]) * (180 / Math.PI),' dir: ', dir);
  return centihead_clone;
}

function make_centipede_segment() {
  // Make centipede body segment
  const centisegGeo = centiheadGeo;
  const centisegMat = new THREE.MeshPhongMaterial();
  centisegMat.color.setRGB(0.0, 0.5, 0.0);
  const centisegMesh = new THREE.Mesh(centisegGeo, centisegMat);
  centisegMesh.rotation.z = -0.5 * Math.PI;
  const centiseg = new THREE.Group();
  centiseg.add(centisegMesh);

  return centiseg;
}

const centiseg = make_centipede_segment();

function clone_centipede_seg(dir) {
  const centiseg_clone = centiseg.clone();
  centiseg_clone.rotation.y = Math.atan2(-dir[1], dir[0]);
  return centiseg_clone;
}

function CentipedeData(dir, vert_dir = 1, head = null, next_segment = null, prev_segment = null, turn_points = []) {
  this.dir = dir;
  this.turn_points = turn_points;
  this.vert_dir = vert_dir;
  this.next_segment= next_segment;
  this.prev_segment = prev_segment;
  this.head = head;
}

function spawn_centipede_head(col, row, dir, scene) {
  const head = clone_centipede_head(dir);
  const head_pos = cr_to_xz(col, row);
  head.position.set(head_pos[0], 0.0, head_pos[1]); 
  head.userData = new CentipedeData(dir, 1, head);
  centipedes.add(head);

  return head;
}

function spawn_centipede(col, row, length, dir, scene) {
  if(grid[row][col] !== null) return;
  const head = clone_centipede_head(dir);
  const head_pos = cr_to_xz(col, row);
  head.position.set(head_pos[0], 0.0, head_pos[1]); 
  head.userData = new CentipedeData(dir, 1, head);
  centipedes.add(head);
  scene.add(head);

  let curr_seg = head;
  for(let i = 0; i < length; ++i) {
    const seg = clone_centipede_seg(dir);
    const seg_pos = cr_to_xz(col + (i + 1) * -dir[0], row + (i + 1) * dir[1]);
    console.log('spawn_centipede seg_pos: ', seg_pos, ' col: ', col, ' row: ', row, ' dir: ', dir);
    seg.position.set(seg_pos[0], 0.0, seg_pos[1]);
    seg.userData = new CentipedeData(dir, 1, head);
    scene.add(seg);
    curr_seg.userData.next_segment = seg;
    seg.userData.prev_segment = curr_seg;
    curr_seg = seg;
  }

  return head;
}


const shroomGeo = new THREE.SphereGeometry(shroom_radius, 32, 16);
const shroom1Geo = new THREE.SphereGeometry(shroom_radius, 16, 8);
const shroom2Geo = new THREE.SphereGeometry(shroom_radius, 8, 4);
const shroom3Geo = new THREE.SphereGeometry(shroom_radius, 4, 2);
const shroomStalkGeo = new THREE.CapsuleGeometry(0.2, 0.3, 8, 8);
const shroomMat = new THREE.MeshPhongMaterial();
const shroom1Mat = new THREE.MeshPhongMaterial();
const shroom2Mat = new THREE.MeshPhongMaterial();
const shroom3Mat = new THREE.MeshPhongMaterial();
shroomMat.color.setRGB(1.0, 0.0, 0.0);
shroom1Mat.color.setRGB(0.8, 0.0, 0.0);
shroom2Mat.color.setRGB(0.5, 0.0, 0.0);
shroom3Mat.color.setRGB(0.3, 0.0, 0.0);

function make_shroom(level) {
  let geo;
  let mat;
  switch (level) {
    case 0:
      geo = shroomGeo;
      mat = shroomMat;
      break;
    case 1:
      geo = shroom1Geo;
      mat = shroom1Mat;
      break;
    case 2:
      geo = shroom2Geo;
      mat = shroom2Mat;
      break;
    case 3:
      geo = shroom3Geo;
      mat = shroom3Mat;
      break;
  }

  const shroomMesh = new THREE.Mesh(geo, mat);
  const shroomStalkMesh = new THREE.Mesh(shroomStalkGeo, mat);
  shroomMesh.scale.y = 0.5;
  shroomStalkMesh.position.y = -0.15;
  const shroom = new THREE.Group();
  shroom.add(shroomMesh);
  shroom.add(shroomStalkMesh);
  shroom.userData = new Entity('m', [level, 0]);  

  return shroom;
}


const shroom = make_shroom(0);
const shroom1 = make_shroom(1);
const shroom2 = make_shroom(2);
const shroom3 = make_shroom(3);


function spawn_shroom(col, row, level, scene) {
  let shroom_clone;
  switch (level) {
    case 0:
      shroom_clone = shroom.clone();
      break;
    case 1:
      shroom_clone = shroom1.clone();
      break;
    case 2:
      shroom_clone = shroom2.clone();
      break;
    case 3:
      shroom_clone = shroom3.clone();
      break;
    case 4:
      return;
  }
  const shroom_pos = cr_to_xz(col, row);
  shroom_clone.position.set(shroom_pos[0], 0.0, shroom_pos[1]);
  grid[row][col] = shroom_clone;
  scene.add(shroom_clone);
}


function make_bullet() {
  // Make bullet for cloning
  const bulletGeo = new THREE.ConeGeometry(0.1, 0.15, 6);
  const bulletMat = new THREE.MeshPhongMaterial();
  bulletMat.color.setRGB(1.0, 1.0, 0.0);
  const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
  const bullet = new THREE.Group();
  bullet.rotation.x = -0.5 * Math.PI;
  bullet.add(bulletMesh);

  return bullet;
}

const bullet = make_bullet();

function spawn_bullet(x, z, scene) {
  const bullet_clone = bullet.clone();
  bullet_clone.userData = new Entity('m');
  bullet_clone.position.set(x, -0.25, z);
  bullets.add(bullet_clone);
  scene.add(bullet_clone);
}

export {
  spawn_bullet,
  spawn_shroom,
  spawn_centipede,
  spawn_centipede_head,
  make_player,
  make_floor,
  set_turn,
  set_walls
}
