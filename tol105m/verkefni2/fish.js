/////////////////////////////////////////////////////////////////
//      Verkefni 2 - Fiskabúr
//      Bjarni Þór Sigurðsson, TÖL105M Haust 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 9;
var NumBody = 6;
var NumTail = 3;

var vPosition;

// Hnútar fisks í xy-planinu
// var vertices = [
//     // líkami (spjald)
//     vec4( -0.5,  0.0, 0.0, 1.0 ),
// 	vec4(  0.2,  0.2, 0.0, 1.0 ),
// 	vec4(  0.5,  0.0, 0.0, 1.0 ),
// 	vec4(  0.5,  0.0, 0.0, 1.0 ),
// 	vec4(  0.2, -0.15, 0.0, 1.0 ),
// 	vec4( -0.5,  0.0, 0.0, 1.0 ),
// 	// sporður (þríhyrningur)
//     vec4( -0.5,  0.0, 0.0, 1.0 ),
//     vec4( -0.65,  0.15, 0.0, 1.0 ),
//     vec4( -0.65, -0.15, 0.0, 1.0 )
// ];

var fish_buffer;

var fish_locs = [
    vec3(0.0, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 0.9, 0.0),
    vec3(0.0, 0.0, 1.0),
    vec3(1.0, 1.0, 0.0),

    vec3(2.0, 2.0, 0.0),
    vec3(3.0, 2.0, 0.0),
    vec3(2.0, 2.9, 0.0),
    vec3(2.0, 2.0, 1.0),
    vec3(3.0, 3.0, 0.0),
    // vec3(0.0, 1.0, 1.0),
    // vec3(1.0, 0.0, 1.0),
    // vec3(1.0, 1.0, 1.0)
];

var fish_dirs = [
    normalize(vec3(0.1, 1.0, 0.0)),
    normalize(vec3(0.000001, 0.1, 0.0)),
    normalize(vec3(0.0, 0.0, 0.1)),
    normalize(vec3(0.1, 0.1, 0.0)),
    normalize(vec3(0.1, 0.1, 0.0)),

    normalize(vec3(0.1, 1.0, 0.0)),
    normalize(vec3(0.000001, 0.1, 0.0)),
    normalize(vec3(0.0, 0.0, 0.1)),
    normalize(vec3(0.1, 0.1, 0.0)),
    normalize(vec3(0.1, 0.1, 0.0)),
    // normalize(vec3(0.1, 0.1, 0.0)),
    // normalize(vec3(0.1, 0.1, 0.0)),
    // normalize(vec3(0.1, 0.1, 0.0))
];


var blue = vec4(0.0, 0.0, 1.0, 1.0);
var red = vec4(1.0, 0.0, 0.0, 1.0);
var green = vec4(0.0, 1.0, 0.0, 1.0);
var yellow = vec4(1.0, 1.0, 0.0, 1.0);
var cyan = vec4(0.0, 1.0, 1.0, 1.0);
var magenta = vec4(1.0, 0.0, 1.0, 1.0);

var fish_colors = [
    red, green, blue, yellow, cyan, magenta,
    red, green, blue, yellow, cyan, magenta
];


var fish_body_length = 0.3;
var fish_body_height = 0.15;
var fish_tail_length = 0.1;
var fish_tail_height = 0.15;
var fish_head_length = 0.1;
var fish_fin_depth = 0.1;
var fish_fin_length = 0.15;

