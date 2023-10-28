/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Forrit með tveimur mynstrum.  Sýnir vegg með
//     múrsteinsmynstri og gólf með viðarmynstri.  Það er hægt
//     að ganga um líkanið, en það er engin árekstarvörn.
//
//    Hjálmtýr Hafsteinsson, mars 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 6;

var program;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texture;
var texVegg;
var texGolf;
var texThak;

var vTexCoord;

// Breytur fyrir hreyfingu áhorfanda
var userXPos = 0.0;
var userZPos = 2.0;
var userIncr = 0.1;                // Size of forward/backward step
var userAngle = 270.0;             // Direction of the user in degrees
var userXDir = 0.0;                // X-coordinate of heading
var userZDir = -1.0;               // Z-coordinate of heading


var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -5.0;

var proLoc;
var mvLoc;

// Hnútar veggsins
var vertices = [
    vec4( -5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4( -5.0,  1.0, 0.0, 1.0 ),
    vec4( -5.0,  0.0, 0.0, 1.0 ),
// Hnútar gólfsins (strax á eftir)
    vec4( -5.0,  0.0, 10.0, 1.0 ),
    vec4(  5.0,  0.0, 10.0, 1.0 ),
    vec4(  5.0,  0.0,  0.0, 1.0 ),
    vec4(  5.0,  0.0,  0.0, 1.0 ),
    vec4( -5.0,  0.0,  0.0, 1.0 ),
    vec4( -5.0,  0.0, 10.0, 1.0 )
];

var texCoords = [
    // Mynsturhnit fyrir vegg
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
    // Mynsturhnit fyrir gólf
    vec2(  0.0,  0.0 ),
    vec2( 10.0,  0.0 ),
    vec2( 10.0, 10.0 ),
    vec2( 10.0, 10.0 ),
    vec2(  0.0, 10.0 ),
    vec2(  0.0,  0.0 ),
    // Mynsturhnit fyrir stutta veggi
    vec2( 0.0, 0.0 ),
    vec2( 4.5, 0.0 ),
    vec2( 4.5, 1.0 ),
    vec2( 4.5, 1.0 ),
    vec2( 0.0, 1.0 ),
    vec2( 0.0, 0.0 ),
    // Mynsturhnit fyrir stutta veggi
    vec2( 0.0, 0.0 ),
    vec2( 1.0, 0.0 ),
    vec2( 1.0, 1.0 ),
    vec2( 1.0, 1.0 ),
    vec2( 0.0, 1.0 ),
    vec2( 0.0, 0.0 )
];

function aabb_v_point(box_pos, box_half_x, box_half_z, point) {
    /* RET: true if collision, false otherwise */
    front = box_pos[1] + box_half_z;
    back = box_pos[1] - box_half_z;
    left = box_pos[0] - box_half_x;
    right = box_pos[0] + box_half_x;

    back_of_front = point[1] < front;
    front_of_back = point[1] > back;
    left_of_right = point[0] < right;
    right_of_left = point[0] > left;

    return back_of_front && front_of_back && left_of_right && right_of_left;
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    console.log(vertices[0].type);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Lesa inn og skilgreina mynstur fyrir vegg
    var veggImage = document.getElementById("VeggImage");
    texVegg = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, veggImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Lesa inn og skilgreina mynstur fyrir gólf
    var golfImage = document.getElementById("GolfImage");
    texGolf = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, golfImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Lesa inn og skilgreina mynstur fyrir þak
    var thakImage = document.getElementById("ThakImage");
    texThak = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texThak );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, thakImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);


    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            userAngle += 0.4*(origX - e.clientX);
            userAngle %= 360.0;
            userXDir = Math.cos( radians(userAngle) );
            userZDir = Math.sin( radians(userAngle) );
            origX = e.clientX;
        }
    } );
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
        newXPos = 0;
        newZPos = 0;
        switch( e.keyCode ) {
        case 87:	// w
            newXPos = userXPos + userIncr * userXDir;
            newZPos = userZPos + userIncr * userZDir;
            break;
        case 83:	// s
            newXPos = userXPos - userIncr * userXDir;
            newZPos = userZPos - userIncr * userZDir;
            break;
        case 65:	// a
            newXPos = userXPos + userIncr * userZDir;
            newZPos = userZPos - userIncr * userXDir;
            break;
        case 68:	// d
            newXPos = userXPos - userIncr * userZDir;
            newZPos = userZPos + userIncr * userXDir;
            break;
        }

        backWallColl = aabb_v_point([0.0, 0.0], 5.0, 0.2, [newXPos, newZPos]);
        frontLeftWallColl = aabb_v_point([-2.75, 10.0], 2.25, 0.2, [newXPos, newZPos]);
        frontRightWallColl = aabb_v_point([2.75, 10.0], 2.25, 0.2, [newXPos, newZPos]);
        sideLeftWallColl = aabb_v_point([-5.0, 5.0], 0.2, 5.0, [newXPos, newZPos]);
        sideRightWallColl = aabb_v_point([5.0, 5.0], 0.2, 5.0, [newXPos, newZPos]);
        
        if(!backWallColl && !frontLeftWallColl && !frontRightWallColl)
            userZPos = newZPos;        
        if(!sideLeftWallColl && !sideRightWallColl)
            userXPos = newXPos;
        
        console.log(userXPos, userZPos);
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  


    render();
 
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // staðsetja áhorfanda og meðhöndla músarhreyfingu
    var mv = lookAt( vec3(userXPos, 0.5, userZPos), vec3(userXPos+userXDir, 0.5, userZPos+userZDir), vec3(0.0, 1.0, 0.0 ) );
    
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    // Teikna framvegg með mynstri
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    // Teikna vinstri vegg
    var mv_v = mult(mv, translate(-5.0, 0.0, 5.0));
    mv_v = mult(mv_v, rotateY(90));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_v));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Teikna hægri vegg
    mv_v = mult(mv_v, translate(0.0, 0.0, 10.0));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_v));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Teikna styttri bakveggi
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 12 * 2 * 4 );
    // - Teikna vinstri bakvegg
    var mv_b = mult(mv, translate(-2.75, 0.0, 10.0));
    mv_b = mult(mv_b, scalem(0.45, 1.0, 1.0));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_b));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // - Teikna hægri bakvegg
    var mv_b = mult(mv, translate(2.75, 0.0, 10.0));
    mv_b = mult(mv_b, scalem(0.45, 1.0, 1.0));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_b));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Teikna gólf með mynstri
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );

    // Teikna þak með mynstri
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 12 * 2 * 4 );
    mv = mult(mv, translate(0.0, 1.0, 0.0));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.bindTexture( gl.TEXTURE_2D, texThak );
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );


    requestAnimFrame(render);
}
