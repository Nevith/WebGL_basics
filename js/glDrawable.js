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
        let indexFirst = Math.floor(i/3);
        let indexSecond = i % 3;
        vertices[i] = data.vertices[indexFirst][indexSecond];
    }
    // Normals
    let normals = new Float32Array(data.normals.length*3);
    for(let i = 0; i < normals.length; ++i)
    {
        let indexFirst = Math.floor(i/3);
        let indexSecond = i % 3;

        if(!data.normals[indexFirst])
        {
            let a = 5;
        }

        normals[i] = data.normals[indexFirst][indexSecond];
    }
    // Uvs
    let uvs = new Float32Array(data.textures.length*2);
    for(let i = 0; i < uvs.length; ++i)
    {
        let indexFirst = Math.floor(i/2);
        let indexSecond = i % 2;
        uvs[i] = data.textures[indexFirst][indexSecond];
    }

    // Define coefficients and colors
    let KA = 1.0;
    let KD = 1.0;
    let KS = 1.0;
    let ambient_color = [0, 0, 0];
    let diffuse_color = [1, 1, 0.5];
    let specular_color = [1, 1, 1];

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
    let samplerLocation = gl.getUniformLocation(program, 'sampler');

    // Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Until an image is selected put a single pixel in the texture so we can
    // use it immediately. When the image is selected
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([100, 100, 100, 255]);  // opaque grey
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);


    let draw = function(PV)
    {
        let PVM = mat4.multiply(mat4.create(), PV, modelMatrix);

        // uniforms
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "PVM"), false, PVM);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "M"), false, modelMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "M_INVERSE_TRANSPOSE"), false,
            mat4.transpose(mat4.create(), mat4.invert(mat4.create(), modelMatrix)));
        // coefficients
        gl.uniform1f(gl.getUniformLocation(program, "KA"), KA);
        gl.uniform1f(gl.getUniformLocation(program, "KD"), KD);
        gl.uniform1f(gl.getUniformLocation(program, "KS"), KS);
        // colors
        gl.uniform3f(gl.getUniformLocation(program, "ambient_color"), ambient_color[0], ambient_color[1], ambient_color[2]);
        gl.uniform3f(gl.getUniformLocation(program, "diffuse_color"), diffuse_color[0], diffuse_color[1], diffuse_color[2]);
        gl.uniform3f(gl.getUniformLocation(program, "specular_color"), specular_color[0], specular_color[1], specular_color[2]);

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

        // Texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(samplerLocation, 0);

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

    let loadTexture = function(dataUrl) {
        const image = new Image();
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                srcFormat, srcType, image);

            // WebGL1 has different requirements for power of 2 images
            // vs non power of 2 images so check if the image is a
            // power of 2 in both dimensions.
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
        image.src = dataUrl;
    };
    
    let setColor = function (type, color) {
          if(type == 0)
          {
            ambient_color = color;
          }
          else if(type == 1)
          {
            diffuse_color = color;
          }
          else if(type == 2)
          {
            specular_color = color;
          }
    };

    let setCoefficient = function (type, coefficient) {
        if(type == 0)
        {
            KA = coefficient;
        }
        else if(type == 1)
        {
            KD = coefficient;
        }
        else if(type == 2)
        {
            KS = coefficient;
        }
    };

    let getLightParams = function () {
        return{
            ambient: {
                color: ambient_color,
                coefficient: KA
            },
            diffuse: {
                color: diffuse_color,
                coefficient: KD
            },
            specular: {
                color: specular_color,
                coefficient: KS
            }
        }
    };

    return{
        name: name,
        draw : draw,
        rotate: rotate,
        translate: translate,
        scale: scale,
        loadTexture: loadTexture,
        setColor: setColor,
        setCoefficient: setCoefficient,
        getLightParams: getLightParams,
    }

}


function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}