import * as THREE from "three";
import {
  spawn_bullet,
  spawn_shroom,
  spawn_centipede,
  spawn_centipede_head,
  make_player,
  make_floor,
  set_turn,
  set_walls
} from "entities";
// NOTE: have the centipede shoot a shot when it turns down?

//set_walls();
console.log(grid);


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
spawn_centipede(8, 2, 4, [-1,0], scene);
//set_turn(5, 2, [0, -1]);

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
      spawn_bullet(player.position.x, player.position.z, scene);
      prev_bullet_timestamp = timestamp;
    }
    fire_bullet = false;

    for(let bullet of bullets) {
      bullet.position.z -= bullet_speed;
      if(bullet.position.z < -grid_size[1] - 0.5) {
        bullets.delete(bullet);
        scene.remove(bullet);
      }

      // Check collision between bullets and centipedes
      for(let centipede of centipedes) {
        let seg = centipede;
        while(seg !== null) {
          if(dist(bullet.position.x, bullet.position.z, seg.position.x, seg.position.z) < 0.5) {
            // Remove the bullet that hit
            bullets.delete(bullet);
            scene.remove(bullet);

            // If we hit a non-head segment then set the previous segment's reference to it to null
            if(seg.userData.prev_segment !== null) {
              console.log(seg.userData.prev_segment);
              const prev_seg = seg.userData.prev_segment;
              prev_seg.userData.next_segment = null;
            } else {
              // If we hit a head segment then remove it from list of centipedes
              centipedes.delete(seg);
            }

            scene.remove(seg);

            // Spawn a mushroom in place of the segment
            const seg_cell = xz_to_cr(seg.position.x, seg.position.z);
            spawn_shroom(seg_cell[0], seg_cell[1], scene);

            // If we hit a non-end segment then replace next segment with head
            if(seg.userData.next_segment !== null) {
              const next_seg = seg.userData.next_segment;
              const next_seg_cell = xz_to_cr(next_seg.position.x, next_seg.position.z);
              const new_head = spawn_centipede_head(next_seg_cell[0], next_seg_cell[1], next_seg.userData.dir);
              new_head.userData = next_seg.userData;
              new_head.userData.head = new_head;
              
              const next_next_seg = next_seg.userData.next_segment;
              next_next_seg.userData.prev_segment = new_head;
              scene.remove(next_seg);
              scene.add(new_head);
              centipedes.add(new_head);
              next_seg.userData.prev_segment = null;

              // Move all the segments from the new centipede to center of their cells
              let seg_to_adjust = new_head.userData.next_segment;
              while(seg_to_adjust !== null) {
                const cell = xz_to_cr(seg_to_adjust.position.x, seg_to_adjust.position.z);
                const center = cr_to_xz(cell[0], cell[1]);
                seg_to_adjust.position.x = center[0];
                seg_to_adjust.position.z = center[1];

                seg_to_adjust = seg_to_adjust.userData.next_segment;
              }


            }

            console.log("bullet strike!");
          }
          seg = seg.userData.next_segment;
        }
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
    const old_pos_x = seg.position.x;
    const old_pos_z = seg.position.z;
    let new_pos_x = seg.position.x + seg.userData.dir[0] * centipede_speed;
    let new_pos_z = seg.position.z + seg.userData.dir[1] * centipede_speed;
    const old_cell = xz_to_cr(old_pos_x, old_pos_z);
    const new_cell = xz_to_cr(new_pos_x, new_pos_z);
    const old_cell_center = cr_to_xz(old_cell[0], old_cell[1]);
    
    // If we're the head and are crossing into a new cell...
    if(seg.userData.head == seg && is_crossing_cells(old_cell, new_cell)) {
      const next_cell = [new_cell[0] + seg.userData.dir[0], new_cell[1] + seg.userData.dir[1]];
      const vert_cell = [new_cell[0], new_cell[1] - seg.userData.vert_dir];
      
      // Get some states
      //const heading_into_mushroom = grid[next_cell[1]][next_cell[0]] !== null && grid[next_cell[1]][next_cell[0]].userData.type === 'm';
      const heading_laterally = seg.userData.dir[1] == 0;
      const heading_into_obstacle = is_out_of_bounds(next_cell)                || 
                                    (grid[next_cell[1]][next_cell[0]] !== null && 
                                     grid[next_cell[1]][next_cell[0]].userData.type === 'm');

      const vert_obstacle =         is_out_of_bounds(vert_cell)                ||
                                    (grid[vert_cell[1]][vert_cell[0]] !== null && 
                                     grid[vert_cell[1]][vert_cell[0]].userData.type === 'm');
      
      console.log('new cell: ', new_cell, ' next_cell: ', next_cell, ' vert_cell: ', vert_cell, ' heading_into_obstacle: ', heading_into_obstacle, ' vert_obstacle: ', vert_obstacle);
      // If next cell is a mushroom and we're moving laterally then
      // turn and put down turn tokens
      if( heading_into_obstacle && heading_laterally) {
        console.log('next is obstacle');
        if(vert_obstacle) seg.userData.vert_dir *= -1;
        
        set_turn(new_cell[0], new_cell[1], [0, seg.userData.vert_dir]);
        set_turn(new_cell[0], new_cell[1] - seg.userData.vert_dir, [-seg.userData.dir[0], seg.userData.dir[1]]);
  
      }      
    }
    
    // If we're crossing cell center and the cell has a turn token then we need to turn
    if( !is_out_of_bounds(new_cell) &&
        is_crossing_center([old_pos_x, old_pos_z], old_cell_center, [new_pos_x, new_pos_z]) &&
        grid[new_cell[1]][new_cell[0]] !== null && grid[new_cell[1]][new_cell[0]].userData.type == 't') {
      // Move to current cell center
      // - Distance to cell center
      const d_old_to_center = dist(old_pos_x, old_pos_z, old_cell_center[0], old_cell_center[1]);
      // - Distance that we still have to move (should not be negative!)
      const d_leftover = centipede_speed - d_old_to_center;
      seg.position.x = old_cell_center[0];
      seg.position.z = old_cell_center[1];
  
      // Turn
      seg.userData.prev_dir = seg.userData.dir;
      seg.userData.dir = grid[new_cell[1]][new_cell[0]].userData.dir;
      seg.rotation.y = Math.atan2(-seg.userData.dir[1], seg.userData.dir[0]);
  
      // Move rest of move
      new_pos_x = seg.position.x + seg.userData.dir[0] * d_leftover;
      new_pos_z = seg.position.z + seg.userData.dir[1] * d_leftover;
    }

    seg.position.x = new_pos_x;
    seg.position.z = new_pos_z;
    seg = seg.userData.next_segment;
  }
}

function is_crossing_center(old_pos, center_pos, new_pos) {
  if(old_pos[0] != new_pos[0]) {
    if(old_pos[0] == center_pos[0]) return true;
    return (new_pos[0] - center_pos[0] < 0) !== (old_pos[0] - center_pos[0] < 0);
  } else {
    if(old_pos[1] == center_pos[1]) return true;
    return (new_pos[1] - center_pos[1] < 0) !== (old_pos[1] - center_pos[1] < 0);
  }
}

function is_crossing_cells(old_cell, new_cell) {
  return old_cell[0] !== new_cell[0] || old_cell[1] !== new_cell[1];
}

function is_out_of_bounds(cell) {
  return  cell[0] >= grid_size[0] ||
          cell[0] < 0             ||
          cell[1] >= grid_size[1] ||
          cell[1] < 0;
}