var vertices = [
    // Fish body
    vec4(0.0, fish_body_height / 2.0, 0.0, 1.0),
    vec4(-fish_body_length, 0.0, 0.0, 1.0),
    vec4(0.0, -fish_body_height, 0.0, 1.0),
    // Fish head
    vec4(0.0, -fish_body_height, 0.0, 1.0),
    vec4(fish_head_length, 0.0, 0.0, 1.0),
    vec4(0.0, fish_body_height, 0.0, 1.0),
    // Fish tail
    vec4(-fish_body_length, 0.0, 0.0, 1.0),
    vec4(-fish_body_length - fish_tail_length, fish_tail_height, 0.0, 1.0),
    vec4(-fish_body_length - fish_tail_length / 2.0, 0.0, 0.0, 1.0),
    vec4(-fish_body_length - fish_tail_length, -fish_tail_height, 0.0, 1.0),
    // Fish fins
    // - Right fin
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(-fish_fin_length, 0.0, fish_fin_depth / 2.0, 1.0),
    vec4(-fish_fin_length, 0.0, fish_fin_depth, 1.0),
    // - Left fin
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(-fish_fin_length, 0.0, -fish_fin_depth / 2.0, 1.0),
    vec4(-fish_fin_length, 0.0, -fish_fin_depth, 1.0)
];

var tank_buffer;
var tank_color = vec4(0.1, 0.1, 0.9, 0.15);
var tank_width = 8;
var tank_height = 5;
var tank_depth = 5;

var t_flb = vec4(-tank_width, -tank_height, tank_depth, 1.0);
var t_frb = vec4(tank_width, -tank_height, tank_depth, 1.0);
var t_frt = vec4(tank_width, tank_height, tank_depth, 1.0);
var t_flt = vec4(-tank_width, tank_height, tank_depth, 1.0);
var t_blb = vec4(-tank_width, -tank_height, -tank_depth, 1.0);
var t_brb = vec4(tank_width, -tank_height, -tank_depth, 1.0);
var t_brt = vec4(tank_width, tank_height, -tank_depth, 1.0);
var t_blt = vec4(-tank_width, tank_height, -tank_depth, 1.0);

var tank_verts = [
    // Front
    t_flb, t_frb, t_frt, t_flt,
    // Back
    t_blb, t_brb, t_brt, t_blt,
    // Bottom
    t_flb, t_frb, t_brb, t_blb,
    // Top
    t_flt, t_frt, t_brt, t_blt,
    // Left
    t_flt, t_flb, t_blb, t_blt,
    // Right
    t_frt, t_frb, t_brb, t_brt
]

var center_vert = vec4(0.0, 0.0, 0.0, 1.0);



var movement = false;     // Er músarhnappur niðri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotTail = 0.0;        // Snúningshorn sporðs
var incTail = 2.0;        // Breyting á snúningshorni

var fish_rng = []
for(let i = 0; i < fish_locs.length; ++i) {
    fish_rng.push(Math.random());
}

var zView = 2.5;          // Staðsetning áhorfanda í z-hniti

var fish_speed = 0.0002;
var influence_radius = 2.0;
var sep_radius = influence_radius / 3.0;

var proLoc;
var mvLoc;
var colorLoc;

