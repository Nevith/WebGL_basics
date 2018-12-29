function glDrawable(data, gl, program)
{
    // Create model matrix for transformations
    let modelMatrix = mat4.identity(mat4.create());
    // Retrieve object's name
    let name = data.name;
    // Parse vertices normals and uvs to correct format for webGL
    // Vertices
    let vertices = new Float32Array(data.vertices.length*3);
    for(let i = 0; i < vertices.length; ++i)
    {
        let index1 = Math.floor(i/3);
        let index2 = i % 3;
        vertices[i] = data.vertices[index1][index2];
    }
    // Normals
    let normals = new Float32Array(data.normals.length*3);
    for(let i = 0; i < normals.length; ++i)
    {
        let index1 = Math.floor(i/3);
        let index2 = i % 3;
        normals[i] = data.normals[index1][index2];
    }
    // Uvs
    let uvs = new Float32Array(data.textures.length*2);
    for(let i = 0; i < uvs.length; ++i)
    {
        let index1 = Math.floor(i/2);
        let index2 = i % 2;
        uvs[i] = data.textures[index1][index2];
    }

    // Create buffer on gpu
    let glVertices = gl.createBuffer();
    let glNormals = gl.createBuffer();
    let glUvs = gl.createBuffer();

    // Bind buffer for vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, glVertices);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Bind buffer for normals
    gl.bindBuffer(gl.ARRAY_BUFFER, glNormals);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    // Bind buffer for uvs
    gl.bindBuffer(gl.ARRAY_BUFFER, glUvs);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    // Retrieve attribute locations
    let verticesLocation = gl.getAttribLocation(program, "vertex");
    let normalLocation = gl.getAttribLocation(program, "normal");
    let uvLocation = gl.getAttribLocation(program, "uv");


    let draw = function()
    {
        // vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, glVertices);
        gl.vertexAttribPointer(verticesLocation, 3, gl.FLOAT, false, 3 * 4, 0);
        gl.enableVertexAttribArray(verticesLocation);

        // normals
        gl.bindBuffer(gl.ARRAY_BUFFER, glNormals);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 3 * 4, 0);
        gl.enableVertexAttribArray(normalLocation);

        // uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, glUvs);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.enableVertexAttribArray(uvLocation);

        // Model matrix
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "M"), false, modelMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    };

    let rotate = function (angle, x, y, z) {
        modelMatrix = mat4.rotate(mat4.create(), modelMatrix, glMatrix.toRadian(angle), vec3.fromValues(x, y, z));
    };

    let translate = function(x, y, z)
    {
        modelMatrix = mat4.translate(mat4.create(), modelMatrix, vec3.fromValues(x, y, z));
    };

    let scale = function(x, y, z)
    {
        modelMatrix = mat4.scale(mat4.create(), modelMatrix, vec3.fromValues(x, y, z));
    };

    return{
        name: name,
        draw : draw,
        rotate: rotate,
        translate: translate,
        scale: scale,
    }

}


/*
let numComponents = 3;  // (x, y, z)
let type = gl.FLOAT;    // 32bit floating point values
let normalize = false;  // leave the values as they are
let stride = 0;         // how many bytes to move to the next vertex
let offset = 0;         // start at the beginning of the buffer
// 0 = use the correct stride for type and numComponents
*/