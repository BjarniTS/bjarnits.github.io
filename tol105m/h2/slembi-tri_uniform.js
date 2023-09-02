///////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Einfaldasta WebGL forritið.  Teiknar einn rauðan þríhyrning.
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
///////////////////////////////////////////////////////////////////
var gl;
var points;
var vertices;
var size;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    size = 0.1
    vertices = new Float32Array([-1-size, -1-size, -1, -1+size, -1+size, -1-size]);

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    

    // Associate shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );
    centerLoc = gl.getUniformLocation( program, "vCenter" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    var num_tris = 100;
    for(var i = 0; i < num_tris; ++i) {
      /*var center_x = (Math.random()*2)-1;
      var center_y = (Math.random()*2)-1;*/
      gl.uniform2fv( centerLoc, vec2(Math.random(), Math.random()));
      /*vertices[0] = center_x - size;
      vertices[1] = center_y - size;
      vertices[2] = center_x + size;
      vertices[3] = center_y - size;
      vertices[4] = center_x;
      vertices[5] = center_y + size;*/
      gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

      var R = Math.random();
      var G = Math.random();
      var B = Math.random();

      gl.uniform4fv( colorLoc, vec4(R, G, B, 1.0) );
      gl.drawArrays( gl.TRIANGLES, 0, 3 );
    }
}