var fps = 60;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Fish buffer
    fish_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fish_buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Tank buffer
    tank_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tank_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tank_verts), gl.STATIC_DRAW);

    // Center buffer
    center_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, center_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(center_vert), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );



    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki hér í upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Atburðafall fyrir mús
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Atburðafall fyrir lyklaborð
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zView += 0.2;
                break;
            case 40:	// niður ör
                zView -= 0.2;
                break;
         }
     }  );  

    // Atburðafall fyri músarhjól
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );

    document.getElementById("slider_cohesion").onchange = function(event) {
        let value = parseFloat(event.target.value);
        fish_dirs[0][0] = value;
        fish_dirs[0] = normalize(fish_dirs[0]);
        document.getElementById("span_cohesion").textContent = value;
    };
    document.getElementById("slider_separation").onchange = function(event) {
        let value = parseFloat(event.target.value);
        fish_dirs[0][1] = value;
        fish_dirs[0] = normalize(fish_dirs[0]);
        document.getElementById("span_serparation").textContent = value;
    };
    document.getElementById("slider_alignment").onchange = function(event) {
        let value = parseFloat(event.target.value);
        fish_dirs[0][2] = value;
        fish_dirs[0] = normalize(fish_dirs[0]);
        document.getElementById("span_alignment").textContent = value;
    };
    document.getElementById("slider_speed").onchange = function(event) {
        let value = parseFloat(event.target.value);
        fish_speed = value;
        document.getElementById("span_speed").textContent = value;
    };

    let all_dists = [];

    for(let i = 0; i < fish_locs.length; ++i) {
        let dists = [];
        for(let j = 0; j < fish_locs.length; ++j) {
            dists.push(length(subtract(fish_locs[i], fish_locs[j])));
        }
        all_dists.push(dists);
    }
    console.log(all_dists);
    

    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var view = lookAt( vec3(0.3, 0.3, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    view = mult( view, rotateX(spinX) );
    view = mult( view, rotateY(spinY) );

    rotTail += incTail;
    if( rotTail > 35.0  || rotTail < -35.0 )
        incTail *= -1;

    gl.disable(gl.DEPTH_TEST);

    // Teikna tank
    gl.bindBuffer(gl.ARRAY_BUFFER, tank_buffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(view));
    gl.uniform4fv( colorLoc, tank_color);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);

    //let fish_dir_avg = normalize(avg_v3_arr(fish_dirs));
    let fish_pos_avg = avg_v3_arr(fish_locs);
    fish_dirs = adjust_dirs(fish_dirs, fish_locs);

    // Teikna fiska
    for(var f = 0; f < fish_locs.length; ++f) {
        
        //fish_dirs[f] = [...fish_dir_avg];

        fish_locs[f] = add(fish_locs[f], scale(fish_speed, fish_dirs[f]));

        // Collision with tank
        if(fish_locs[f][0] > tank_width) fish_locs[f][0]=-tank_width;
        if(fish_locs[f][0] < -tank_width) fish_locs[f][0]=tank_width;
        if(fish_locs[f][1] > tank_depth) fish_locs[f][1]=-tank_depth;
        if(fish_locs[f][1] < -tank_depth) fish_locs[f][1]=tank_depth;
        if(fish_locs[f][2] > tank_height) fish_locs[f][2]=-tank_height;
        if(fish_locs[f][2] < -tank_height) fish_locs[f][2]=tank_height;

        var mv = mult(view, translate(fish_locs[f]));

        let dir = normalize(fish_dirs[f]);
        let yaw = Math.atan2(dir[2], dir[0]) * 180.0 / Math.PI;
        let pitch = Math.asin(dir[1]) * 180.0 / Math.PI;
        mv = mult(mv, rotateY(-yaw)); // Yaw
        mv = mult(mv, rotateZ(pitch)); // Pitch

        let myspan1 = document.getElementById("myspan1");
        let myspan2 = document.getElementById("myspan2");
        let myspan3 = document.getElementById("myspan3");
        myspan1.textContent = yaw;
        myspan2.textContent = pitch;
        myspan3.textContent = dir;

        // Miðpunktur
        gl.bindBuffer(gl.ARRAY_BUFFER, center_buffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
        //let ap = avg_v3_arr(fish_locs);
        gl.uniformMatrix4fv(mvLoc, false, flatten(mult(view, translate(fish_pos_avg))));
        gl.drawArrays(gl.POINTS, 0, 1);

        // Fiskar
        gl.enable(gl.DEPTH_TEST);
        gl.bindBuffer(gl.ARRAY_BUFFER, fish_buffer);
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( colorLoc, fish_colors[f]);
    
        // Líkami
        gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 3 );
    
        // Höfuð
        gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
        gl.drawArrays( gl.TRIANGLES, 3, 3 );

        // Uggar
        let fish_rot_fin = rotTail + fish_rng[f]*2.0;
        // - Hægri
        let uh = mult(mv, rotateX(fish_rot_fin));
        gl.uniformMatrix4fv(mvLoc, false, flatten(uh));
        gl.drawArrays( gl.TRIANGLES, 10, 3);
        // - Vinstri
        let uv = mult(mv, rotateX(-rotTail));
        gl.uniformMatrix4fv(mvLoc, false, flatten(uv));
        gl.drawArrays( gl.TRIANGLES, 13, 3);
    
        // Sporður (með snúningi)
        let fish_rot_tail = rotTail + fish_rng[f]*5.0;
        mv = mult( mv, translate ( -fish_body_length, 0.0, 0.0 ) );
        mv = mult( mv, rotateY( fish_rot_tail ) );
        mv = mult( mv, translate ( fish_body_length, 0.0, 0.0 ) );
        
        gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
        gl.drawArrays( gl.TRIANGLE_FAN, 6, 4 );

    }

    setTimeout( function() {
        window.requestAnimFrame(render);
      }, 1000/fps);
}

