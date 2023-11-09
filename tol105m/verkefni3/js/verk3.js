import * as THREE from "three";
import {
  spawn_bullet,
  spawn_shroom,
  spawn_centipede,
  make_player,
  make_floor,
  set_turn
} from "entities";
// NOTE: have the centipede shoot a shot when it turns down?

console.log(grid);

console.log(is_crossing([1.0, 2.0], [1.5, 2.0], [1.6, 2.0]));
console.log(is_crossing([1.0, 2.0], [1.0, 2.0], [1.6, 2.0]));
console.log(is_crossing([1.0, 2.0], [1.5, 2.0], [1.5, 2.0]));

console.log(is_crossing([1.0, 2.0], [1.5, 2.0], [0.9, 2.0]));
console.log(is_crossing([1.0, 2.0], [1.0, 2.0], [1.0, 2.0]));
console.log(is_crossing([1.0, 2.0], [1.5, 2.0], [1.4, 2.0]));

console.log(is_crossing([1.0, 2.0], [1.0, 2.5], [1.0, 2.6]));
console.log(is_crossing([1.0, 2.0], [1.0, 2.0], [1.0, 2.6]));
console.log(is_crossing([1.0, 2.0], [1.0, 2.5], [1.0, 2.5]));

const scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');

// Skilgreina myndavél og staðsetja hana
const cameraFP = new THREE.PerspectiveCamera(100, canvas.clientWidth / canvas.clientHeight, 0.0001, 100);
const cameraTopDownPersp = new THREE.PerspectiveCamera( 100, canvas.clientWidth/canvas.clientHeight, 0.0001, 100 );
const cameraTopDownOrtho = new THREE.OrthographicCamera( -grid_size[0] / 2.0, grid_size[0] / 2.0, grid_size[1] / 2.0,  -grid_size[1] / 2.0);
cameraTopDownOrtho.position.set(grid_size[0] / 2.0, 10.0, -grid_size[1] / 2.0);
cameraTopDownOrtho.lookAt(grid_size[0] / 2.0, 0.0, -grid_size[1] / 2.0);
cameraTopDownPersp.position.set(grid_size[0] / 2.0, 10.0, -grid_size[1] / 2.0);
cameraTopDownPersp.lookAt(grid_size[0] / 2.0, 0.0, -grid_size[1] / 2.0);
let camera = cameraTopDownOrtho;

// Bæta við músarstýringu
//const controls = new THREE.OrbitControls( camera, canvas );

// Skilgreina birtingaraðferð með afbjögun (antialias)
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});

// Hlöðum inn mynstrinu og látum það endurtakast
const loader = new THREE.TextureLoader();
const floorTexture = loader.load('resources/images/checkerboard.jpg');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(grid_size[0] / 4, grid_size[1] / 4.0);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
//            floorTexture.anisotropy = maxAniso;


make_floor(grid_size, floorTexture, scene);
const player = make_player(player_start_pos, cameraFP, scene);
spawn_shroom(3, 2, scene);
spawn_centipede(8, 2, 1, [-1,0], scene);
set_turn(5, 2, [0, -1]);

// Skilgreina ljósgjafa og bæta honum í sviðsnetið
const light = new THREE.PointLight(0xFFFFFF, 100);
light.position.set(grid_size[0] / 2.0, 1, -grid_size[1] / 2.0);
//light.target.position.set(0, 0, 0);
scene.add(light);

let pause = false;
let player_dir = [0, 0];
let fire_bullet = false;
// Event listener for keyboard
window.addEventListener("keydown", function(e){
  switch( e.keyCode ) {
  case 87:	// w
    player_dir[1] = -1;
    break;
  case 83:	// s
    player_dir[1] = 1;
    break;
  case 65:	// a
    player_dir[0] = -1;
    break;
  case 68:	// d
    player_dir[0] = 1;
    break;
  case 66: // b
    if(camera == cameraTopDownPersp) camera = cameraFP;
    else camera = cameraTopDownPersp;
    break;
  case 32: // space
    fire_bullet = true;
    break;
  case 88: // x?
    pause = !pause;
    break;
  }
});

window.addEventListener("keyup", function(e){
  switch( e.keyCode ) {
  case 87:	// w
    if(player_dir[1] === -1) player_dir[1] = 0;
    break;
  case 83:	// s
  if(player_dir[1] === 1) player_dir[1] = 0;
    break;
  case 65:	// a
  if(player_dir[0] == -1) player_dir[0] = 0;
    break;
  case 68:	// d
  if(player_dir[0] == 1) player_dir[0] = 0;
    break;
  }
});
      
// Hreyfifall

let prev_bullet_timestamp = 0;
let prev_timestamp = 0;

