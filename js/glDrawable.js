function glDrawable(data, gl, program)
{
    let points = data.points;
    let name = data.name;

    // let normals = data.normals;
    // let color = data.color;

    let vertices = gl.createBuffer();
    let colors = gl.createBuffer();

    // Bind buffer for vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);


    let a = new Float32Array(points.length);
    for(let i = 0; i < a.length; ++i)
    {
        a[i] = Math.random();
    }

    // Bind buffer for color
    gl.bindBuffer(gl.ARRAY_BUFFER, colors);
    gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);

    // Create model matrix for transformations
    let modelMatrix = mat4.identity(mat4.create());

    // Retrieve attribute locations
    let verticesLocation = gl.getAttribLocation(program, "vertices");
    let colorLocation = gl.getAttribLocation(program, "colors");



    let draw = function()
    {
        // vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
        gl.vertexAttribPointer(verticesLocation, 3, gl.FLOAT, false, 3 * 4, 0);
        gl.enableVertexAttribArray(verticesLocation);

        // texture
        gl.bindBuffer(gl.ARRAY_BUFFER, colors);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 3 * 4, 0);
        gl.enableVertexAttribArray(colorLocation);

        // Model matrix
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "M"), false, modelMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
    };

    let rotate = function (angle, x, y, z) {
        modelMatrix = mat4.rotate(mat4.create(), modelMatrix, glMatrix.toRadian(angle), vec3.fromValues(x, y, z));
    };

    let translate = function(x, y, z)
    {
        modelMatrix = mat4.translate(mat4.create(), modelMatrix, vec3.fromValues(x, y, z));
        console.log(modelMatrix);
    };

    let scale = function(x, y, z)
    {
        modelMatrix = mat4.scale(mat4.create(), modelMatrix, vec3.fromValues(x, y, z));
    };

    return{
        points : points,
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