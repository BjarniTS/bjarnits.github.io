"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, 1 ),
        vec2(  1,  1 ),
        vec2(  -1, -1 ),
        vec2( 1, -1 )
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function square( a, b, c, d )
{
    points.push( a, b, c, b, c, d );
}

function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //bisect the sides

        var aab = mix( a, b, 1/3 );
        var abb = mix( a, b, 2/3 );
        var aac = mix( a, c, 1/3 );
        var acc = mix( a, c, 2/3 );
        var bbd = mix( b, d, 1/3 );
        var bdd = mix( b, d, 2/3 );
        var ccd = mix( c, d, 1/3 );
        var cdd = mix( c, d, 2/3 );
        var aad = mix( a, d, 1/3 );
        var add = mix( a, d, 2/3 );
        var bbc = mix( b, c, 1/3 );
        var bcc = mix( b, c, 2/3 );

        --count;

        // eight new squares

        divideSquare( a, aab, aac, aad, count );
        divideSquare( aab, abb, aad, bbc, count );
        divideSquare( abb, b, bbc, bbd, count );
        divideSquare( aac, aad, acc, bcc, count );
        //divideSquare( aad, bbc, bcc, add, count );
        divideSquare( bbc, bbd, add, bdd, count );
        divideSquare( acc, bcc, c, ccd, count );
        divideSquare( bcc, add, ccd, cdd, count );
        divideSquare( add, bdd, cdd, d, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
