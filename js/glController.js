// Global WebGL variables
let gl = null;
let glCanvas = null;
let shaderProgram = null;

// Other globals
let drawables = [];


// Runs on load
$(function()
{
    // Retrieve the canvas and gl context
    glCanvas = document.getElementById("gl_canvas");
    try {
        gl = glCanvas.getContext("webgl");
    } catch (e) {
        console.log(`Error creating WebGL context: ${e.toString()}`);
    }
    // If no gl context
    if (!gl) {
        return;
    }
    gl.enable(gl.DEPTH_TEST);   // Enable depth test
    
    // Define shaders
    const shaderSet = [
        {
            type: gl.VERTEX_SHADER,
            id: "vertex-shader"
        },
        {
            type: gl.FRAGMENT_SHADER,
            id: "fragment-shader"
        }
    ];

    // Compiles shaders builds shader program
    shaderProgram = buildShaderProgram(shaderSet);

    // Demo triangle
    drawables.push(glDrawable(new Float32Array([ -1, -1, 0, -1.5, 1, 0.0, -1.5, -1.5, 0.0 ]), gl, shaderProgram));
    drawables.push(glDrawable(new Float32Array([ 1, 1, 0, 1.5, 1, 0.0, 1.5, 1.5, 0.0 ]), gl, shaderProgram));
    drawables.push(glDrawable(new Float32Array([ 0, 0, 0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0 ]), gl, shaderProgram));



    // Init draw
    setInterval(draw, 33);
});


// Takes array of objects with type and id to construct shaders
function buildShaderProgram(shaderInfo) {
    // Create a gl program
    let program = gl.createProgram();

    // Loop through the "shader set" objects
    shaderInfo.forEach(function(desc) {
        // Compiler shader and attach to program
        let shader = compileShader(desc.id, desc.type);
        if (shader) {
            gl.attachShader(program, shader);
        }
    });
    // Link program to WebGL
    gl.linkProgram(program);

    // Check for errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Error linking shader program:");
        console.log(gl.getProgramInfoLog(program));
    }

    return program;
}


// Takes id of element containing shader code and the type of shader, returns compiled shader
function compileShader(id, type) {
    // Retrieve code and create shader
    let code = document.getElementById(id).firstChild.nodeValue;
    let shader = gl.createShader(type);
    // Define the source to shader and try to compile
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    // Check for errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}


// Draws a frame
function draw()
{
    // Clear buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create camera matrices
    let proj_matrix = mat4.create();
    mat4.perspective(proj_matrix, glMatrix.toRadian(80), glCanvas.width / glCanvas.height, 0.1, 1000);
    let model_matrix = mat4.identity(mat4.create());
    let view_matrix = mat4.create();
    mat4.identity(view_matrix);
    view_matrix = mat4.translate(mat4.create(), view_matrix, vec3.fromValues(0, 0, -2));

    // Calculate the pvm matrix
    let PVM = mat4.multiply(mat4.create(), proj_matrix, mat4.multiply(mat4.create(), view_matrix, model_matrix));

    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "PVM"), false, PVM);

    for(let i = 0; i < drawables.length; ++i)
    {
        drawables[i].draw();
    }

    let e = gl.getError();
    if (e) {
        console.log(`Error creating WebGL context: ${e.toString()}`);
    }
}