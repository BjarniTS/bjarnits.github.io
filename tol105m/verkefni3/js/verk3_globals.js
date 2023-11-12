const player_start_pos = [0.0, 0.0];
const shroom_radius = 0.5;
const grid_size = [15, 16];
const player_area_extents = [0.0 + 0.5, grid_size[0] - 0.5, Math.floor(-grid_size[1] / 4) + 0.5, 0.0 - 0.5];
const fps = 60;
const bullet_reload_time = 100;
const bullet_speed = 6.0 / fps;
const player_speed = 10.0 / fps;
const centipede_speed = 5.0 / fps;
const frame_length = 1000 / fps;
let grid = multi_array(grid_size[0], grid_size[1]);
const bullets = new Set();
const centipedes = new Set();
const canvas = document.querySelector('#c');
canvas.width = canvas.height * 1.0 * grid_size[0] / grid_size[1];
let points = 0;


// console.log(is_crossing_center([1.0, 2.0], [1.5, 2.0], [1.6, 2.0]));
// console.log(is_crossing_center([1.0, 2.0], [1.0, 2.0], [1.6, 2.0]));
// console.log(is_crossing_center([1.0, 2.0], [1.5, 2.0], [1.5, 2.0]));

// console.log(is_crossing_center([1.0, 2.0], [1.5, 2.0], [0.9, 2.0]));
// console.log(is_crossing_center([1.0, 2.0], [1.0, 2.0], [1.0, 2.0]));
// console.log(is_crossing_center([1.0, 2.0], [1.5, 2.0], [1.4, 2.0]));

// console.log(is_crossing_center([1.0, 2.0], [1.0, 2.5], [1.0, 2.6]));
// console.log(is_crossing_center([1.0, 2.0], [1.0, 2.0], [1.0, 2.6]));
// console.log(is_crossing_center([1.0, 2.0], [1.0, 2.5], [1.0, 2.5]));

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





    


  
      // //console.log('move_centipede: next_seg_cell: ', next_seg_cell);
      // const shroom_pos = cr_to_xz(next_cell[0], next_cell[1]);
      // const d_new_to_shroom = dist(shroom_pos[0], shroom_pos[1], new_pos_x, new_pos_z);
      
      // // If we will collide with the shroom, let's move adjacent and then the rest of the move down
      // if(d_new_to_shroom < 1.0) { 
      //   // Distance from previous position to shroom
      //   const d_old_to_shroom = dist(seg.position.x, seg.position.z, shroom_pos[0], shroom_pos[1]);
      //   // Distance that we still have to move (should not be negative!)
      //   const d_leftover = centipede_speed - (d_old_to_shroom - 1.0);
      //   // Distance to center of current cell (should not be negative!)
      //   const new_seg_cell_center = cr_to_xz(new_cell[0], new_cell[1]);
      //   // Move segment to center of current cell
      //   seg.position.x = new_seg_cell_center[0];
      //   seg.position.z = new_seg_cell_center[1];
      //   // Turn segment down
      //   seg.userData.prev_dir = seg.userData.dir;
      //   seg.userData.dir = [0, 1];
      //   seg.rotation.y = Math.atan2(-seg.userData.dir[1], seg.userData.dir[0]);
      //   // Move in new direction by leftover distance
      //   new_pos_x = seg.position.x + seg.userData.dir[0] * d_leftover;
      //   new_pos_z = seg.position.z + seg.userData.dir[1] * d_leftover;
      //   const d_old_pos_to_center = dist(seg.position.x, seg.position.z, new_seg_cell_center[0], new_seg_cell_center[1]);
      //   const d_to_old_cell_center = dist(seg.position.x, seg.position.z, )
      //   //console.log('move_centipede: d_leftover: ', d_leftover, ' d_old_pos_to_center: ', d_old_pos_to_center, ' d_old_to_shroom: ', d_old_to_shroom, 'centipede_speed: ', centipede_speed);

      // }
    //}

