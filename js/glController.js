// Global WebGL variables
let gl = null;
let glCanvas = null;
let shaderProgram = null;

// Camera variables
let viewMatrix = mat4.identity(mat4.create());
let perspectiveMatrix = mat4.create();

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
    // Capture inputs to move camera
    bindCameraMovement(glCanvas);

    // Demo object
    let tla_start_x = -10;
    let tla_konec_x = 10;
    let tla_start_z = -10;
    let tla_konec_z = 10;
    let tla_y = -2;
    let tla_positions = new Float32Array([
        tla_start_x, tla_y, tla_start_z,
        tla_konec_x, tla_y, tla_start_z,
        tla_konec_x, tla_y, tla_konec_z,
        tla_start_x, tla_y, tla_start_z,
        tla_konec_x, tla_y, tla_konec_z,
        tla_start_x, tla_y, tla_konec_z]);


    drawables.push(glDrawable(
        {
            points: tla_positions,
            name: "floor",
        },
        gl, shaderProgram));


    createElementList(drawables);

    // Init draw
    gl.clearColor(1, 1, 1, 1);
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

    // Get camera position and perspective data
    let cameraMovement = getCameraMovement();

    // Generate perspective matrix
    if(cameraMovement.perspective = NORMAL_PERSPECTIVE)
    {
        mat4.perspective(perspectiveMatrix, glMatrix.toRadian(75), glCanvas.width / glCanvas.height, 0.1, 10000);
    }
    else if(cameraMovement.perspective = ORTHO_PERSPECTIVE)
    {
        mat4.ortho(perspectiveMatrix, -4, -4, -4, -4, 0.1, 10);
    }
    // Transform camera perspective
    viewMatrix = mat4.translate(mat4.create(), viewMatrix, vec3.fromValues(cameraMovement.camX, cameraMovement.camY, cameraMovement.camZ));
    viewMatrix = mat4.rotate(mat4.create(), viewMatrix, glMatrix.toRadian(cameraMovement.camRotY), vec3.fromValues(0, 1, 0));
    viewMatrix = mat4.rotate(mat4.create(), viewMatrix, glMatrix.toRadian(cameraMovement.camRotX), vec3.fromValues(1, 0, 0));
    viewMatrix = mat4.rotate(mat4.create(), viewMatrix, glMatrix.toRadian(cameraMovement.camRotZ), vec3.fromValues(0, 0, 1));

    // Calculate the PV matrix
    let PV = mat4.multiply(mat4.create(), perspectiveMatrix, viewMatrix);

    // Assign shaderProgram and camera matrices
    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "PV"), false, PV);

    // Dra objects
    for(let i = 0; i < drawables.length; ++i)
    {
        drawables[i].draw();
    }

    // Check for error
    let e = gl.getError();
    if (e) {
        console.log(`Error creating WebGL context: ${e.toString()}`);
    }
}