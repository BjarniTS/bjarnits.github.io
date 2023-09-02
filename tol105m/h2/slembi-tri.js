///////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Einfaldasta WebGL forritið.  Teiknar einn rauðan þríhyrning.
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
///////////////////////////////////////////////////////////////////
var gl;
var num_tris;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = []
    var size = 0.1
    num_tris = 100;
    for(var i = 0; i < num_tris; ++i) {
      var center = [Math.random()*2-1, Math.random()*2-1];
      var a = vec2(center[0], center[1] + size);
      var b = vec2(center[0] - size, center[1] - size);
      var c = vec2(center[0] + size, center[1] - size);
      vertices.push(a, b, c);
    }
    
    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    

    // Associate shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    colorLoc = gl.getUniformLocation( program, "fColor" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    for(var i = 0; i < num_tris; ++i) {      

      var R = Math.random();
      var G = Math.random();
      var B = Math.random();

      gl.uniform4fv( colorLoc, vec4(R, G, B, 1.0) );
      
      gl.drawArrays( gl.TRIANGLES, i*3, 3 );
    }
}
