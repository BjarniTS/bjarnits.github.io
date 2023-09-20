/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Ferningur skoppar um gluggann og af spaða sem notandi getur hreyft með hægri/vinstri örvum.  Notandi getur breytt
//     hraða kassans með upp/niður örvum.
//
//    Bjarni Þór Sigurðsson (byggt á grunni frá Hjálmtý Hafsteinssyni, september 2023)
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var bufferBox;
var bufferPaddle;
var vPosition;

var locCenter;
var locPaddle;
var locBox

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð spaða og fernings
var boxRad = 0.05;
var paddleW = 0.2;
var paddleH = 0.02;

// Ferningurinn er upphaflega í miðjunni
var boxVerts = new Float32Array([-boxRad, -boxRad, boxRad, -boxRad, boxRad, boxRad, -boxRad, boxRad]);
var paddleVerts = new Float32Array([-paddleW, -paddleH, paddleW, -paddleH, paddleW, paddleH, -paddleW, paddleH]);

window.onload = function init() {
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Upphafsstaðsetningar kassa og spaða
    locPaddle = new Float32Array([0.0, -0.88]);
    locBox = new Float32Array([0.0, 0.0]);

    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    bufferBox = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBox );
    gl.bufferData( gl.ARRAY_BUFFER, boxVerts, gl.DYNAMIC_DRAW );
    
    bufferPaddle = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPaddle );
    gl.bufferData( gl.ARRAY_BUFFER, paddleVerts, gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );
    
    locCenter = gl.getUniformLocation( program, "centerPos" );

    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38:	// upp ör
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40:	// niður ör
                dX /= 1.1;
                dY /= 1.1;
                break;
            case 37:	// vinstri ör
                if(locPaddle[0] - paddleW > -0.95)
                    locPaddle[0] -= 0.04;
                break;
            case 39:	// hægri ör
                if(locPaddle[0] + paddleW < 0.95)
                    locPaddle[0] += 0.04;
                break;
            default:
                xmove = 0.0;
        }
    } );

    render();
}


function render() {
    
    // Er árekstur?
    br_to_pl = locBox[0] + boxRad < locPaddle[0] - paddleW;
    bl_to_pr = locBox[0] - boxRad > locPaddle[0] + paddleW;
    bb_to_pt = locBox[1] - boxRad > locPaddle[1] + paddleH;
    bt_to_pb = locBox[1] + boxRad < locPaddle[1] - paddleH;
    no_coll = br_to_pl || bl_to_pr || bb_to_pt || bt_to_pb;
    if(!no_coll) dY = -dY;

    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(locBox[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(locBox[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    locBox[0] += dX;
    locBox[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Draw paddle
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPaddle );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform2fv( locCenter, locPaddle );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    
    // Draw box
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBox );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform2fv( locCenter, locBox );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );


    window.requestAnimFrame(render);
}