function adjust_dirs(dirs, locs) {
    //let dir_avg = normalize(avg_v3_arr(dirs));
    //let loc_avg = avg_v3_arr(locs);

    let all_dists = [];
    for(let i = 0; i < locs.length; ++i) {
        let dists = [];
        for(let j = 0; j < locs.length; ++j) {
            dists.push(length(subtract(locs[i], locs[j])));
        }
        all_dists.push(dists);
    }


    // Alignment
    let alignments = [];
    for(let i = 0; i < dirs.length; ++i) {
        let sum = vec3(0.0, 0.0, 0.0);
        let num = 0;
        for(let j = 0; j < all_dists[i].length; ++j) {
            if(i != j && all_dists[i][j] < influence_radius) {
                ++num;
                sum = add(sum, dirs[j]);
            }
        }
        if(num != 0) alignments.push(normalize(scale(1 / num, sum)));
        else alignments.push(dirs[i]);
    }

    // Cohesion
    let neighbor_avg_locs = [];
    for(let i = 0; i < locs.length; ++i) {
        let sum = vec3(0.0, 0.0, 0.0);
        let num = 0;
        for(let j = 0; j < all_dists[i].length; ++j) {
            if(i != j && all_dists[i][j] < influence_radius) {
                ++num;
                sum = add(sum, locs[j]);
                console.log('i in neighbor_avg_locs', i);
            }
        }
        if(num != 0) neighbor_avg_locs.push(scale(1 / num, sum));
        else neighbor_avg_locs.push(locs[i]);
    }
    console.log('neighbor_avg_locs', neighbor_avg_locs);
    console.log('0 loc', locs[0]);
    console.log('1 loc', locs[1]);

    let coh_sep_dirs = [];
    for(let i = 0; i < neighbor_avg_locs.length; ++i) {
        if(locs[i] == neighbor_avg_locs[i]) {
            coh_sep_dirs.push(dirs[i]);
            //continue;
        }
        else if(length(subtract(locs[i], neighbor_avg_locs[i])) < sep_radius) {
            console.log('too close', i, length(subtract(locs[i], neighbor_avg_locs[i])));
            let dir_to_avg = normalize(subtract(neighbor_avg_locs[i], locs[i]));
            coh_sep_dirs.push(scale(-1.0, dir_to_avg));
        }
        else {
            coh_sep_dirs.push(normalize(subtract(neighbor_avg_locs[i], locs[i])));
            console.log('last else', i, length(subtract(locs[i], neighbor_avg_locs[i])));
        }
    }

    for(let i = 0; i < dirs.length; ++i) {
        //console.log('coh_sep_dirs length:', coh_sep_dirs.length)
        let combined_dir = normalize(mix(coh_sep_dirs[i], alignments[i], 0.4));
        dirs[i] = normalize(mix(combined_dir, dirs[i], 0.9));
    }

    return dirs;
}

function avg_v3_arr(vec_array) {
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;
    for(let i = 0; i < vec_array.length; ++i) {
        x += vec_array[i][0];
        y += vec_array[i][1];
        z += vec_array[i][2];
    }
    x /= vec_array.length;
    y /= vec_array.length;
    z /= vec_array.length;
    return vec3(x, y, z);
}
