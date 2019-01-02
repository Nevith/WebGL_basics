let NORMAL_PERSPECTIVE = 20;
let ORTHO_PERSPECTIVE = 21;

// Define default camera position
let camY = 0, camX = 0, camZ = -20;
let camRotY = 0, camRotX = 0, camRotZ = 0;
let perspective = NORMAL_PERSPECTIVE;


function createElementList(drawables)
{
    let objectContainer = $("#object_container");
    objectContainer.html("");
    // loop through all drawable objects and create their UI
    for(let i = 0; i < drawables.length; ++i)
    {
        let obj = drawables[i];
        // Title of UI element is the object's name
        objectContainer.append($(`<div class='row'><span style='font-weight: bold; margin-left: 5px;'>${i+1} ${obj.name.toUpperCase()}</span></div>`));
        //objectContainer.append($(``));

        // Add buttons in rows
        let currentRow = $("<div class='row'></div>");
        for(let j = 0; j < 17; ++j)
        {
            // Split buttons into groups of max 6
            if((j % 6) == 0 && j != 0)
            {
                objectContainer.append(currentRow);
                currentRow = $("<div class='row'></div>");
            }
            currentRow.append(getButton(j, drawables, i));
        }
        objectContainer.append(currentRow);

        // Add UI for lighting parameters
        let lightingParams = $("<div class='row'></div>");
        lightingParams.append($("<div class='col' style='width: 63px;'>Ambient</div>"));
        lightingParams.append($("<div class='col' style='width: 63px;'>Diffuse</div>"));
        lightingParams.append($("<div class='col' style='width: 63px;'>Specular</div>"));
        let colorPickers = $("<div class='row'></div>");
        let coefficientPickers = $("<div class='row'></div>");
        let lightParams = obj.getLightParams();

        // Color pickers
        let ambientColor = $(`<input type='color' value="${rgbToHex(lightParams.ambient.color)}" style='width: 63px;'/>`);
        ambientColor.value = rgbToHex(lightParams.ambient.color);
        ambientColor.on("change", function (event) {
            obj.setColor(0, hexToRgb(event.target.value));
        });
        colorPickers.append($("<div class='col'></div>").append(ambientColor));

        let diffuseColor = $(`<input type='color' value=\"${rgbToHex(lightParams.diffuse.color)}\" style='width: 63px;'/>`);
        diffuseColor.value = rgbToHex(lightParams.diffuse.color);
        diffuseColor.on("change", function (event) {
            obj.setColor(1, hexToRgb(event.target.value));
        });
        colorPickers.append($("<div class='col'></div>").append(diffuseColor));

        let specularColor = $(`<input type='color' value=\"${rgbToHex(lightParams.specular.color)}\" style='width: 63px;'/>`);
        specularColor.value = rgbToHex(lightParams.specular.color);
        specularColor.on("change", function (event) {
            obj.setColor(2, hexToRgb(event.target.value));
        });
        colorPickers.append($("<div class='col'></div>").append(specularColor));

        // Coefficients
        let ambientCoefficient = $("<input type='number' step='0.1' min='0' max='1' style='width: 63px'/>");
        ambientCoefficient.val(lightParams.ambient.coefficient);
        ambientCoefficient.on("change", function (event) {
            obj.setCoefficient(0, parseFloat(event.target.value));
        });
        coefficientPickers.append($("<div class='col' style='margin-bottom: 5px'></div>").append(ambientCoefficient));

        let diffuseCoefficient = $("<input type='number' step='0.1' min='0' max='1' style='width: 63px'/>");
        diffuseCoefficient.val(lightParams.diffuse.coefficient);
        diffuseCoefficient.on("change", function (event) {
            obj.setCoefficient(1, parseFloat(event.target.value));
        });
        coefficientPickers.append($("<div class='col'></div>").append(diffuseCoefficient));

        let specularCoefficient = $("<input type='number' step='0.1' min='0' max='1' style='width: 63px'/>");
        specularCoefficient.val(lightParams.specular.coefficient);
        specularCoefficient.on("change", function (event) {
            obj.setCoefficient(2, parseFloat(event.target.value));
        });
        coefficientPickers.append($("<div class='col'></div>").append(specularCoefficient));
        // Append to the drawable UI
        objectContainer.append(lightingParams);
        objectContainer.append(colorPickers);
        objectContainer.append(coefficientPickers);

        // Texture mapping parameters
        let mappingParams = obj.getMappingParams();
        let uvParameters = $("<div class='row'>");
        let modeSlect = $("<select class='col'>" +
            `<option value='0' ${mappingParams.uvMode==0 ? "selected" : ""}>default</option>` +
            `<option value='1' ${mappingParams.uvMode==1 ? "selected" : ""}>plane</option>` +
            `<option value='2' ${mappingParams.uvMode==2 ? "selected" : ""}>cylindrical</option>` +
            `<option value='3' ${mappingParams.uvMode==3 ? "selected" : ""}>spherical</option>` +
            "</select>");
        modeSlect.on("change", function (event) {
            obj.setMappingMode(event.target.value);
            if(event.target.value==0)
            {
                axisSlect.hide();
            }
            else
            {
                axisSlect.show();
            }
        });
        let axisSlect = $("<select class='col'>" +
            `<option value='0' ${mappingParams.uvAxis==0 ? "selected" : ""}>X</option>` +
            `<option value='1' ${mappingParams.uvAxis==1 ? "selected" : ""}>Y</option>` +
            `<option value='2' ${mappingParams.uvAxis==2 ? "selected" : ""}>Z</option>` +
            "</select>");
        axisSlect.on("change", function (event) {
            obj.setMappingAxis(event.target.value);
        });
        if(mappingParams.uvMode==0)
        {
            axisSlect.hide();
        }
        // Append to the drawable UI
        objectContainer.append($(`<div class='row'><span style='font-weight: bold; margin-left: 5px;'>UV Mapping</span></div>`));
        uvParameters.append(modeSlect);
        uvParameters.append(axisSlect);
        objectContainer.append(uvParameters);

        objectContainer.append($("<div class='row border_bottom'></div>"))
    }
}