const animate = function (timestamp) {
  if(pause) prev_timestamp = timestamp;
  if (timestamp - prev_timestamp > frame_length) {
    // NOTE: normalize if diagonal dir?
    if(player_dir[0] != 0 || player_dir[1] != 0) {
      const new_player_pos_x = player.position.x + player_dir[0] * player_speed;
      const new_player_pos_z = player.position.z + player_dir[1] * player_speed;
      const collided_area_pos = collide_area(new_player_pos_x, new_player_pos_z);

      const collided_shroom_pos = collide_shroom(player.position.x, player.position.z, collided_area_pos[0], collided_area_pos[1], null);

      player.position.x = collided_shroom_pos[0];
      player.position.z = collided_shroom_pos[1];
    }

    if(fire_bullet && timestamp - prev_bullet_timestamp > bullet_reload_time) {
      spawn_bullet(player.position.x, player.position.z);
      prev_bullet_timestamp = timestamp;
    }
    fire_bullet = false;

    for(let bullet of bullets) {
      bullet.position.z -= bullet_speed;
      if(bullet.position.z < -grid_size[1] - 0.5) {
        bullets.delete(bullet);
        scene.remove(bullet);
      }
    }

    for(let centipede of centipedes) {
      move_centipede(centipede);
    }

    renderer.render( scene, camera );
    prev_timestamp = timestamp;
  }

  requestAnimationFrame( animate );
};

animate();

function collide_area(x, z) {
  let out_pos = [x, z];
  if(x < player_area_extents[0]) out_pos[0] = player_area_extents[0];
  if(x > player_area_extents[1]) out_pos[0] = player_area_extents[1];
  if(z < player_area_extents[2]) out_pos[1] = player_area_extents[2];
  if(z > player_area_extents[3]) out_pos[1] = player_area_extents[3];
  return out_pos;
}

function collide_shroom(old_pos_x, old_pos_z, new_pos_x, new_pos_z, dir) {
  // NOTE: does not handle multiple shrooms
  let pos = [new_pos_x, new_pos_z];
  let cell = xz_to_cr(new_pos_x, new_pos_z);
  for(let col = -1; col <= 1; ++col) {
    if(cell[0] + col < 0 || cell[0] + col >= grid_size[0]) continue;
    for(let row = -1; row <= 1; ++row) {
      if(cell[1] + row < 0 || cell[1] + row >= grid_size[1]) continue;
      console.log('col: ', col, ' row: ', row, ' cell: ', cell);
      if(grid[cell[1] + row][cell[0] + col] === null) continue;
      // we have found a cell with a mushroom
      let shroom = grid[cell[1] + row][cell[0] + col];
      let dist = Math.sqrt((new_pos_x - shroom.position.x)**2 + (new_pos_z - shroom.position.z)**2);
      let old_dist = Math.sqrt((old_pos_x - shroom.position.x)**2 + (old_pos_z - shroom.position.z)**2)
      console.log('old dist: ', old_dist, ' new dist: ', dist, ' 2*shroom_radius: ', 2*shroom_radius);
      if(dist > 2*shroom_radius) continue;
      dist = (old_pos_x - shroom.position.x)**2 + (new_pos_z - shroom.position.z)**2
      if(dist > 2*shroom_radius) return [old_pos_x, new_pos_z];
      dist = (new_pos_x - shroom.position.x)**2 + (old_pos_z - shroom.position.z)**2
      if(dist > 2*shroom_radius) return [new_pos_x, old_pos_z];
      else return [old_pos_x, old_pos_z];            
    }
  }
  return pos;
}

