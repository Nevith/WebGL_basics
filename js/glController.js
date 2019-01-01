// Global WebGL variables
let gl = null;
let glCanvas = null;
let shaderProgram = null;

// Camera variables
let viewMatrix = mat4.identity(mat4.create());
let perspectiveMatrix = mat4.create()

// Other globals
let drawables = [];
let light = [0.0, 25.0, 0.0];


// Runs on load
$(function()
{
    // Retrieve the canvas and gl context
    glCanvas = document.getElementById("gl_canvas");
    try {
        // fix resolution and super sample!
        glCanvas.width = $("#gl_canvas").width()*2;
        glCanvas.height = $("#gl_canvas").height()*2;

        gl = glCanvas.getContext("webgl");
    } catch (e) {
        console.log(`Error creating WebGL context: ${e.toString()}`);
    }
    // If no gl context
    if (!gl) {
        return;
    }
    gl.enable(gl.DEPTH_TEST);   // Enable depth test
    // Get extensions needed for Bump Mapping
    gl.getExtension('OES_standard_derivatives');
    gl.getExtension('EXT_shader_texture_lod');
    
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
    bindCameraMovement(glCanvas, light);

    // Add floor as a preset object
    parseObj(floorObjText, "floor");
    createElementList(drawables);   // Create UI for floor

    // Init draw
    gl.clearColor(0.2, 0.2, 0.2, 1);
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

    if(cameraMovement.perspective == NORMAL_PERSPECTIVE)
    {
        mat4.perspective(perspectiveMatrix, glMatrix.toRadian(75), glCanvas.width / glCanvas.height, 0.1, 10000);
    }
    else if(cameraMovement.perspective == ORTHO_PERSPECTIVE)
    {
        mat4.ortho(perspectiveMatrix, -4, 4, -4, 4, 0.1, 10);
    }
    // Transform camera view coordinates
    viewMatrix = mat4.translate(mat4.create(), viewMatrix, vec3.fromValues(cameraMovement.camX, cameraMovement.camY, cameraMovement.camZ));
    viewMatrix = mat4.rotate(mat4.create(), viewMatrix, glMatrix.toRadian(cameraMovement.camRotY), vec3.fromValues(0, 1, 0));
    viewMatrix = mat4.rotate(mat4.create(), viewMatrix, glMatrix.toRadian(cameraMovement.camRotX), vec3.fromValues(1, 0, 0));
    viewMatrix = mat4.rotate(mat4.create(), viewMatrix, glMatrix.toRadian(cameraMovement.camRotZ), vec3.fromValues(0, 0, 1));

    // Calculate the PV matrix
    let PV = mat4.multiply(mat4.create(), perspectiveMatrix, viewMatrix);

    // Assign shaderProgram and camera matrices
    gl.useProgram(shaderProgram);
    // Add light
    gl.uniform3f(gl.getUniformLocation(shaderProgram, "LIGHT"), light[0], light[1], light[2]);

    // Draw objects
    for(let i = 0; i < drawables.length; ++i)
    {
        drawables[i].draw(PV);
    }

    // Check for error
    let e = gl.getError();
    if (e) {
        console.log(`Error creating WebGL context: ${e.toString()}`);
    }
}


// Change light position
function moveLight(x, y, z)
{
    light[0] = x;
    light[1] = y;
    light[2] = z;
}


// Parse .obj text/string and create a drawable object
function parseObj(objText, name)
{
    objText = objText.replace(/\/r/g, '');
    // Parse .obj file
    let obj =
        {
            vertices: [],
            textures: [],
            normals: [],
        };

    let vertices = [];
    let textures = [];
    let normals = [];

    objText = objText.split("\n");
    for(let i = 0; i < objText.length; ++i)
    {
        let data = objText[i].split(" ");
        // Parse vertex data
        if(data[0] == "v")
        {
            vertices.push([parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3])]);
        }
        // Parse uv data
        else if(data[0] == "vt")
        {
            textures.push([parseFloat(data[1]), parseFloat(data[2])]);
        }
        // Parse normal data
        else if(data[0] == "vn")
        {
            normals.push([parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3])]);
        }
        // Order vertices correctly
        else if(data[0] == "f")
        {
            for(let j = 1; j < 4; ++j)
            {
                let indexes = data[j].split("/");
                obj.vertices.push(vertices[parseInt(indexes[0]) - 1]);
                obj.textures.push(textures[parseInt(indexes[1]) - 1]);
                obj.normals.push(normals[parseInt(indexes[2]) - 1]);
            }
        }
    }
    obj.name = name;
    drawables.push(glDrawable(obj, gl, shaderProgram));
    createElementList(drawables);   // Create UI for drawable object when parsed
}

let floorObjText = "v 20.000000 -15.000000 -20.0000000\n" +
    "v 20.000000 -15.000000 20.000000\n" +
    "v -20.00000' -15.000000 20.0000000\n" +
    "v -20.000000 -15.000000 -20.000000\n" +
    "v 20.000000 -14.000000 -20.00000\n" +
    "v 20.000000 -14.000000 20.000000\n" +
    "v -20.000000 -14.000000 20.000000\n" +
    "v -20.000000 -14.000000 -20.000000\n" +
    "vt 1.000000 0.000000\n" +
    "vt 0.000000 1.000000\n" +
    "vt 1.000000 1.000000\n" +
    "vt 0.000000 0.000000\n" +
    "vn 0.0000 -1.0000 0.0000\n" +
    "vn 0.0000 1.0000 0.0000\n" +
    "vn 1.0000 0.0000 0.0000\n" +
    "vn -1.0000 0.0000 0.0000\n" +
    "vn 0.0000 0.0000 -1.0000\n" +
    "vn 0.0000 0.0000 1.0000\n" +
    "f 1/1/1 2/3/1 3/2/1\n" +
    "f 3/2/1 4/4/1 1/1/1\n" +
    "f 5/1/2 6/3/2 7/2/2\n" +
    "f 7/2/2 8/4/2 5/1/2\n" +
    "f 1/1/3 5/3/3 2/2/3\n" +
    "f 2/2/3 6/4/3 5/1/3\n" +
    "f 1/1/4 5/3/4 4/2/4\n" +
    "f 4/2/4 8/4/4 5/1/4\n" +
    "f 4/1/5 8/3/5 3/2/5\n" +
    "f 3/2/5 7/4/5 8/1/5\n" +
    "f 3/1/6 7/3/6 2/2/6\n" +
    "f 2/2/6 6/4/6 7/1/6\n" ;