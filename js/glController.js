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

    // Generate perspective matrix
    if(cameraMovement.perspective = NORMAL_PERSPECTIVE)
    {
        mat4.perspective(perspectiveMatrix, glMatrix.toRadian(75), glCanvas.width / glCanvas.height, 0.1, 10000);
    }
    else if(cameraMovement.perspective = ORTHO_PERSPECTIVE)
    {
        mat4.ortho(perspectiveMatrix, -4, -4, -4, -4, 0.1, 10);
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
    gl.uniform3f(gl.getUniformLocation(shaderProgram, "LIGHT"), 0, 20, 0);

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
    console.log(obj);
    obj.name = name;
    drawables.push(glDrawable(obj, gl, shaderProgram));
    createElementList(drawables);   // Create UI for drawable object when parsed
}

let floorObjText = "v 20.000000 -15.000000 -19.999998\n" +
    "v 20.000000 -15.000000 20.000000\n" +
    "v -20.000002 -15.000000 19.999996\n" +
    "v -19.999992 -15.000000 -20.000008\n" +
    "v 20.000010 -14.000000 -19.999989\n" +
    "v 19.999987 -14.000000 20.000011\n" +
    "v -20.000008 -14.000000 19.999992\n" +
    "v -19.999998 -14.000000 -20.000000\n" +
    "v 5.857867 -15.000000 -5.857865\n" +
    "v 5.857863 -14.000000 -5.857858\n" +
    "v 20.000004 -14.292893 -5.857861\n" +
    "v 5.857859 -14.292893 20.000002\n" +
    "v -19.999996 -14.292893 -5.857867\n" +
    "v 5.857868 -14.492893 -19.999996\n" +
    "v -5.857862 -15.000000 5.857860\n" +
    "v -5.857870 -14.000000 5.857866\n" +
    "v 20.000000 -14.492893 5.857872\n" +
    "v -5.857873 -14.492893 20.000000\n" +
    "v -20.000002 -14.492893 5.857862\n" +
    "v -5.857862 -14.492893 -20.000002\n" +
    "vt 1.000000 0.000000\n" +
    "vt 0.000000 1.000000\n" +
    "vt 0.353553 0.353553\n" +
    "vt 1.000000 0.000000\n" +
    "vt 0.000000 1.000000\n" +
    "vt 0.353553 0.353553\n" +
    "vt 1.000000 0.000000\n" +
    "vt 0.000000 1.000000\n" +
    "vt 0.353553 0.353553\n" +
    "vt 0.000000 0.000000\n" +
    "vt 1.000000 1.000000\n" +
    "vt 0.353553 0.646447\n" +
    "vt 1.000000 0.000000\n" +
    "vt 0.000000 1.000000\n" +
    "vt 0.353553 0.353553\n" +
    "vt 1.000000 0.000000\n" +
    "vt 1.000000 1.000000\n" +
    "vt 0.646447 0.646447\n" +
    "vt 1.000000 1.000000\n" +
    "vt 0.646447 0.646447\n" +
    "vt 1.000000 1.000000\n" +
    "vt 0.646447 0.646447\n" +
    "vt 0.646447 0.646447\n" +
    "vt 1.000000 0.000000\n" +
    "vt 0.646447 0.353553\n" +
    "vt 1.000000 1.000000\n" +
    "vt 0.646447 0.646447\n" +
    "vt 0.000000 1.000000\n" +
    "vt 0.353553 0.353553\n" +
    "vt 0.000000 0.000000\n" +
    "vt 0.000000 0.000000\n" +
    "vt 0.000000 0.000000\n" +
    "vn 0.0000 1.0000 0.0000\n" +
    "vn 1.0000 0.0000 0.0000\n" +
    "vn -0.0000 -0.0000 1.0000\n" +
    "vn -1.0000 -0.0000 -0.0000\n" +
    "vn 0.0000 0.0000 -1.0000\n" +
    "vn 0.0000 -1.0000 0.0000\n" +
    "s off\n" +
    "f 8/1/1 6/2/1 10/3/1\n" +
    "f 5/4/2 2/5/2 11/6/2\n" +
    "f 6/7/3 3/8/3 12/9/3\n" +
    "f 3/10/4 8/11/4 13/12/4\n" +
    "f 1/13/5 8/14/5 14/15/5\n" +
    "f 2/16/6 3/17/6 15/18/6\n" +
    "f 8/1/1 7/19/1 16/20/1\n" +
    "f 5/4/2 6/21/2 17/22/2\n" +
    "f 6/7/3 7/19/3 18/23/3\n" +
    "f 3/10/4 7/24/4 19/25/4\n" +
    "f 1/13/5 4/26/5 20/27/5\n" +
    "f 2/16/6 4/28/6 9/29/6\n" +
    "f 4/28/6 1/30/6 9/29/6\n" +
    "f 1/30/6 2/16/6 9/29/6\n" +
    "f 6/2/1 5/31/1 10/3/1\n" +
    "f 5/31/1 8/1/1 10/3/1\n" +
    "f 2/5/2 1/30/2 11/6/2\n" +
    "f 1/30/2 5/4/2 11/6/2\n" +
    "f 3/8/3 2/32/3 12/9/3\n" +
    "f 2/32/3 6/7/3 12/9/3\n" +
    "f 8/11/4 4/28/4 13/12/4\n" +
    "f 4/28/4 3/10/4 13/12/4\n" +
    "f 8/14/5 5/31/5 14/15/5\n" +
    "f 5/31/5 1/13/5 14/15/5\n" +
    "f 3/17/6 4/28/6 15/18/6\n" +
    "f 4/28/6 2/16/6 15/18/6\n" +
    "f 7/19/1 6/2/1 16/20/1\n" +
    "f 6/2/1 8/1/1 16/20/1\n" +
    "f 6/21/2 2/5/2 17/22/2\n" +
    "f 2/5/2 5/4/2 17/22/2\n" +
    "f 7/19/3 3/8/3 18/23/3\n" +
    "f 3/8/3 6/7/3 18/23/3\n" +
    "f 7/24/4 8/11/4 19/25/4\n" +
    "f 8/11/4 3/10/4 19/25/4\n" +
    "f 4/26/5 8/14/5 20/27/5\n" +
    "f 8/14/5 1/13/5 20/27/5";