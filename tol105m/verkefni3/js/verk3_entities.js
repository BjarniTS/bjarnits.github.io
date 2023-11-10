import * as THREE from "three";

function Entity(type, dir = null) {
  this.type = type;
  this.dir = dir;
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
  eyeMat.color.setRGB(0.5, 0.5, 0.5);
  
  const centiheadMesh = new THREE.Mesh(centiheadGeo, centiheadMat);
  centiheadMesh.rotation.z = -0.5 * Math.PI;
  const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
  eyeMesh.position.x = 0.4;
  eyeMesh.position.y = 1.0;
  
  const centihead = new THREE.Group();
  centihead.add(centiheadMesh);
  centihead.add(eyeMesh);

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

function spawn_centipede(col, row, length, dir, scene) {
  if(grid[row][col] !== null) return;
  const head = clone_centipede_head(dir);
  const head_pos = cr_to_xz(col, row);
  head.position.set(head_pos[0], 0.0, head_pos[1]); 
  head.userData = new CentipedeData(dir, 1, head);
  centipedes.push(head);
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

function make_shroom() {
  const sphereGeo = new THREE.SphereGeometry(shroom_radius, 32, 16);
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setRGB(1.0, 0.0, 0.0);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  const shroom = new THREE.Group();
  shroom.add(sphereMesh);
  shroom.userData = new Entity('m');  

  return shroom;
}

const shroom = make_shroom();

function spawn_shroom(col, row, scene) {
  const shroom_clone = shroom.clone();
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
  make_player,
  make_floor,
  set_turn
}
