/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                  Type Definition                                           ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: TransitionState
 *      Author: Mitchell Croft
 *      Date: 28/11/2016
 *
 *      Purpose:
 *      Flag the current progress of the World Manager as it transitions
 *      between different maps
 **/
var TransitionState = { COMPLETED: 0, EXITING: 1, WAITING: 2, ENTERING: 3 };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: WorldManager
 *      Author: Mitchell Croft
 *      Date: 28/11/2016
 *
 *      Requires:
 *      Camera.js, ExtendProperties.js
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Load and manage a number of tile maps that allows for transitioning
 *      between different map environments
 *
 *      NOTE: World JSON Layout
 *
 *      name: The name of the world
 *      maps: An array of objects with the following properties
 *          identifier: A string identifier to be used to change and set the 
 *                      active map.
 *          filepath: The filepath to the JSON file containing the map information
 *                    relative to the the World JSON file
 **/

/*
    WolrdManager : Constructor - Initialise with default values
    28/1/12016

    @param[in] pImgCB - An optional function callback which takes in a file path
                        an returns an image object that can be used for rendering
                        (By default creates a new image everytime as needed)
    @param[in] pObjCB - An optional function callback that can be passed an object
                        layer for user processing (Default does nothing)
*/
function WorldManager(pImgCB, pObjCB) {
    /*  WARNING:
        Don't modify this internal object from the outside of the WorldManager.
        Instead use camera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Flag if the World Manager is ready for use
        loaded: false,

        //Store the name of the world
        worldName: "UNNAMED",

        //Store the filepath used to load the World this is managing
        fileLocation: null,

        //Store a map of the defined maps names and their relative filepaths
        definedMaps: [],

        //Store a TileMap object which stores the values for the current map
        currentMap: null,

        //Store a reference to the next map to load
        toLoad: null,

        //Flag if the manager is transitioning between maps
        state: TransitionState.COMPLETED,

        //Store a transition timer value
        transitionTimer: 1,

        //Store a time for half of the transition length
        transitionLength: 1,

        //Store a reference to the image loading callback
        imgCB: (typeof pImgCB === "function" ? pImgCB : function(pFilePath) {
            //Create a new image
            var img = new Image();

            //Assign the source filepath
            img.src = pFilePath;

            //Return the new image
            return img;
        }),

        //Store a reference to the object loading callback
        objCB: (typeof pObjCB === "function" ? pObjCB : null),

        //Store a map of the layers to highlight when rendering
        highlightLayers: [],
    };
};

ExtendProperties(WorldManager, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        WorldManager : loaded - Gets the loaded state of the World Manager
        29/11/2016

        @return bool - Returns true if the World Manager is ready to be used
    */
    get loaded() {
        return this.__Internal__Dont__Modify__.loaded;
    },

    /*
        WorldManager : worldName - Get the name of the loaded world
        29/11/2016

        @return string - Return's the name as a string
    */
    get worldName() {
        return this.__Internal__Dont__Modify__.worldName;
    },

    /*
        WorldManager : transitionTime - Get the length of the current transition time
        28/11/2016

        @return number - Returns a number which is the amount of time the WorldManager will use to swap over maps
    */
    get transitionTime() {
        return this.__Internal__Dont__Modify__.transitionLength;
    },

    /*
        WorldManager : transitionTime - Set the time it takes for the World Manager to transition between maps
        28/11/2016

        @param[in] pTime - A number defining the length of time to swap over the map (Must be >= 0)
    */
    set transitionTime(pTime) {
        //Check the value
        if (typeof pTime !== "number")
            throw new Error("Can not set the World Manager's transition time to " + pTime + " (Type: '" + typeof pTime + "') Please use a number >= 0");

        //Set the length of time
        this.__Internal__Dont__Modify__.transitionLength = Math.max(0, pTime);
    },

    /*
        WorldManager : transitionProgress - Get the progress of the transition between maps
        28/11/2016

        @return number - Returns the progress as a number between 0 - 1 where 1 is complete
    */
    get transitionProgress() {
        return Math.clamp01(this.__Internal__Dont__Modify__.transitionTimer / this.__Internal__Dont__Modify__.transitionLength);
    },

    /*
        WorldManager : imageCB - Set the callback function used for loading images
        28/11/2016

        @param[in] pCB - A function that can be passed a filepath and returns an image to be used for rendering
    */
    set imageCB(pCB) {
        //Check the value
        if (typeof pCB !== "function")
            throw new Error("Can not set the image loading callback function to " + pCB + " (Type: '" + typeof pCB + "') Please use a function that can take a filepath as the only parameter and return an image object");

        //Set the callback
        this.__Internal__Dont__Modify__.imgCB = pCB;
    },

    /*
        WorldManager : objectCB - Set the callback function used for processing object layers on maps
        28/11/2016

        @param[in] pCB - A function that can be passed an object layer for user processing
    */
    set objectCB(pCB) {
        //Check for null
        if (pCB == null) {
            //Clear the stored callback
            this.__Internal__Dont__Modify__.objCB = null;

            //Exit the function
            return;
        }

        //Check the value
        if (typeof pCB !== "function")
            throw new Error("Can not set the object prcessing function to " + pCB + " (Type: '" + typeof pCB + "') Please use a function that takes in an object layer object");

        //Set the callback
        this.__Internal__Dont__Modify__.objCB = pCB;
    },

    /*
        WorldManager : highlightLayers - Set the names of the layers to highlight when rendering 
        28/11/2016

        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to highlight
    */
    set highlightLayers(pIdents) {
        //Clear the highlight layers array
        this.__Internal__Dont__Modify__.highlightLayers = [];

        //Check the input for null
        if (pIdents == null) return;

        //Check if the identifier is not an array
        if (typeof pIdents === "string" || !pIdents instanceof Array)
            pIdents = [pIdents];

        //Copy over the highlight layer identifiers
        for (var i = 0; i < pIdents.length; i++)
            this.__Internal__Dont__Modify__.highlightLayers[i] = pIdents[i];
    },

    /*
        WorldManager : activeMap - Set the active map
        28/11/2016

        @param[in] pIdent - A string identifier that matches with one of the defined map names
                            from the loaded World JSON file
    */
    set activeMap(pIdent) {
        //Preform loaded check
        if (!this.__Internal__Dont__Modify__.loaded)
            throw new Error("Attempted to use World Manager functionality that requires a World to be loaded. Use WorldManager.loadWorld() " +
                "to load a JSON file describing the world and then use WorldManager.loaded to check for when the file has been loaded");

        //Check the type
        if (typeof pIdent !== "string")
            throw new Error("Can not set the WorldManager's active map to " + pIdent + " (Type: '" + typeof pIdent + "') Please use a string identifier from the loaded World JSON file");

        //Check that the identifier exists in the map
        else if (!pIdent in this.__Internal__Dont__Modify__.definedMaps)
            throw new Error("Could not load the map " + pIdent + " as it does not exist in the list of defined maps");

        //Set the transition name
        this.__Internal__Dont__Modify__.toLoad = pIdent;

        //If no current map, set timer at half of the value
        if (!this.__Internal__Dont__Modify__.currentMap)
            this.__Internal__Dont__Modify__.transitionTimer = this.__Internal__Dont__Modify__.transitionLength / 2;

        //Otherwise reset the time value
        else this.__Internal__Dont__Modify__.transitionTimer = 0;

        //Flag the manager as transitioning
        this.__Internal__Dont__Modify__.state = TransitionState.EXITING;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        WorldManager : loadWorld - Load a World description from a JSON file
        28/11/2016

        @param[in] pFilePath - The filepath to the World JSON file to load

        @return this - Returns a reference to itself
    */
    loadWorld: function(pFilePath) {
        //Flag the manager as unloaded
        this.__Internal__Dont__Modify__.loaded = false;

        //Store the file location for this world
        this.__Internal__Dont__Modify__.fileLocation = Path.getDirectory(pFilePath);

        //Reset world relative values
        this.__Internal__Dont__Modify__.worldName = "UNNAMED";
        this.__Internal__Dont__Modify__.definedMaps = [];
        this.__Internal__Dont__Modify__.currentMap = null;
        this.__Internal__Dont__Modify__.toLoad = null;
        this.__Internal__Dont__Modify__.state = TransitionState.COMPLETED;

        //Store a reference to this
        var that = this;

        //Create the HTTP request
        var httpReq = new XMLHttpRequest();

        //Set the on load function
        httpReq.onload = function() {
            //Store response text in a container
            var resp = (httpReq.status === 200 && httpReq.readyState === 4 ? httpReq.responseText : "");

            //Ensure that something was recieved
            if (resp === "") throw new Error("Unable to load the content found at " + pFilePath);

            //Parse the recieved text
            var worldObj = JSON.parse(resp);

            //Save the name of the world
            that.__Internal__Dont__Modify__.worldName = worldObj.name;

            //Loop through and all add identified maps
            for (var i = 0; i < worldObj.maps.length; i++)
                that.__Internal__Dont__Modify__.definedMaps[worldObj.maps[i].identifier] = worldObj.maps[i].filepath;

            //Set the World Manager as loaded
            that.__Internal__Dont__Modify__.loaded = true;
        };

        //Open the connection request
        httpReq.open("GET", pFilePath, true);

        //Send the request
        httpReq.send();

        //Return self
        return this;
    },

    /*
        WorldManager : update - Update the internal values and check for map loading
        28/11/2016

        @param[in] pDelta - The delta time for the current cycle
    */
    update: function(pDelta) {
        //Check if there is any loading work that needs to be done
        if (this.__Internal__Dont__Modify__.state) {
            //If the manager is not waiting add onto delta time
            if (this.__Internal__Dont__Modify__.state !== TransitionState.WAITING)
                this.__Internal__Dont__Modify__.transitionTimer += pDelta;

            //Check if there is a map to start loading
            if (typeof this.__Internal__Dont__Modify__.toLoad === "string")
                this.__Internal__Dont__Modify__.toLoad = this.loadMap(Path.getDirectory(this.__Internal__Dont__Modify__.fileLocation) + this.__Internal__Dont__Modify__.definedMaps[this.__Internal__Dont__Modify__.toLoad]);

            //Check if the toLoad value is a Tile Map
            if (this.__Internal__Dont__Modify__.toLoad instanceof TileMap) {
                //If half of the transition is over, wait for the new map to load               
                if (this.__Internal__Dont__Modify__.state === TransitionState.EXITING &&
                    this.transitionProgress >= 0.5)
                    this.__Internal__Dont__Modify__.state = TransitionState.WAITING;

                //Once the map has loaded start entering the new map
                if (this.__Internal__Dont__Modify__.toLoad.loaded &&
                    this.__Internal__Dont__Modify__.state === TransitionState.WAITING) {
                    //Flag the manager as entering the new map
                    this.__Internal__Dont__Modify__.state = TransitionState.ENTERING;

                    //Move over the toLoad map object to the current level
                    this.__Internal__Dont__Modify__.currentMap = this.__Internal__Dont__Modify__.toLoad;

                    //Clear the to load variable
                    this.__Internal__Dont__Modify__.toLoad = null;

                    //Loop thorugh the object layers and pass them to the callback
                    if (typeof this.__Internal__Dont__Modify__.objCB === "function") {
                        for (var i = 0; i < this.__Internal__Dont__Modify__.currentMap.objectLayers.length; i++)
                            this.__Internal__Dont__Modify__.objCB(this.__Internal__Dont__Modify__.currentMap.objectLayers[i]);
                    }
                }
            }

            //Once the transition has finished flag the end of the transition
            if (this.__Internal__Dont__Modify__.state === TransitionState.ENTERING &&
                this.transitionProgress === 1)
                this.__Internal__Dont__Modify__.state = TransitionState.COMPLETED;
        }
    },

    /*
            WorldManager : draw - Renders the currently active map as seen by the passed in Camera object
            28/11/2016

            @param[in] pCtx - The context of the canvas to render to
            @param[in] pCam - The Camera object being used to view the map
            @param[in] pIdents - Either a single identifier or an array of identifiers for layers to render (Default 
                                 renders everything)
        */
    draw: function(pCtx, pCam, pIdents) {
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////-----------------------------------------Check Critical Values----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Check that the context is valid
        if (!pCtx instanceof CanvasRenderingContext2D)
            throw new Error("Can not draw using " + pCtx + " (Type '" + typeof pCtx + "') as the 2D Context. Please use a 2D HTML5 canvas context object");

        //Check the Camera is valid
        else if (!pCam instanceof Camera)
            throw new Error("Can not draw using " + pCam + " (Type '" + typeof pCam + "') as the Camera. Please use a Camera object");

        //If there is no current map then exit immedietly
        else if (!this.__Internal__Dont__Modify__.currentMap) return;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Clean the Identifiers---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Get a reference to the current map
        var curMap = this.__Internal__Dont__Modify__.currentMap;

        //Check if the identifiers where defined
        if (pIdents == null) {
            //Create an array
            pIdents = [];

            //Add every index into the array
            for (var i = 0; i < curMap.layers.length; i++)
                pIdents[i] = i;
        }

        //Process defined identifiers
        else {
            //If the identifiers are not in an array
            if (typeof pIdents === "string" || !pIdents instanceof Array)
                pIdents = [pIdents];

            //Clean all identifiers within the array
            for (var i = 0; i < pIdents.length; i++)
                pIdents[i] = this.validifyLayerIdentifier(pIdents[i]);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Find The Area To Draw---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Get the projection view matrix from the Camera
        var projView = pCam.projectionView;

        //Store the inverse of projection view
        var projViewInv = projView.inversed;

        //Get the canvas area from the camera
        var renderArea = pCam.canvasDimensions;

        //Get the corners of the canvas into world coordinates
        var canvasWorldCorners = [projViewInv.multiVec(new Vec2(0, 0)), projViewInv.multiVec(new Vec2(renderArea.x, 0)),
            projViewInv.multiVec(new Vec2(0, renderArea.y)), projViewInv.multiVec(new Vec2(renderArea.x, renderArea.y))
        ];

        //Store the min/max points of canvas points
        var drawMin = new Vec2(Number.MAX_VALUE),
            drawMax = new Vec2(Number.MIN_VALUE);

        //Loop through the canvas world points and find min/max
        for (var i = 0; i < canvasWorldCorners.length; i++) {
            //Check X Axis
            if (canvasWorldCorners[i].x < drawMin.x) drawMin.x = canvasWorldCorners[i].x;
            if (canvasWorldCorners[i].x > drawMax.x) drawMax.x = canvasWorldCorners[i].x;

            //Check Y Axis
            if (canvasWorldCorners[i].y < drawMin.y) drawMin.y = canvasWorldCorners[i].y;
            if (canvasWorldCorners[i].y > drawMax.y) drawMax.y = canvasWorldCorners[i].y;
        }

        //Convert the min/max world points into tile coords
        drawMin = this.worldPosToTileCoord(drawMin);
        drawMax = this.worldPosToTileCoord(drawMax);

        //Clamp the drawing points within the map range
        drawMin.x = Math.clamp(drawMin.x, 0, curMap.width - 1);
        drawMin.y = Math.clamp(drawMin.y, 0, curMap.height - 1);
        drawMax.x = Math.clamp(drawMax.x, 0, curMap.width - 1);
        drawMax.y = Math.clamp(drawMax.y, 0, curMap.height - 1);

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////---------------------------------------------Draw The Tiles-------------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Set the transform used to draw
        pCtx.setTransform(projView.data[0][0], projView.data[0][1], projView.data[1][0], projView.data[1][1], projView.data[2][0], projView.data[2][1]);

        //Loop through the ID layers to draw
        for (var i = 0; i < pIdents.length; i++) {
            //Get the current layer ID
            var ID = pIdents[i];

            //Check if the layer identifier is invalid
            if (ID < 0) continue;

            //CHeck if this layer is visible
            if (!curMap.layers[ID].visible) continue;

            //Loop through the cells in the draw area
            for (var y = drawMin.y; y <= drawMax.y; y++) {
                for (var x = drawMin.x; x <= drawMax.x; x++) {
                    //Get the MapCell for this location
                    var cell = curMap.layers[ID].data[y][x];

                    //If there is no cell the ncontinue
                    if (cell == null) continue;

                    //Draw the tile
                    pCtx.drawImage(curMap.tilesets[cell.tilesetIndex].image,
                        cell.x, cell.y, cell.w, cell.h,
                        x * curMap.tilewidth - 1, y * curMap.tileheight - 1, curMap.tilewidth + 2, curMap.tileheight + 2);
                }
            }
        }

        //Check for layer highlighting
        if (this.__Internal__Dont__Modify__.highlightLayers.length) {
            //Set the fill style to be red
            pCtx.fillStyle = "red";

            //Set the global alpha to semi-transparent
            pCtx.globalAlpha = 0.25;

            //Create a new array to hold the cleaned layer identifiers
            var cleanedIDs = [];

            //Loop through and clean the IDs
            for (var i = 0; i < this.__Internal__Dont__Modify__.highlightLayers.length; i++)
                cleanedIDs[i] = this.validifyLayerIdentifier(this.__Internal__Dont__Modify__.highlightLayers[i]);

            //Loop through the cells in the area
            for (var y = drawMin.y; y <= drawMax.y; y++) {
                for (var x = drawMin.x; x <= drawMax.x; x++) {
                    //Flag if there is collision data at this point across any of the layers
                    var flag = false;

                    //Loop through the layers to check for collision
                    for (var i = 0; i < cleanedIDs.length; i++) {
                        //Skip invalid layers
                        if (cleanedIDs[i] < 0) continue;

                        //Check if the map has collision values here
                        if (curMap.layers[cleanedIDs[i]].collisionData[y][x]) {
                            //Raise the flag
                            flag = true;

                            //Break from the loop
                            break;
                        }
                    }

                    //If the flag was raised highlight this area
                    if (flag) pCtx.fillRect(x * curMap.tilewidth, y * curMap.tileheight, curMap.tilewidth, curMap.tileheight);
                }
            }
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////----------------------------------------Reset Rendering Values----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Reset global alpha
        pCtx.globalAlpha = 1;

        //Reset the transform
        pCtx.setTransform(1, 0, 0, 1, 0, 0);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                             Operational Functions                                          ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        WorldManager : worldPosToTileCoord - Converts a world position to a tile coordinate on the current map
        29/11/2016

        @param[in] pPos - A Vec2 object holding the world position to convert

        @return Vec2 - Returns a Vec2 object containing the converted tile coordinate
    */
    worldPosToTileCoord: function(pPos) {
        //Ensure there is an active map
        if (!this.__Internal__Dont__Modify__.currentMap)
            throw new Error("There is no active map. Please set an active map before attempting to convert a world position to a tile coordinate");

        //Convert the world position
        return new Vec2(Math.floor(pPos.x / this.__Internal__Dont__Modify__.currentMap.tilewidth),
            Math.floor(pPos.y / this.__Internal__Dont__Modify__.currentMap.tileheight));
    },

    /*
        WorldManager : tileCoordToWorldPos - Converts a tile coordinate to a world position on the current map
        29/11/2016

        @param[in] pCoord - A Vec2 object holding the tile coordinate to convert

        @return Vec2 - Returns a Vec2 object containing the converted world position
    */
    tileCoordToWorldPos: function(pCoord) {
        //Ensure there is an active map
        if (!this.__Internal__Dont__Modify__.currentMap)
            throw new Error("There is no active map. Please set an active map before attempting to convert a tile coordinate to a world position");

        return new Vec2(pCoord.x * this.__Internal__Dont__Modify__.currentMap.tilewidth,
            pCoord.y * this.__Internal__Dont__Modify__.currentMap.tileheight);
    },

    /*
        WorldManager : testTileCollision - Checks the tile coordinate passed in to see if that tile is blocked
                                           on specifiable layers
        29/11/2016

        @param[in] pCoord - A Vec2 object defining the tile coordinate to check
        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to check collision
                             against (Default checks everything)

        @return bool - Returns true if the coordinate is blocked on any checked layer. If coordinate is out of bounds 
                       returns true
    */
    testTileCollision: function(pCoord, pIdents) {
        //Check there is an active map
        if (!this.__Internal__Dont__Modify__.currentMap)
            throw new Error("Can not check collision as there is no active map. Please set the active map property before checking collision");

        //Get a reference to the current map
        var curMap = this.__Internal__Dont__Modify__.currentMap;

        //Check to see if the coordinate is out of bounds
        if (pCoord.x < 0 || pCoord.y < 0 || pCoord.x >= curMap.width || pCoord.y >= curMap.height)
            return true;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Clean the Identifiers---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Check if the identifiers where defined
        if (pIdents == null) {
            //Create an array
            pIdents = [];

            //Add every index into the array
            for (var i = 0; i < curMap.layers.length; i++)
                pIdents[i] = i;
        }

        //Process defined identifiers
        else {
            //If the identifiers are not in an array
            if (typeof pIdents === "string" || !pIdents instanceof Array)
                pIdents = [pIdents];

            //Clean all identifiers within the array
            for (var i = 0; i < pIdents.length; i++)
                pIdents[i] = this.validifyLayerIdentifier(pIdents[i]);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Check Collision Data----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Loop through all layers and check for collision
        for (var i = 0; i < pIdents.length; i++) {
            //Check if collision data is present at the coordinate
            if (curMap.layers[pIdents[i]].collisionData[pCoord.y][pCoord.x])
                return true;
        }

        //Default no collision
        return false;
    },

    /*
        WorldManager : testObjectCollision - Checks defined world space dimensions to see if they collide
                                             on specifiable layers
        29/11/2016

        @param[in] pX - The world X position of the object to test collision for
        @param[in] pY - The world Y position of the object to test collision for
        @param[in] pW - The world width of the object to test collision for
        @param[in] pH - The world height of the object to test collision for
        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to check 
                             collision against (Default checks everything)

        @return bool - Returns true if the area is blocked on any layer. If area is out of bounds returns true
    */
    testObjectCollision: function(pX, pY, pW, pH, pIdents) {
        //Check there is an active map
        if (!this.__Internal__Dont__Modify__.currentMap)
            throw new Error("Can not check collision as there is no active map. Please set the active map property before checking collision");

        //Get a reference to the current map
        var curMap = this.__Internal__Dont__Modify__.currentMap;

        //Check to see if the coordinate is out of bounds
        if (pX < 0 || pX + pW >= curMap.width * curMap.tilewidth ||
            pY < 0 || pY + pH >= curMap.height * curMap.tileheight)
            return true;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Clean the Identifiers---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Check if the identifiers where defined
        if (pIdents == null) {
            //Create an array
            pIdents = [];

            //Add every index into the array
            for (var i = 0; i < curMap.layers.length; i++)
                pIdents[i] = i;
        }

        //Process defined identifiers
        else {
            //If the identifiers are not in an array
            if (typeof pIdents === "string" || !pIdents instanceof Array)
                pIdents = [pIdents];

            //Clean all identifiers within the array
            for (var i = 0; i < pIdents.length; i++)
                pIdents[i] = this.validifyLayerIdentifier(pIdents[i]);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Find Check Positions----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Get the object collision poll positions
        var pollPositions = [
            { x: pX, y: pY },
            { x: pX + pW / 2, y: pY },
            { x: pX + pW, y: pY },
            { x: pX + pW, y: pY + pH / 2 },
            { x: pX + pW, y: pY + pH },
            { x: pX + pW / 2, y: pY + pH },
            { x: pX, y: pY + pH },
            { x: pX, y: pY + pH / 2 }
        ];

        //Convert the positions to tile coordinates
        for (var i = 0; i < pollPositions.length; i++)
            pollPositions[i] = this.worldPosToTileCoord(pollPositions[i]);

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Check Collision Data----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Loop through all layers and check for collision
        for (var i = 0; i < pIdents.length; i++) {
            //Loop through all polling positions
            for (var j = 0; j < pollPositions.length; j++) {
                //Check if collision data is present at the coordinate
                if (curMap.layers[pIdents[i]].collisionData[pollPositions[j].y][pollPositions[j].x])
                    return true;
            }
        }

        //Default no collision
        return false;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                              Internal Functions                                            ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        WorldManager : validifyLayerIdentifier - Takes an identification value and returns a valid layer index or -1 if none
        29/11/2016

        @param[in] pIdent - The identifier to validate (Number or string)

        @return number - Returns a whole number that is either the valid index of -1 if none
    */
    validifyLayerIdentifier: function(pIdent) {
        //Switch on the type of the identifier
        switch (typeof pIdent) {
            case "string":
                //Check for a valid index
                if (!pIdent in this.__Internal__Dont__Modify__.currentMap.layerNamesToIndex) {
                    console.log("WARNING: Could not find the identifier " + pIdent + " in the layer identification list for the current map");
                    return -1;
                }

                //Return the found index layer
                return this.__Internal__Dont__Modify__.currentMap.layerNamesToIndex[pIdent];
            case "number":
                //Round the number off to the closest integral
                pIdent = Math.round(pIdent);

                //Ensure the index is within the useable range
                if (pIdent < 0 || pIdent >= this.__Internal__Dont__Modify__.currentMap.layers.length) {
                    console.log("WARNING: The index of " + pIdent + " is outside of the valid range for layers on the current map");
                    return -1;
                }

                //Return the identification index
                return pIdent;
            default:
                throw new Error("Value of type " + typeof pIdent + "was used as a layer identifier. Please use a string or an index number");
        }
    },

    /*
        WorldManager : loadMap - Load a map from a Tiled Map Editor JSON file. Called internally by the World Manager
        28/11/2016

        @param[in] pFilePath - The filepath of the JSON file to load the information from

        @return TileMap - Returns a TileMap object that will be populated with Map information
    */
    loadMap: function(pFilePath) {
        //Create a new TileMap
        var map = new TileMap();

        //Store a reference to this
        var that = this;

        //Create the HTTP request
        var httpReq = new XMLHttpRequest();

        //Set the on load function
        httpReq.onload = function() {
            //Store response text in a container
            var resp = (httpReq.status === 200 && httpReq.readyState === 4 ? httpReq.responseText : "");

            //Ensure that something was recieved
            if (resp === "") throw new Error("Unable to load the content found at " + pFilePath);

            //Parse the recieved text
            var mapObj = JSON.parse(resp);

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////--------------------------------------Load Base Map Information---------------------------------------////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Read the map dimensions
            map.width = mapObj.width;
            map.height = mapObj.height;

            //Read the tile dimensions
            map.tilewidth = mapObj.tilewidth;
            map.tileheight = mapObj.tileheight;

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////---------------------------------------Load Tileset Information---------------------------------------////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Store the directory of the map file
            var dir = Path.getDirectory(pFilePath);

            //Assign all of the tile sets to this map object
            map.tilesets = mapObj.tilesets;

            //Loop through and load the image element 
            for (var i = 0; i < map.tilesets.length; i++)
                map.tilesets[i].image = that.__Internal__Dont__Modify__.imgCB(dir + map.tilesets[i].image);

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////----------------------------------------Load Layers Information---------------------------------------////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Clear all the current layer information
            map.layers = [];
            map.layerNamesToIndex = [];
            map.objectLayers = [];

            //Loop through all layers and set the required information
            for (var i = 0; i < mapObj.layers.length; i++) {
                //Switch on the type of the current layer
                switch (mapObj.layers[i].type) {
                    case "tilelayer":
                        //Store the index this layer is being saved at
                        var ind = map.layers.length;

                        //Assign this layer object to the next available
                        map.layers[ind] = mapObj.layers[i];

                        //Check if this name already exists
                        if (map.layers[ind].name in map.layerNamesToIndex)
                            console.log("WARNING: Two tile layers with the same names ('" + map.layers[ind].name + "') were loaded. Name identifiers may not select the desired layer for rendering");

                        //Store the index of this named layer
                        map.layerNamesToIndex[map.layers[ind].name] = ind;

                        //Delete the offset values (They will just hurt me)
                        delete map.layers[ind].x;
                        delete map.layers[ind].y;

                        //Store the data values in a temporary location
                        var data = map.layers[ind].data;

                        //Wipe te reference to the previous data
                        map.layers[ind].data = [];

                        //Add the collision data array to the layer
                        map.layers[ind].collisionData = [];

                        //Process the data values into quick readable formats
                        var tileProg = 0;
                        for (var y = 0; y < map.height; y++) {
                            //Create a new array for this line of data
                            map.layers[ind].data[y] = [];

                            //Create a new array for this line of collision data
                            map.layers[ind].collisionData[y] = [];

                            //Loop through all values on this line
                            for (var x = 0; x < map.width; x++) {
                                //Get the tile index
                                var tileIndex = data[tileProg++];

                                //Find the tileset that this index belongs to
                                var foundTileset = -1;
                                for (var j = 0; j < map.tilesets.length; j++) {
                                    //Check the tile index is within the tilesets range
                                    if (tileIndex >= map.tilesets[j].firstgid && tileIndex < map.tilesets[j].firstgid + map.tilesets[j].tilecount) {
                                        foundTileset = j;
                                        break;
                                    }
                                }

                                //Ensure that a tileset was found
                                if (foundTileset >= 0) {
                                    //Subtract the first ID to get the index into the tileset
                                    tileIndex -= map.tilesets[foundTileset].firstgid;

                                    //Create a new Map Cell object
                                    var cell = new MapCell();

                                    //Assign the source image area
                                    cell.w = map.tilesets[foundTileset].tilewidth;
                                    cell.h = map.tilesets[foundTileset].tileheight;
                                    cell.x = map.tilesets[foundTileset].margin + (tileIndex % map.tilesets[foundTileset].columns) * (cell.w + map.tilesets[foundTileset].spacing);
                                    cell.y = map.tilesets[foundTileset].margin + Math.floor(tileIndex / map.tilesets[foundTileset].columns) * (cell.h + map.tilesets[foundTileset].spacing);

                                    //Assign the used tileset index
                                    cell.tilesetIndex = foundTileset;

                                    //Add the cell to the layer map
                                    map.layers[ind].data[y][x] = cell;
                                }

                                //Throw an error if there is a tileindex issue
                                else if (tileIndex) throw new Error("Unable to find the tileset used for the Map Cell with a TileID of " + tileIndex + ". This occured on layer " + ind + " ('" + map.layers[ind].name + "')");

                                //Set the collision data
                                map.layers[ind].collisionData[y][x] = (map.layers[ind].data[y][x] instanceof MapCell);
                            }
                        }

                        break;
                    case "objectgroup":
                        //Assign this layer object to the object layers map
                        map.objectLayers[map.objectLayers.length] = mapObj.layers[i];
                        break;
                    default:
                        throw new Error("An unknown type of layer was found in the map located at " + pFilePath + " (Layer type: '" + mapObj.layers[i].type + "')");
                }
            }

            //Flag this map as loaded
            map.loaded = true;
        };

        //Open the connection request
        httpReq.open("GET", pFilePath, true);

        //Send the request
        httpReq.send();

        //Return the new map
        return map;
    },
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: MapCell
 *      Author: Mitchell Croft
 *      Date: 21/11/2016
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Store the image values to use when rendering map information
 **/

/*
    MapCell : Constructor - Initialise with default values
    21/11/2016
*/
function MapCell(pX, pY, pWidth, pHeight) {
    //Store the coordinate information of the source area
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    //Store the index of the tileset this cell uses for rendering
    this.tilesetIndex = -1;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: TileMap
 *      Author: Mitchell Croft
 *      Date: 21/11/2016
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Store the map information from a Tiled Map Editors 
 *      outputted JSON file
 **/

/*
    TileMap : Constructor - Intitialise with default values or load 
                            a map file
    21/11/2016
*/
function TileMap() {
    //Flag if this map has been loaded yet
    this.loaded = false;

    //Create an array for the differemt layers of the map
    this.layers = [];

    //Store the index values of the names of the layers in the map
    this.layerNamesToIndex = [];

    //Store the objects found on the map, keyed at the name of the layer they were stored on
    this.objectLayers = [];

    //Store the different tilesets used by the TileMap
    this.tilesets = [];

    //Store the map dimensions
    this.width = 0;
    this.height = 0;

    //Store the tile dimensions
    this.tilewidth = 0;
    this.tileheight = 0;
};