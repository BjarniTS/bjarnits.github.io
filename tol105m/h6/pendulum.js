/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun stigveldislíkana.  Forritið robotArm er
//     úr kennslubókinni en nú er hægt að snúa líkaninu með mús.
//
//    Hjálmtýr Hafsteinsson, október 2023
/////////////////////////////////////////////////////////////////
var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -25.0;

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 )   // white
];


// Parameters controlling the size of the Robot's arm
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;

// Shader transformation matrices

var projectionMatrix;

let theta1 = 0.0;
let theta2 = 0.0;
let dtheta1 = 0.15;
let dtheta2 = 0.25;
let theta1_max = 70.0;
let theta2_max = 85.0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[b]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]);
    colors.push(vertexColors[a]); 
    points.push(vertices[a]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[c]); 
    colors.push(vertexColors[a]); 
    points.push(vertices[d]); 
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST ); 
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    gl.useProgram( program );

    colorCube();
    
    // Load shaders and use the resulting shader program
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );    
    gl.useProgram( program );

    // Create and initialize  buffer objects
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.clientX - origX) ) % 360;
            spinX = ( spinX + (origY - e.clientY) ) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    } );

    // Event listener for mousewheel
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 1.0;
         } else {
             zDist -= 1.0;
         }
     }  );  
    
    render();
}

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    // Staðsetja áhorfanda og meðhöndla músarhreyfingu
    var mv = lookAt( vec3(0.0, 2.0, zDist), vec3(0.0, 2.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );
 
    mv = mult(mv, translate(0.0, 8.0, 0.0)); 
    mv = mult(mv, rotateZ( theta1 ));

    var s = scalem(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( 0.0, -0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);    
    var t = mult(mv, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    mv  = mult(mv, translate(0.0, -UPPER_ARM_HEIGHT, 0.0));
    mv  = mult(mv, rotateZ( theta2 ) );

    var s = scalem(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, -0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(mv, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    if(Math.abs(theta1) > theta1_max) dtheta1 = -dtheta1;
    if(Math.abs(theta2) > theta2_max) dtheta2 = -dtheta2;
    theta1 += dtheta1;
    theta2 += dtheta2;

    requestAnimFrame(render);
}



