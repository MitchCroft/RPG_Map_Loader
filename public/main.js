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
                //Check if the layer is for players
                if (pObjLayer.name === "Player Layer") {
                    //Set the player to this position
                    player.position = new Vec2(pObjLayer.objects[i].x, pObjLayer.objects[i].y);

                    //Move the camera to this position
                    camera.position = player.position;
                }

                //If it is an NPC layer add a new NPC entity
                else if (pObjLayer.name === "NPC Layer") {
                    //Create a new Entity object
                    var npc = new Entity();

                    //Load the animator
                    npc.animator.loadAnimator("RPG_JS\/TestWorld\/Animators\/NPCAnimator.json", function(pFilePath) {
                        return graphics.loadImage(pFilePath);
                    });

                    //Set the NPC's position
                    npc.position = new Vec2(pObjLayer.objects[i].x, pObjLayer.objects[i].y);

                    //Set the dimensions of the NPC
                    npc.width = npc.height = ENTITY_DIM_SIZE;

                    //Add the NPC to the list of Entity
                    inSceneEntity.push(npc);
                }
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

//Store the dimensions of the Entity
var ENTITY_DIM_SIZE = 30;

//Create the player
var player = new Entity();

//Set the players animator
player.animator.loadAnimator("RPG_JS\/TestWorld\/Animators\/PlayerAnimator.json", function(pFilePath) {
    return graphics.loadImage(pFilePath);
});

//Set the dimensions of the player
player.width = player.height = ENTITY_DIM_SIZE;

//Store an array of Entity in the scene
var inSceneEntity = [player];

//Store a flag for highlighting the collision layer
var debugCollision = false;

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

        //Store the movement values to check into an array
        var movementAxis = [new Vec2(moveDir.x, 0), new Vec2(0, moveDir.y)];

        //Loop through collision areas to check
        for (var i = 0; i < movementAxis.length; i++) {
            //Check if there is any displacement on the axis
            if (!movementAxis[i].sqrMag) continue;

            //Test collision for the movement values
            if (!worldManager.testObjectCollision(player.x + movementAxis[i].x, player.y + movementAxis[i].y, player.width, player.height, "Collideable"))
                player.move(movementAxis[i]);
        }
    }

    //Update the player animator
    for (var i = 0; i < inSceneEntity.length; i++)
        inSceneEntity[i].update(pDelta);

    //Get the vector to the player
    var camSeperationVec = player.position.subtract(camera.position);

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

    //Set the projection view matrix
    graphics.transform = projView;

    //Draw the characters
    for (var i = 0; i < inSceneEntity.length; i++)
        inSceneEntity[i].draw(graphics.draw);

    //Render the foreground
    worldManager.draw(graphics.draw, camera, "Foreground");

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////-------------------------------------------Draw UI Elements-------------------------------------------////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Apply the UI transform
    graphics.transform = camera.projectionUI;

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