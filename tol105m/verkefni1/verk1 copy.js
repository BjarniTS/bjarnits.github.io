var gl;
var vPosition;
var fColor;
var iObjectID;
var frogPosition;
var frogAngle;

var buffer_sidewalk;
var buffer_road;
var buffer_frog;
var sidewalk_color;
var road_color;
var frog_color;
var car_color;
var car_width;
var car_positions;
var point_pos;
var frog_position;
var frog_angle;
var frog_lane;
var frog_column;
var frog_size;
var points = 0;
var fps = 60;
var lane_speeds;
var car_speed = 0.2 / fps;
var victory = 0;

window.onload = function init()
{
  var canvas = document.getElementById( "gl-canvas" );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  

  let width = 512;
  let height = 512;
  canvas.width = width;
  canvas.height = height;

  let aspect = width / height;
  let verge_height = 0.2;
  let lane_height = (2.0 - 2*verge_height) / 7;
  let sidewalk_y = -1.0 + verge_height;
  let road_y = sidewalk_y + lane_height;
  let road_height = 2.0 - 2*(1 + sidewalk_y + lane_height);
  frog_size = 0.25 * lane_height;
  frog_lane = -3;
  frog_column = 0;
  let column_width = (2.0 - 0.1) / 15;
  let start_lane_y = (road_y + sidewalk_y) / 2;
  let last_lane_y = 6 * lane_height + start_lane_y;

  let sidewalk_verts = new Float32Array([-1.0, sidewalk_y, 1.0, sidewalk_y, 1.0, -sidewalk_y, -1.0, -sidewalk_y]);
  sidewalk_color = new Float32Array([0.6, 0.6, 0.6, 1.0]);

  let road_verts = new Float32Array([-1.0, road_y, 1.0, road_y, 1.0, -road_y, -1.0, -road_y]);
  road_color = new Float32Array([0.1, 0.1, 0.1, 1.0]);

  point_pos = vec2(0.9, (-sidewalk_y - road_y) / 2 );
  let point_width = 0.02;
  let point_height = point_width * 3;
  let point_verts = new Float32Array([-point_width, -point_height, point_width, -point_height, point_width, point_height, -point_width, point_height]);

  car_width = 0.11;
  let car_height = 0.3 * lane_height;
  car_positions = [[vec2(0.5, 2 * lane_height), vec2(-0.3, 2 * lane_height), vec2(-0.9, 2 * lane_height)],
                   [vec2(0.2, lane_height), vec2(-0.8, lane_height)],
                   [vec2(-0.3, 0.0), vec2(0.9, 0.0), vec2(-0.9, 0.0)],
                   [vec2(0.1, -lane_height), vec2(-0.8, -lane_height)],
                   [vec2(-0.2, -2 * lane_height)]];
  let car_verts = make_car_verts(car_width, car_height);
  car_color = new Float32Array([1.0, 0.1, 0.1, 1.0]);
  lane_speeds = [0.1 / fps, 0.2 / fps, 0.11 / fps, 0.3 / fps, 0.12 / fps];

  let frog_verts = new Float32Array([-frog_size, -frog_size, frog_size, -frog_size, 0.0, frog_size]);
  frog_color = new Float32Array([0.0, 1.0, 0.0, 1.0]);
  frog_position = new Float32Array([0.0, frog_lane * lane_height]);
  frog_angle = 0.0;

  //  Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.1, 0.9, 0.1, 1.0 );
  
  //  Load shaders and initialize attribute buffers  
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );
  
  // Load the data into the GPU  
  buffer_sidewalk = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer_sidewalk );
  gl.bufferData( gl.ARRAY_BUFFER, sidewalk_verts, gl.STATIC_DRAW );
  
  buffer_road = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer_road );
  gl.bufferData( gl.ARRAY_BUFFER, road_verts, gl.STATIC_DRAW );

  buffer_point = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer_point);
  gl.bufferData(gl.ARRAY_BUFFER, point_verts, gl.STATIC_DRAW);

  buffer_frog = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer_frog);
  gl.bufferData(gl.ARRAY_BUFFER, frog_verts, gl.STATIC_DRAW);

  buffer_car = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer_car);
  gl.bufferData(gl.ARRAY_BUFFER, car_verts, gl.STATIC_DRAW);

  // Associate shader variables with our data buffer  
  vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  fColor = gl.getUniformLocation( program, "fColor" );
  iObjectID = gl.getUniformLocation(program, "iObjectID");
  vCenter = gl.getUniformLocation(program, "vCenter");
  frogAngle = gl.getUniformLocation(program, "frogAngle");
  console.log(lane_height);

  window.addEventListener( "keydown", (event) => {
      if (event.defaultPrevented) return;
  
      switch (event.code) {
        case "KeyA":
        case "ArrowLeft":
          if(frog_column != -7) {
            frog_column--;
          }
          frog_position[0] = frog_column * column_width;
          break;
        case "KeyD":
        case "ArrowRight":
          if(frog_column != 7) {
            frog_column++;
          }
          frog_position[0] = frog_column * column_width;
          break;
        case "KeyS":
        case "ArrowDown":
          if(frog_lane != -3) {
            frog_lane--;
            if(frog_lane == -3  && frog_angle > 0.1) {
              points++;
              if(points == 10) console.log("yay!");
              frog_angle = 0.0;
            }
            frog_position[1] = frog_lane * lane_height;
          }
          break;
        case "KeyW":
        case "ArrowUp":
          if(frog_lane != 3) {
            frog_lane++;
            if(frog_lane == 3  && frog_angle < 0.1) {
              points++;              
              frog_angle = 3.14159265;
            }
            frog_position[1] = frog_lane * lane_height;
          }
          break;        
      }
  
      if (event.code !== "Tab") event.preventDefault();
    },
    true,
  );

  render();
};

