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
var trackCam = new TrackingCamera(graphics.canvas, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);

//Set the tracking camera values
trackCam.moveSpeed = 250;
trackCam.maxDistance = 96;

//Create the canvas resize event for resizing the camera
graphics.addCanvasResizeEvent(function(pWidth, pHeight) {
    //Assign the new canvas size to the camera
    trackCam.camera.canvasDimensions = new Vec2(pWidth, pHeight);
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
                //Create a new Entity Controller
                var controller = new EntityController(new Entity());

                //Set the Entity dimensions
                controller.entity.width = controller.entity.height = ENTITY_DIM_SIZE;

                //Check if the layer is for players
                if (pObjLayer.name === "Player Layer") {
                    //Load the player animator
                    controller.entity.animator.loadAnimator("RPG_JS\/TestWorld\/Animators\/PlayerAnimator.json", function(pFilePath) {
                        return graphics.loadImage(pFilePath);
                    });

                    //Set the player to this position
                    controller.entity.position = new Vec2(pObjLayer.objects[i].x, pObjLayer.objects[i].y);

                    //Set the player Entity as the target of the camera
                    trackCam.target = controller.entity;

                    //Move the tracking camera to this position
                    trackCam.camera.position = controller.entity.position;

                    //Assign the player input function
                    controller.controlFunc = playerInput;
                }

                //If it is an NPC layer add a new NPC entity
                else if (pObjLayer.name === "NPC Layer") {
                    //Load the animator
                    controller.entity.animator.loadAnimator("RPG_JS\/TestWorld\/Animators\/NPCAnimator.json", function(pFilePath) {
                        return graphics.loadImage(pFilePath);
                    });

                    //Set the NPC's position
                    controller.entity.position = new Vec2(pObjLayer.objects[i].x, pObjLayer.objects[i].y);
                }

                //Add the controller to the list
                entityControllers.push(controller);

                break;
            default:
                console.log("Object layer " + pObjLayer.name + " logged the object " + pObjLayer.objects[i].name);
                break;
        }
    }
}).loadWorld("RPG_JS\/TestWorld\/TestWorld.json");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                             Global Define Values                                           ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//A constant size for the Entities on the map
var ENTITY_DIM_SIZE = 30;

//Store the movement speed for the player
var PLAYER_MOVE_SPEED = 200;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                        Entity Management Functionality                                     ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Store an array of different Entity Controller objects active within the environment
var entityControllers = [];

/*
    entityCollisionCheck - Given a passed in Entity object and displacement Vec2 object, resolve the movement
    01/12/2016

    @param[in] pEntity - The Entity object to move by the displacement
    @param[in] pDisp - A Vec2 object holding the displacement amount
*/
function entityCollisionCheck(pEntity, pDisp) {
    //Check there is a displacement
    if (!pDisp.sqrMag) return;

    //Break the displacement up into seperate axis
    var movementAxis = [new Vec2(pDisp.x, 0), new Vec2(0, pDisp.y)];

    //Loop through the seperate axis
    for (var i = 0; i < movementAxis.length; i++) {
        //Check there is displacement on this axis
        if (!movementAxis[i].sqrMag) continue;

        //Test collision
        if (!worldManager.testObjectCollision(pEntity.x + movementAxis[i].x, pEntity.y + movementAxis[i].y, pEntity.width, pEntity.height, "Collideable"))
            pEntity.move(movementAxis[i]);
    }
};

/*
    playerInput - Test for user input and move the Entity accordingly
    01/12/2016

    @param[in] pDelta - The delta time for the current cycle
*/
function playerInput(pDelta) {
    //Check if the world is transitioning between maps
    if (worldManager.transitionProgress === 1) {
        //Get the camera relative up direction
        var camUp = new Vec2(0, -1).rotate(trackCam.camera.rotation * Math.deg2Rad);

        //Get the movement direction
        var moveDir = camUp.multi(Input.getAxis("vertical")).addSet(camUp.right.multiSet(Input.getAxis("horizontal")));

        //Normalise movement if needed
        if (moveDir.sqrMag > 1) moveDir.normalize();

        //Move the vector out by the player movement speed
        moveDir.multiSet(PLAYER_MOVE_SPEED * pDelta);

        //Process the movement
        entityCollisionCheck(this.entity, moveDir);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                           Update Loop Functionality                                        ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Store a flag for highlighting the collision layer
var debugCollision = false;

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
    ////-----------------------------------------Update Entity & Camera---------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Check for collision layer highlighting input options
    if (Input.keyPressed(Keys.ENTER)) {
        //Toggle the debu flag
        debugCollision = !debugCollision;

        //Set the highlighted layers in the map manager
        worldManager.highlightLayers = (debugCollision ? "Collideable" : null);
    }

    //Update the entity controllers
    for (var i = 0; i < entityControllers.length; i++)
        entityControllers[i].update(pDelta);

    //Update the camera 
    trackCam.update(pDelta);

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
    var projView = trackCam.camera.projectionView;

    //Render the background
    worldManager.draw(graphics.draw, trackCam.camera, ["Base", 1, 2]);

    //Set the projection view matrix
    graphics.transform = projView;

    //Draw the Entity
    for (var i = 0; i < entityControllers.length; i++)
        entityControllers[i].draw(graphics.draw);

    //Render the foreground
    worldManager.draw(graphics.draw, trackCam.camera, "Foreground");

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-------------------------------------------Draw UI Elements-------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Apply the UI transform
    graphics.transform = trackCam.camera.projectionUI;

    //Get the transition progress of the World Manager
    var transProg = worldManager.transitionProgress;

    //Check if the map is transitioning 
    if (transProg !== 1) {
        //Calculate the fade transperency
        graphics.draw.globalAlpha = (transProg < 0.5 ? transProg / 0.5 : 1 - (transProg - 0.5) / 0.5);

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

    //Swap over the render buffers
    graphics.swapBuffers();
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