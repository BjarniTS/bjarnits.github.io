/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Utah tepotturinn litaður með Phong litun.  Notar útfærslu
//     á tepottinum sem fylgir kennslubókinni.  Hægt að snúa
//     honum með músinni og færa nær með skrunhjóli
//
//    Hjálmtýr Hafsteinsson, október 2023
/////////////////////////////////////////////////////////////////

var normalMatrix, normalMatrixLoc;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -5.0;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
    
var fovy = 50.0;
var near = 0.2;
var far = 100.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 150.0;

var flag = true;

var program;
var canvas, render, gl;

var points = [];
var normals = [];

onload = function init()  {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var myTeapot = teapot(5);
    myTeapot.scale(0.5, 0.5, 0.5);

    console.log(myTeapot.TriangleVertices.length);

    points = myTeapot.TriangleVertices;
    normals = myTeapot.Normals;


    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    projectionMatrix = perspective( fovy, 1.0, near, far );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );


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
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38:	// upp ör
                lightPosition[1] += 0.1;
                gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
                break;
            case 40:	// niður ör
                lightPosition[1] -= 0.1;
                gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
                break;
            case 37:	// vinstri ör
                lightPosition[0] -= 0.1;
                gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
                break;
            case 39:	// hægri ör
                lightPosition[0] += 0.1;
                gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
                break;
            default:
                if(e.keyCode >= 49 && e.keyCode <= 57) {
                    gl.deleteBuffer(vBuffer);
                    gl.deleteBuffer(nBuffer);
                    vBuffer = gl.createBuffer();
                    nBuffer = gl.createBuffer();

                    myTeapot = teapot(e.keyCode - 48);
                    myTeapot.scale(0.5, 0.5, 0.5);
                    points = myTeapot.TriangleVertices;
                    normals = myTeapot.Normals;

                    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
                    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
                    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
                    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
                    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
                }
        }
    }  );

    render();
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mv = lookAt( vec3(0.0, 0.0, zDist), at, up );
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(mv) );
    normalMatrix = [
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2])
    ];

    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length);
    requestAnimFrame(render);
  }