function move_centipede(centipede) {
  let seg = centipede;
  while(seg !== null) {
    const old_seg_pos_x = seg.position.x;
    const old_seg_pos_z = seg.position.z;
    let new_seg_pos_x = seg.position.x + seg.userData.dir[0] * centipede_speed;
    let new_seg_pos_z = seg.position.z + seg.userData.dir[1] * centipede_speed;
    const old_seg_cell = xz_to_cr(old_seg_pos_x, old_seg_pos_z);
    const new_seg_cell = xz_to_cr(new_seg_pos_x, new_seg_pos_z);
    const next_seg_cell = [new_seg_cell[0] + seg.userData.dir[0], new_seg_cell[1] + seg.userData.dir[1]];
    const curr_seg_cell_center = cr_to_xz(old_seg_cell[0], old_seg_cell[1]);

    // If next cell is a mushroom, then let's set segment's prev_dir
    if( grid[next_seg_cell[1]][next_seg_cell[0]] !== null &&
        grid[next_seg_cell[1]][next_seg_cell[0]].userData.type === 'm' &&
        seg.userData.dir[1] == 0)
    {

      seg.userData.prev_dir = [seg.userData.dir[0], seg.userData.dir[1]];

    }

    // If we're crossing cell center then handle turning
//    if(is_crossing())
  
      //console.log('move_centipede: next_seg_cell: ', next_seg_cell);
      const shroom_pos = cr_to_xz(next_seg_cell[0], next_seg_cell[1]);
      const d_new_to_shroom = dist(shroom_pos[0], shroom_pos[1], new_seg_pos_x, new_seg_pos_z);
      
      // If we will collide with the shroom, let's move adjacent and then the rest of the move down
      if(d_new_to_shroom < 1.0) { 
        // Distance from previous position to shroom
        const d_old_to_shroom = dist(seg.position.x, seg.position.z, shroom_pos[0], shroom_pos[1]);
        // Distance that we still have to move (should not be negative!)
        const d_leftover = centipede_speed - (d_old_to_shroom - 1.0);
        // Distance to center of current cell (should not be negative!)
        const new_seg_cell_center = cr_to_xz(new_seg_cell[0], new_seg_cell[1]);
        // Move segment to center of current cell
        seg.position.x = new_seg_cell_center[0];
        seg.position.z = new_seg_cell_center[1];
        // Turn segment down
        seg.userData.prev_dir = seg.userData.dir;
        seg.userData.dir = [0, 1];
        seg.rotation.y = Math.atan2(-seg.userData.dir[1], seg.userData.dir[0]);
        // Move in new direction by leftover distance
        new_seg_pos_x = seg.position.x + seg.userData.dir[0] * d_leftover;
        new_seg_pos_z = seg.position.z + seg.userData.dir[1] * d_leftover;
        const d_old_pos_to_center = dist(seg.position.x, seg.position.z, new_seg_cell_center[0], new_seg_cell_center[1]);
        const d_to_old_cell_center = dist(seg.position.x, seg.position.z, )
        //console.log('move_centipede: d_leftover: ', d_leftover, ' d_old_pos_to_center: ', d_old_pos_to_center, ' d_old_to_shroom: ', d_old_to_shroom, 'centipede_speed: ', centipede_speed);

      }
    }



    seg.position.x = new_seg_pos_x;
    seg.position.z = new_seg_pos_z;
    seg = seg.userData.next_segment;
  }
}

function is_crossing(old_pos, center_pos, new_pos) {
  if(old_pos[0] != new_pos[0]) {
    if(new_pos[0] == center_pos[0]) return true;
    return (new_pos[0] - center_pos[0] < 0) !== (old_pos[0] - center_pos[0] < 0);
  } else {
    if(new_pos[1] == center_pos[1]) return true;
    return (new_pos[1] - center_pos[1] < 0) !== (old_pos[1] - center_pos[1] < 0);
  }
}


// // Klasi til að breyta texta í felliglugga í valmynd í tölu
// class StringToNumberHelper {
//   constructor(obj, prop) {
//     this.obj = obj;
//     this.prop = prop;
//   }
//   get value() {
//     return this.obj[this.prop];
//   }
//   set value(v) {
//     this.obj[this.prop] = parseFloat(v);
//   }
// }

// // Möguleikar í valmynd
// const magFilterModes = {
//   'Nearest': THREE.NearestFilter,
//   'Linear': THREE.LinearFilter
// };
// const minFilterModes = {
//   'Nearest': THREE.NearestFilter,
//   'Linear': THREE.LinearFilter,
//   'NearestMipmapNearest': THREE.NearestMipmapNearestFilter,
//   'NearestMipmapLinear': THREE.NearestMipmapLinearFilter,
//   'LinearMipmapNearest': THREE.LinearMipmapNearestFilter,
//   'LinearMipmapLinear': THREE.LinearMipmapLinearFilter
// };

// function updateTexture() {
//   floorTexture.needsUpdate = true;
// }

// function updateCamera() {
//   camera.updateProjectionMatrix();
// }



// Búa til valmynd með möguleikum fyrir stækkunar- og minnkunarsíun
// const gui = new dat.GUI();
// gui.add(new StringToNumberHelper(floorTexture, 'magFilter'), 'value', magFilterModes)
//         .name('floorTexture.magFilter')
//         .onChange(updateTexture);
// gui.add(new StringToNumberHelper(floorTexture, 'minFilter'), 'value', minFilterModes)
//         .name('floorTexture.minFilter')
//         .onChange(updateTexture);
// gui.add(floorTexture, 'anisotropy', 1, maxAniso)
//         .onChange(updateTexture);
// //gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
// gui.add(camera.position, 'x', 0, 10).onChange();
// gui.add(light.position, 'y', 0, 10).onChange();
