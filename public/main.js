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
var VERTICAL_AXIS = new InputAxis("vertical", Keys.W, Keys.S, 10, 10, Keys.UP, Keys.DOWN);
var HORIZONTAL_AXIS = new InputAxis("horizontal", Keys.D, Keys.A, 10, 10);
var ROTATION_AXIS = new InputAxis("rotate", Keys.LEFT, Keys.RIGHT, 10, 2);
var ZOOM_AXIS = new InputAxis("zoom", Keys.SPACE, 0, 3);

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
var worldManager = new WorldManager(function(pFilePath) {
    return graphics.loadImage(pFilePath);
}, function(pObjLayer) {
    //Loop through the objects that are within the map
    for (var i = 0; i < pObjLayer.objects.length; i++) {
        //Switch on the type of the object
        switch (pObjLayer.objects[i].type) {
            case "Spawn":
                //Set the player to this position
                playerPosition = new Vec2(pObjLayer.objects[i].x, pObjLayer.objects[i].y);

                //Move the camera to this position
                camera.position = playerPosition;

                break;
            default:
                console.log("Object layer " + pObjLayer.name + " logged the object " + pObjLayer.objects[i].name);
                break;
        }
    }
}).loadWorld("RPG_JS\/TestWorld\/TestWorld.json");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                         Update Loop Functionality                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Store the position of the player
var playerPosition = new Vec2();

//Store the players Animation Controller
var playerAnimator = new AnimationController().loadAnimator("RPG_JS\/TestWorld\/Animators\/PlayerAnimator.json", function(pFilePath) {
    return graphics.loadImage(pFilePath);
});

//Pause the animator to being with
playerAnimator.paused = true;

//Store a flag for highlighting the collision layer
var debugCollision = false;

//Store the size of the player
var PLAYER_RECT_DIM = 30;

//Store the player moves speed
var PLAYER_MOVE_SPEED = 200;

//Store the speed with which the camera lerps to the player
var CAMERA_MOVE_SPEED = 250;

//Store the minimum distance away the camera can be
var CAMERA_MAX_DISTANCE = 96;

/*
    updateLoop - Update the input and display the loaded game world
    21/11/2016

    @param[in] pDelta - The delta time for the current cycle
*/
function updateLoop(pDelta) {
    //Update the input manager
    Input.update(pDelta);

    //Update the world manager
    worldManager.update(pDelta);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-----------------------------------------Update Player & Camera---------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Check for collision layer highlighting input options
    if (Input.keyPressed(Keys.ENTER)) {
        //Toggle the debu flag
        debugCollision = !debugCollision;

        //Set the highlighted layers in the map manager
        worldManager.highlightLayers = (debugCollision ? "Collideable" : null);
    }

    //Get the transition progress of the World Manager
    var transProg = worldManager.transitionProgress;

    //Disable player movement while the level hasn't loaded
    if (transProg === 1) {
        //Get the camera relative up direction
        var camUp = new Vec2(0, -1).rotate(camera.rotation * Math.deg2Rad);

        //Get the movement direction
        var moveDir = camUp.multi(Input.getAxis("vertical")).addSet(camUp.right.multiSet(Input.getAxis("horizontal")));

        //Normalise movement if needed
        if (moveDir.sqrMag > 1) moveDir.normalize();

        //Move the vector out by the player movement speed
        moveDir.multiSet(PLAYER_MOVE_SPEED * pDelta);

        //Set the players animation based on input movement
        playerAnimator.paused = !moveDir.sqrMag;
        if (moveDir.x) playerAnimator.currentAnimation = "Walk " + (moveDir.x < 0 ? "Left" : "Right");
        else if (moveDir.y) playerAnimator.currentAnimation = "Walk " + (moveDir.y < 0 ? "Up" : "Down");

        //Store the movement values to check into an array
        var movementAxis = [new Vec2(moveDir.x, 0), new Vec2(0, moveDir.y)];

        //Loop through collision areas to check
        for (var i = 0; i < movementAxis.length; i++) {
            //Get the position to check
            var collisionCheck = playerPosition.add(movementAxis[i]);

            //Test collision for the movement values
            if (!worldManager.testObjectCollision(collisionCheck.x - PLAYER_RECT_DIM / 2, collisionCheck.y - PLAYER_RECT_DIM / 2, PLAYER_RECT_DIM, PLAYER_RECT_DIM, "Collideable"))
                playerPosition.set(collisionCheck);
        }
    }

    //Update the player animator
    playerAnimator.update(pDelta);

    //Get the vector to the player
    var camSeperationVec = playerPosition.subtract(camera.position);

    //Get the cameras distance scale
    var moveScale = Math.clamp01(camSeperationVec.mag / CAMERA_MAX_DISTANCE);

    //Move the camera towards the players position
    camera.position = camera.position.addSet(camSeperationVec.normalize().multi(CAMERA_MOVE_SPEED * moveScale * pDelta));

    //Apply camera input effects
    camera.distance = Input.getAxis("zoom") * 4 + 1;
    camera.rotation = Input.getAxis("rotate") * 11.25;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-------------------------------------------Clear Background-------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Reset the transform
    graphics.transform = null;

    //Clear the background
    graphics.draw.fillStyle = "#72a2d9"
    graphics.draw.fillRect(0, 0, graphics.width, graphics.height);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////------------------------------------------Draw Game Elements------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Get the projection view matrix
    var projView = camera.projectionView;

    //Render the background
    worldManager.draw(graphics.draw, camera, ["Base", 1, 2]);

    //Set the projection world view matrix
    graphics.transform = projView.multi(createTransform(playerPosition.x, playerPosition.y));

    //Get the animation information from the player animator
    var playerAni = playerAnimator.drawFrame;

    //Draw the player
    graphics.draw.drawImage(playerAni.image,
        playerAni.x, playerAni.y, playerAni.w, playerAni.h, -PLAYER_RECT_DIM / 2, -PLAYER_RECT_DIM / 2, PLAYER_RECT_DIM, PLAYER_RECT_DIM);

    //Render the foreground
    worldManager.draw(graphics.draw, camera, "Foreground");

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-------------------------------------------Draw UI Elements-------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Apply the UI transform
    graphics.transform = camera.projectionUI;

    //Check if the map is transitioning 
    if (transProg !== 1) {
        //Store the fade opacity
        var opacity = 0;

        //Claculate the opacity
        if (transProg < 0.5) opacity = transProg / 0.5;
        else opacity = 1 - (transProg - 0.5) / 0.5;

        //Set the global alpha
        graphics.draw.globalAlpha = opacity;

        //Set the fill style to black
        graphics.draw.fillStyle = "black";

        //Fill in the screen
        graphics.draw.fillRect(0, 0, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);

        //Reset the alpha
        graphics.draw.globalAlpha = 1;
    }

    //Display the FPS
    graphics.draw.font = "36px Arial";
    graphics.outlineText("FPS: " + (1 / pDelta).toFixed(0), 5, 40, "red");
};

/*
    ignition - Set the starting map and load the game loop
    24/11/2016
*/
function ignition() {
    //Check the world manager has loaded properly
    if (worldManager.loaded) {
        //Load the initial map
        worldManager.activeMap = "Main";

        //Assign the updateLoop to the StateManager
        StateManager.setGameFunction(updateLoop);
    }
};

//Set the ignition as the starting project
StateManager.setGameFunction(ignition);