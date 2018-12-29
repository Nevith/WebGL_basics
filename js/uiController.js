let NORMAL_PERSPECTIVE = 20;
let ORTHO_PERSPECTIVE = 21;

// Define default camera position
let camY = 0, camX = 0, camZ = 0;
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
        objectContainer.append($("<div class='row'></div>"));
        objectContainer.append($(`<span style='font-size: 1em; font-weight: bold; padding-left: -5px'>${obj.name.toUpperCase()}</span>`));

        // Add buttons in rows
        let currentRow = $("<div class='row'></div>");
        for(let j = 0; j < 15; ++j)
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
        objectContainer.append($("<div class='row border_bottom'></div>"))
    }
}

function bindCameraMovement(canvas)
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
                perspective = !perspective;
                break;
        }
        canvas.tabIndex = 1000;
        canvas.focus();
    };
    canvas.tabIndex = 1000;
    canvas.focus();
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
    else if(type == cheat)
    {
        let button = $(`<button id='${obj.name}${type}' class=\"btn btn-danger\" style=\"margin: 5px; float: right; height: 30px; width: 30px; padding: 0;\">` +
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