function bindCameraMovement(canvas, light)
{
    canvas.onkeydown = function keyDown(event) {
        switch (event.keyCode) {
            case 74:
                camRotY -= 5;
                break;
            case 76:
                camRotY += 5;
                break;
            case 73:
                camRotX -= 5;
                break;
            case 75:
                camRotX += 5;
                break;
            case 85:
                camRotZ -= 5;
                break;
            case 79:
                camRotZ += 5;
                break;

            case 81:
                camY -= 1;
                break;
            case 69:
                camY += 1;
                break;
            case 68:
                camX -= 1;
                break;
            case 65:
                camX += 1;
                break;
            case 83:
                camZ -= 1;
                break;
            case 87:
                camZ += 1;
                break;

            case 32:
                if(perspective == NORMAL_PERSPECTIVE)
                    perspective = ORTHO_PERSPECTIVE;
                else
                    perspective = NORMAL_PERSPECTIVE;
                break;
        }
        canvas.tabIndex = 1000;
        canvas.focus();
    };
    canvas.tabIndex = 1000;
    canvas.focus();

    // Also insert light coordinates into text fields as preset value
    $("#x_pos").val(light[0]);
    $("#y_pos").val(light[1]);
    $("#z_pos").val(light[2]);
}


function getCameraMovement()
{
    // Read change from last read
    let result = {
        camY: camY,
        camX: camX,
        camZ: camZ,
        camRotY: camRotY,
        camRotX: camRotX,
        camRotZ: camRotZ,
        perspective: perspective,
    };

    // Reset change on read values
    camY = 0; camX = 0; camZ = 0;
    camRotY = 0; camRotX = 0; camRotZ = 0;

    return result;
}


