/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                             Initialisation Values                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*--------------------Constants--------------------*/
//Define the set world dimensions for the environment
var WORLD_VIEW_WIDTH = 1920;
var WORLD_VIEW_HEIGHT = 1080;

/*--------------------Graphics--------------------*/
//Create the graphics manager
var graphics = new Graphics(window.innerWidth, window.innerHeight);

//Set the window resize callback
graphics.setWindowResizeCallback(function(pWidth, pHeight) {
    //Force the graphics canvas to match the window size
    graphics.size = new Vec2(pWidth, pHeight);
});

/*--------------------Input--------------------*/
//Set the canvas within the Input Manager
Input.setCanvas(graphics.canvas);

//Create the input axis
var VERTICAL_AXIS = new InputAxis("vertical", Keys.W, Keys.S, 0.5, 0.25, Keys.UP, Keys.DOWN);
var HORIZONTAL_AXIS = new InputAxis("horizontal", Keys.D, Keys.A, 0.5, 0.25);
var ROTATION_AXIS = new InputAxis("rotate", Keys.LEFT, Keys.RIGHT, 0.5, 2);
var ZOOM_AXIS = new InputAxis("zoom", Keys.SPACE, 0, 0.5);

//Add the input axis to the Input Manager
Input.addAxis(VERTICAL_AXIS);
Input.addAxis(HORIZONTAL_AXIS);
Input.addAxis(ROTATION_AXIS);
Input.addAxis(ZOOM_AXIS);

/*--------------------Rendering--------------------*/
//Create the camera to view the environment
var camera = new Camera(graphics.canvas, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);

//Create the canvas resize event for resizing the camera
graphics.addCanvasResizeEvent(function(pWidth, pHeight) {
    //Assign the new canvas size to the camera
    camera.canvasDimensions = new Vec2(pWidth, pHeight);
});

/*--------------------Map--------------------*/
//Create the Map Manager
var mapManager = new TileMapManager(15, 10);

//Add the test map to the manager
mapManager.addMap(new TileMap().loadMap("TestMap.json", function(pFilePath) {
    return graphics.loadImage(pFilePath);
}), "Main");

//Set the active Map
mapManager.setActiveMap("Main", function(pObjLayer) {
    //Loop through the objects that are within the map
    for (var i = 0; i < pObjLayer.objects.length; i++) {
        //Switch on the type of the object
        switch (pObjLayer.objects[i].type) {
            case "Spawn":
                //Move the camera to this position
                camera.position.x = pObjLayer.objects[i].x;
                camera.position.y = pObjLayer.objects[i].y;
                break;
            default:
                console.log("Object layer " + pObjLayer.name + " logged the object " + pObjLayer.objects[i].name);
                break;
        }
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                         Update Loop Functionality                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Store the avergae frame rate to show a readable number
var avgFrames = 0;

//Store a timer value to track passage of a second
var fpsTimer = 0;

//Store the sum of the evaluated frames per second
var fpsSum = 0;

//Store the number of iterations that have occured in order to take the average
var fpsIterations = 0;

//Define a temporary speed for the camera to move at
var CAMERA_MOVE_SPEED = 10;

/*
    updateLoop - Update the input and display the loaded game world
    21/11/2016

    @param[in] pDelta - The delta time for the current cycle
*/
function updateLoop(pDelta) {
    //Update the input manager
    Input.update(pDelta);

    //Update the FPS counter
    fpsTimer += pDelta;

    //Add onto the sum
    fpsSum += 1 / pDelta;

    //Increment the counter
    fpsIterations++;

    //Check if a second has passed
    if (fpsTimer >= 1) {
        //Take the average
        avgFrames = fpsSum / fpsIterations;

        //Reset the values
        fpsTimer = fpsSum = fpsIterations = 0;
    }

    //Get the camera relative direction
    var camUp = new Vec2(0, -1).rotate(camera.rotation * Math.deg2Rad);

    //Get the movement direction
    var moveDir = camUp.multi(Input.getAxis("vertical")).addSet(camUp.right.multiSet(Input.getAxis("horizontal")));

    //Normalise movement if needed
    if (moveDir.mag > 1) moveDir.normalize();

    //Move the camera around
    camera.position = camera.position.addSet(moveDir.multiSet(CAMERA_MOVE_SPEED));
    camera.distance = Input.getAxis("zoom") * 14 + 1;
    camera.rotation += Input.getAxis("rotate") * 90 * pDelta;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-------------------------------------------Clear Background-------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Reset the transform
    graphics.transform = null;

    //Clear the background
    graphics.draw.clearRect(0, 0, graphics.width, graphics.height);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////------------------------------------------Draw Game Elements------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Set the cameras projection matrix as the canvas'
    //graphics.transform = camera.projectionView;

    //Render the map display
    mapManager.draw(graphics.draw, camera);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-------------------------------------------Draw UI Elements-------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Apply the UI transform
    graphics.transform = camera.projectionUI;

    //Display the FPS
    graphics.draw.font = "36px Arial";
    graphics.outlineText("FPS: " + avgFrames.toFixed(0), 5, 40, 'red');
};

//Assign the function to the State Manager
StateManager.setGameFunction(updateLoop);