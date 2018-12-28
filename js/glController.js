// Global WebGL variables
let gl = null;
let glCanvas = null;
let shaderProgram = null;


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
    gl.enable(gl.DEPTH_TEST);
    
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
    // Compile shaders build shader program
    shaderProgram = buildShaderProgram(shaderSet);
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