///////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Einfaldasta WebGL forritið.  Teiknar einn rauðan þríhyrning.
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
///////////////////////////////////////////////////////////////////
var gl;
var points;
var initTime;
var locTime;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = new Float32Array([-0.2, -0.2, 0, 0.2, 0.2, -0.2]);

    var translate = mat4(
        vec4(1.0, 0.0, 0.0, 10.0),
        vec4(0.0, 1.0, 0.0, 5.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    var rotate = mat4(
        vec4(Math.cos(Math.PI / 2.0), -Math.sin(Math.PI / 2.0), 0.0, 0.0),
        vec4(Math.sin(Math.PI / 2.0), Math.cos(Math.PI / 2.0),  0.0, 0.0),
        vec4(0.0,                     0.0,                      1.0, 0.0),
        vec4(0.0,                     0.0,                      0.0, 1.0)
    );

    var scale = mat4(
        vec4(0.5, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    var translate2d = mat3(
        vec3(1.0, 0.0, 1.0),
        vec3(0.0, 1.0, 1.0),
        vec3(0.0, 0.0, 1.0)
    );

    var rotate2d = mat3(
        vec3(0.0, -1.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 0.0, 1.0)
    );

    var mv2d = mult(translate2d, rotate2d);
    console.log(mv2d);
    var mv2dr = mult(rotate2d, translate2d);
    console.log(mv2dr);

    var mv = mult(translate, rotate);
    mv = mult(mv, scale);
    console.log(mv)

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locTime = gl.getUniformLocation(program, "time");
    rotation = gl.getUniformLocation(program, "rotation");

    initTime = Date.now()

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    var mv = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.2, 0.0, 0.0, 1.0
    ];

    var translate = mat4(
        vec4(1.0, 0.0, 0.0, 0.2),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    var rotate = mat4(
        vec4(Math.cos(Math.PI / 2.0), -Math.sin(Math.PI / 2.0), 0.0, 0.0),
        vec4(Math.sin(Math.PI / 2.0), Math.cos(Math.PI / 2.0),  0.0, 0.0),
        vec4(0.0,                     0.0,                      1.0, 0.0),
        vec4(0.0,                     0.0,                      0.0, 1.0)
    );

    var scale = mat4(
        vec4(0.5, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    var mv = mult(translate, rotate);
    mv = mult(mv, scale);

    // var mv = mat3(
    //     vec3(1.0, 0.0, 0.2),
    //     vec3(0.0, 1.0, 0.0),
    //     vec3(0.0, 0.0, 1.0)
    // )

    var msek = Date.now() - initTime;
    gl.uniform1f(locTime, msek);
    gl.uniformMatrix4fv(rotation, false, flatten(mv));

    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimationFrame(render);
}
