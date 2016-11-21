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
var VERTICAL_AXIS = new InputAxis("vertical", Keys.S, Keys.W, 2, 1, Keys.UP, Keys.DOWN);
var HORIZONTAL_AXIS = new InputAxis("horizontal", Keys.D, Keys.A, 2, 1, Keys.RIGHT, Keys.LEFT);

//Add the input axis to the Input Manager
Input.addAxis(VERTICAL_AXIS);
Input.addAxis(HORIZONTAL_AXIS);

/*--------------------Rendering--------------------*/
//Create the camera to view the environment
var camera = new Camera(graphics.canvas, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);

//Create the canvas resize event for resizing the camera
graphics.addCanvasResizeEvent(function(pWidth, pHeight) {
    //Assign the new canvas size to the camera
    camera.canvasDimensions = new Vec2(pWidth, pHeight);
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

    //Move the camera around
    camera.position = new Vec2(Math.sin(Date.now() * 0.001) * 100, Math.cos(Date.now() * 0.001) * 100);

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
    graphics.transform = camera.projectionView;

    //Draw random square
    graphics.draw.fillStyle = "green";
    graphics.draw.fillRect(-50, -50, 50, 50);

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