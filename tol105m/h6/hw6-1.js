let arm_length = 0.4;
let modelViewMatrixLoc;
let colorLoc;

let theta1 = 0.0;
let theta2 = 0.0;
let dtheta1 = 0.1;
let dtheta2 = 0.2;
let theta1_max = 70.0;
let theta2_max = 85.0;

let pos1y = 0.5;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");    
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert("WebGL isn't available"); }
  program = initShaders(gl, "vertex-shader", "fragment-shader");    
  gl.useProgram(program);
  gl.clearColor(0.9, 1.0, 1.0, 1.0);

  let arm_thickness = 0.02;
  let verts = new Float32Array([
    arm_thickness / 2.0, 0.0,           // top right
    -arm_thickness / 2.0, 0.0,          // top left
    -arm_thickness / 2.0, -arm_length, // bottom left
    arm_thickness / 2.0, -arm_length   // bottom right
  ]);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  colorLoc = gl.getUniformLocation( program, "fColor" );

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

  render();
}

var render = function() {

  gl.clear(gl.COLOR_BUFFER_BIT);

  let mv = mat4();
  mv = mult(mv, translate(0.0, pos1y, 0.0));
  mv = mult(mv, rotateZ(theta1));

  // Parent arm
  gl.uniform4fv(colorLoc, vec4(1.0, 0.0, 0.0, 1.0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv));
  gl.drawArrays( gl.TRIANGLE_FAN, 0, 4);

  // Child arm
  mv = mult(mv, translate(0.0, -arm_length, 0.0));
  mv = mult(mv, rotateZ(theta2));

  gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 1.0, 1.0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  if(Math.abs(theta1) > theta1_max) dtheta1 = -dtheta1;
  if(Math.abs(theta2) > theta2_max) dtheta2 = -dtheta2;
  theta1 += dtheta1;
  theta2 += dtheta2;

  requestAnimFrame(render);
}