function make_car_verts(width, height) {
  let verts = new Float32Array([-width, -height, width, -height, width, height, -width, height]);
  return verts;
}


function render() {  
  
  setTimeout( function() {
    window.requestAnimFrame(render);
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Draw sidewalk  
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_sidewalk );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( fColor, sidewalk_color );
    gl.uniform1i(iObjectID, 0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    // Draw road
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_road );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( fColor, road_color );
    gl.uniform1i(iObjectID, 0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    // Draw frog
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer_frog );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( fColor, frog_color );
    gl.uniform2fv(vCenter, frog_position);
    gl.uniform1i(iObjectID, 2);
    gl.uniform1f(frogAngle, frog_angle);
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    // Draw points
    for(let i = 0; i < points; i++) {
      gl.bindBuffer( gl.ARRAY_BUFFER, buffer_point );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.uniform4fv( fColor, vec4(1.0, 1.0, 1.0, 1.0) );
      gl.uniform2fv(vCenter, vec2(point_pos[0] - i*0.05, point_pos[1]));
      gl.uniform1i(iObjectID, 2);
      gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    }

    // Draw cars and check collision
    for(let lane = 0; lane < car_positions.length; lane++) {
      for (pos of car_positions[lane]) {
        pos[0] += lane_speeds[lane];
        let car_left_end = pos[0] - car_width;
        let car_right_end = pos[0] + car_width;
        if(car_left_end > 1.0) {
          console.log(pos[0] - car_width)
          pos[0] = -1.0 - car_width;
        }
        
        
        if(frog_lane == -lane + 2) {
          let frog_left_end = frog_position[0] - frog_size;
          let frog_right_end = frog_position[0] + frog_size;
          //console.log("frog left, right", frog_position[0] - frog_size, " ", frog_position[0] + frog_size, " car left, right", car_left_end, " ", car_right_end);
          if((frog_right_end > car_left_end && frog_right_end < car_right_end) ||
             (frog_left_end > car_left_end && frog_left_end < car_right_end))
                console.log("oh no");
            
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, buffer_car );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( fColor, car_color );
        gl.uniform2fv(vCenter, pos);
        gl.uniform1i(iObjectID, 2);
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

      }

      if(victory == 5) alert("Victory");
      if(points == 2) {
        victory++;
        //return;
      }
    }

    

  }, 1000/fps);

  

}