function getButton(type, drawables, i)
{
    let obj = drawables[i];
    let icon = "";
    let cheat = 0;
    let params = {};
    if(type == cheat++)
    {
        icon += "fa fa-caret-square-o-up";
        params.x = 0;
        params.y = 0.5;
        params.z = 0;
        params.func = 1;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-caret-square-o-down";
        params.x = 0;
        params.y = -0.5;
        params.z = 0;
        params.func = 1;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-caret-square-o-left";
        params.x = -0.5;
        params.y = 0;
        params.z = 0;
        params.func = 1;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-caret-square-o-right";
        params.x = 0.5;
        params.y = 0;
        params.z = 0;
        params.func = 1;
    }
    if(type == cheat++)
    {
        icon += "fa fa fa-long-arrow-up";
        params.x = 0;
        params.y = 0;
        params.z = -0.5;
        params.func = 1;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-long-arrow-down";
        params.x = 0;
        params.y = 0;
        params.z = 0.5;
        params.func = 1;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-arrow-circle-o-up";
        params.angle = 5;
        params.x = 1;
        params.y = 0;
        params.z = 0;
        params.func = 2;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-arrow-circle-o-down";
        params.angle = -5;
        params.x = 1;
        params.y = 0;
        params.z = 0;
        params.func = 2;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-arrow-circle-o-left";
        params.angle = 5;
        params.x = 0;
        params.y = 1;
        params.z = 0;
        params.func = 2;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-arrow-circle-o-right";
        params.angle = -5;
        params.x = 0;
        params.y = 1;
        params.z = 0;
        params.func = 2;
    }
    if(type == cheat++)
    {
        icon += "fa fa fa-arrow-circle-up";
        params.angle = 5;
        params.x = 0;
        params.y = 0;
        params.z = 1;
        params.func = 2;
    }
    else if(type == cheat++)
    {
        icon += "fa fa fa-arrow-circle-down";
        params.angle = -5;
        params.x = 0;
        params.y = 0;
        params.z = 1;
        params.func = 2;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-angle-double-up";
        params.scale = 1.2;
        params.func = 3;
    }
    else if(type == cheat++)
    {
        icon += "fa fa-angle-double-down";
        params.scale = 0.8;
        params.func = 3;
    }
    else if(type == cheat++)
    {
        let button = $(`<button id='${obj.name}${type}' class=\"btn btn-warning\" style=\"margin: 5px; float: left; height: 30px; width: 30px; padding: 0;\">` +
            `<span class=\"fa fa-image\"></span>` +
            "</button>");
        button.on("click", function () {
            // Open file dialog that accepts .png and .jpg files
            let input = $("<input type=\"file\" accept=\"image/*\"/>");
            // On file selection
            input.change(function () {
                let file = input.prop("files")[0];
                // If file selected
                if (file) {
                    // Read file contents
                    let reader = new FileReader();
                    reader.onload = function (evt) {
                        // Get the img data
                        let imgData = evt.target.result;
                        obj.loadTexture(imgData);
                    };
                    reader.onerror = function (evt) {
                        console.log("Error opening file");
                    };
                    reader.readAsDataURL(file);
                }
            });
            // Open dialog
            input.trigger('click');
        });
        return button;
    }
    else if(type == cheat++)
    {
        let button = $(`<button id='${obj.name}${type}' class=\"btn btn-warning\" style=\"margin: 5px; float: left; height: 30px; width: 30px; padding: 0;\">` +
            `<span class=\"fa fa-map\"></span>` +
            "</button>");
        button.on("click", function () {
            // Open file dialog that accepts .png and .jpg files
            let input = $("<input type=\"file\" accept=\"image/*\"/>");
            // On file selection
            input.change(function () {
                let file = input.prop("files")[0];
                // If file selected
                if (file) {
                    // Read file contents
                    let reader = new FileReader();
                    reader.onload = function (evt) {
                        // Get the img data
                        let imgData = evt.target.result;
                        obj.loadNormalMap(imgData);
                    };
                    reader.onerror = function (evt) {
                        console.log("Error opening file");
                    };
                    reader.readAsDataURL(file);
                }
            });
            // Open dialog
            input.trigger('click');
        });
        return button;
    }
    else if(type == cheat)
    {
        let button = $(`<button id='${obj.name}${type}' class=\"btn btn-danger\" style=\"margin: 5px; float: left; height: 30px; width: 30px; padding: 0;\">` +
            `<span class=\"fa fa-times\"></span>` +
            "</button>");
        button.on("click", function () {
            // Remove element
            drawables.splice(i, 1);
            // Redraw UI
            createElementList(drawables);
        });
        return button;
    }

    let button = $(`<button id='${obj.name}${type}' class=\"btn btn-primary\" style=\"margin: 5px; float: left; height: 30px; width: 30px; padding: 0;\">` +
        `<span class=\"${icon}\"></span>` +
        "</button>");
    button.on("click", function () {
        if(params.func == 1)
            obj.translate(params.x, params.y, params.z);
        else if(params.func == 2)
            obj.rotate(params.angle, params.x, params.y, params.z);
        else if(params.func == 3)
            obj.scale(params.scale, params.scale, params.scale);
    });

    return button;
}


// Lets user choose a .obj file to display
function selectObj()
{
    // Open file dialog that accepts .obj files
    let input = $("<input type=\"file\" accept=\".obj\"/>");
    // On file selection
    input.change(function () {
        let file = input.prop("files")[0];
        // If file selected
        if (file) {
            // Read file contents
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                parseObj(evt.target.result, file.name.split(".")[0]);
            };
            reader.onerror = function (evt) {
                console.log("Error opening file");
            }
        }

    });
    // Open dialog
    input.trigger('click');
}


// Capture user's input for light coordinates
function captureLightChange()
{
    let x_field = $("#x_pos");
    let y_field = $("#y_pos");
    let z_field = $("#z_pos");

    let x = parseFloat(x_field.val());
    let y = parseFloat(y_field.val());
    let z = parseFloat(z_field.val());

    moveLight(x, y, z);
}


// Convert hex(color picker) value to rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : null;
}
// Convert single r/g/b value to hex
function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
// Convert rgb value to hex(color picker) value
function rgbToHex(rgb) {
    rgb = [Math.round(rgb[0]*255), Math.round(rgb[1]*255), Math.round(rgb[2]*255)];
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}
