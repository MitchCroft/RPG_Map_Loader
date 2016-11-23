/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: TileMapManager
 *      Author: Mitchell Croft
 *      Date: 21/11/2016
 *
 *      Requires:
 *      Camera.js, ExtendProperties.js
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Store a range of Tile Map objects that can be loaded
 *      and displayed
 **/

/*
    TileMapManager : Constructor - Initialise with default values
    21/11/2016

    @param[in] pDisplayTileWidth - The number of tiles to display along the width of the render area    
                                   (Default 10)
    @param[in] pDisplayTileHeight - The number of tiles to display along the height of the render area
                                    (Default 10)
*/
function TileMapManager(pDisplayTileWidth, pDisplayTileHeight) {
    /*  WARNING:
        Don't modify this internal object from the outside of the TileMapManager.
        Instead use camera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Save the different maps loaded
        loadedMaps: [],

        //Store the index locations of the named maps
        namedIndicies: [],

        //Store the index of the current map that is in use
        currentMapIndex: -1,

        //Store the display dimensions for the tiles
        displayDimensions: new Vec2(typeof pDisplayTileWidth === "number" ? pDisplayTileWidth : 10, typeof pDisplayTileHeight === "number" ? pDisplayTileHeight : 10),

        //Highlight debugging information for specific layers
        hightlightLayers: [],
    };
};

ExtendProperties(TileMapManager, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        TileMapManager : displayDimensions - Get the display dimensions that are being used to render tiles to the screen
        22/11/2016

        @return Vec2 - Returns a Vec2 object with the display dimensions stored inside
    */
    get displayDimensions() {
        return new Vec2(this.__Internal__Dont__Modify__.displayDimensions);
    },

    /*
        TileMapManager : displayDimensions - Set the display dimensions that are being used to render tiles to the screen
        22/11/2016

        @param[in] pDim - A Vec2 object that stores the new rendering dimensions
    */
    set displayDimensions(pDim) {
        //Check the parameter is a Vec2
        if (!pDim instanceof Vec2)
            throw new Error("Can not assign the render dimensions to " + pDim + " (Type: '" + typeof pDim + "') Please use a Vec2 object");

        //Copy the values over
        this.__Internal__Dont__Modify__.displayDimensions.set(pDim);
    },

    /*
        TileMapManager : highlightLayers
        22/11/2016

        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to highlight
    */
    set highlightLayers(pIdents) {
        //Check if the identifier is not an array
        if (!pIdents instanceof Array)
            pIdents = [pIdents];

        //Loop through and validate all identifiers
        for (var i = 0; i < pIdents.length; i++)
            pIdents[i] = this.validifyLayerIdentifier(pIdents[i], -1);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        TileMapManager : validifyLayerIdentifier - Takes an identification value and returns a valid layer index
        22/11/2016

        @param[in] pIdent - The identifier to validate (Number, string or null)
        @param[in] pDefault - The default index to assign if the identifier is invalid

        @return number - Returns a whole number that is either the vlaid index or the default
    */
    validifyLayerIdentifier: function(pIdent, pDefault) {
        //Switch on the type of the identifier
        switch (typeof pIdent) {
            case "string":
                //Check for a valid index
                if (!(pIdent in this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].layerNamesToIndex)) {
                    console.log("Could not find identifier " + pIdent + " in the layer identification list. Default value of " + pDefault + " was assigned");
                    return pDefault;
                }

                //Return the found index layer
                return this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].layerNamesToIndex[pIdent];
                break;
            case "number":
                //Round the number off to the closest integral number
                pIdent = math.round(pIdent);

                //Ensure the index is within range
                if (pIdent < 0 || pIdent >= this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].layers.length) {
                    console.log("The index value of " + pIdent + " is outside of the valid range for layers on the current map. Default value of " + pDefault + " was assigned");
                    return pDefault;
                }

                //Return the identification index
                return pIdent;
                break;
            default:
                //Type mismatch
                throw new Error("Value of type " + typeof pIdent + " was used as an identifier for a layer");
        }
    },

    /*
        TileMapManager : addMap - Add a TileMap object to the manager
        22/11/2016

        @param[in] pMap - The TileMap object to add to the manager
        @param[in] pIdent - An optional identifier string to use for identifying maps to load
                            (Default is the index number)
    */
    addMap: function(pMap, pIdent) {
        //Check the map is a TileMap
        if (!pMap instanceof TileMap)
            throw new Error("Can not add " + pMap + " (Type: '" + typeof pMap + "') to the Tile Map Manager. Please use a TileMap object");

        //Clean the identifier value
        if (typeof pIdent !== "string")
            pIdent = "" + this.__Internal__Dont__Modify__.loadedMaps.length;

        //Check if the identifier is valid
        if (pIdent in this.__Internal__Dont__Modify__.namedIndicies)
            throw new Error("Could not use " + pIdent + " as an identifier for the TileMap object being added to the Manager as that identifier is already in use");

        //Add the map to the list of loaded objects
        this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.loadedMaps.length] = pMap;

        //Assign the identification element the index number
        this.__Internal__Dont__Modify__.namedIndicies[pIdent] = this.__Internal__Dont__Modify__.loadedMaps.length - 1;
    },

    /*
        TileMapManager : setActiveMap - Sets the currently active map in use by the Tile Map Manager
        22/11/2016

        @param[in] pIdent - The identifier ised to select the map (Either an integral index number for the map
                            or a string containing the identifier of the map)
        @param[in] pCallback - A function that can be passed an an object layer for user processing (Optional)
    */
    setActiveMap: function(pIdent, pCallback) {
        //Verify the identifier flag
        switch (typeof pIdent) {
            case "string":
                //Check to see if the identfier is in the map
                if (!pIdent in this.__Internal__Dont__Modify__.namedIndicies)
                    throw new Error("Could not set the active map to '" + pIdent + "' as that identifier is not in the list");

                //Convert the identifier to its index
                pIdent = this.__Internal__Dont__Modify__.namedIndicies[pIdent];
                break;
            case "number":
                //Round to the nearest integral
                pIdent = Math.round(pIdent);

                //Check the identifier is within the vlaid range
                if (pIdent < 0 || pIdent >= this.__Internal__Dont__Modify__.loadedMaps.length)
                    throw new Error("Can not set the active map to " + pIdent + " as that is outside of the useable range");
                break;
            default:
                throw new Error("An unknown identifier was passed in, " + pIdent + " (Type: '" + typeof pIdent + ")");
        }

        //Set the active map
        this.__Internal__Dont__Modify__.currentMapIndex = pIdent;

        //Clear the highlight layers identifiers
        this.__Internal__Dont__Modify__.hightlightLayers = [];

        //If there is a callback pass the information to it
        if (typeof pCallback === "function") {
            //Loop through all object layers and call the callback function
            for (var i = 0; i < this.__Internal__Dont__Modify__.loadedMaps[pIdent].objectLayers.length; i++)
                pCallback(this.__Internal__Dont__Modify__.loadedMaps[pIdent].objectLayers[i]);
        }
    },

    /*
        TileMapManager : worldPosToTileCoord - Converts a world position to a tile coordinate on the current map
        22/11/2016

        @param[in] pPos - A Vec2 object holding the world position to convert

        @return Vec2 - Returns a Vec2 object containing the converted tile coordinate
    */
    worldPosToTileCoord: function(pPos) {
        //Ensure there is an active map
        if (this.__Internal__Dont__Modify__.currentMapIndex < 0)
            throw new Error("There is no active map. Please set an active map before attempting to convert a world position to tile coordinates");

        //Convert the world position
        return new Vec2(Math.floor(pPos.x / this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].tilewidth),
            Math.floor(pPos.y / this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].tileheight));
    },

    /*
        TileMapManager : tileCoordToWorldPos - Converts a tile corrdinate to a world position on the current map
        22/11/2016

        @param[in] pCoord - A Vec2 object holding the tile coordinate to convert

        @return Vec2 - Returns a vec2 object containing the converted world position
    */
    tileCoordToWorldPos: function(pCoord) {
        //Ensure there is an active map
        if (this.__Internal__Dont__Modify__.currentMapIndex < 0)
            throw new Error("There is no active map. Please set an active map before attempting to convert a tile coordinate to a world position");

        //Convert the tile coordinate
        return new Vec2(pCoord.x * this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].tilewidth,
            pCoord.y * this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex].tileheight);
    },

    /*
        TileMapManager : testTileCollision - Checks the tile corrdinates passed in to see if that tile is blocked
                                             on specifiable layers
        22/11/2016

        @param[in] pCoord - A Vec2 object defining the tile coordinate to check
        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to check collision 
                             against (Default checks everything)

        @return bool - Returns true if the coordinate is blocked. If coordinate is out of map bounds returns true
    */
    testTileCollision: function(pCoord, pIdents) {
        //Check there is an active map
        if (this.__Internal__Dont__Modify__.currentMapIndex < 0)
            throw new Error("Can not check collision as there is nto active map. Please set and active map before checking collision");

        //Get a reference to the current active map
        var activeMap = this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex];

        //Check to see if coordinates are within map bounds
        if (pCoord.x < 0 || pCoord.y < 0 || pCoord.x >= activeMap.width || pCoord.y >= activeMap.height)
            return true;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Clean the Identifiers---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Check if the identifiers where defined
        if (pIdents == null) {
            //Create an array
            pIdents = [];

            //Add every index into the array
            for (var i = 0; i < activeMap.layers.length; i++)
                pIdents[i] = i;
        }

        //Process defined identifiers
        else {
            //If the identifiers are not in an array
            if (!pIdents instanceof Array)
                pIdents = [pIdents];

            //Clean all identifiers within the array
            for (var i = 0; i < pIdents.length; i++)
                pIdents[i] = this.validifyLayerIdentifier(pIdents[i], -1);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Check Collision Data----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Loop through all layers and check for collisions
        for (var i = 0; i < pIdents.length; i++) {
            //Check if collision data is present at the cooridinate 
            if (activeMap.layers[pIdents[i]].collisionData[pCoord.y][pCoord.x])
                return true;
        }

        //Default no collision
        return false;
    },

    /*
        TileMapManager : testObjectCollision - Checks a defined world space dimensions to see if they collide on 
                                               specifiable layers
        22/11/2016

        @param[in] pX - The world X position of the object to test collision for
        @param[in] pY - The world Y position of the object to test collision for
        @param[in] pW - The world width of the object to test collision for
        @param[in] pH - The world height of the object to test collision for
        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to check collision 
                             against (Default checks everything)

        @return bool - Returns true if the coordinate is blocked. If coordinate is out of map bounds returns true
    */
    testObjectCollision: function(pX, pY, pW, pH, pIdents) {
        //Check there is an active map
        if (this.__Internal__Dont__Modify__.currentMapIndex < 0)
            throw new Error("Can not check collision as there is no active map. Please set and active map before checking collision");

        //Get a reference to the current active map
        var activeMap = this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex];

        //Check to ensure the object is contained by the map, if outside return colliding
        if (pX < 0 || pX + pW >= activeMap.width * activeMap.tilewidth ||
            pY < 0 || pY + pH >= activeMap.height * activeMap.tileHeight)
            return true;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Clean the Identifiers---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Check if the identifiers where defined
        if (pIdents == null) {
            //Create an array
            pIdents = [];

            //Add every index into the array
            for (var i = 0; i < activeMap.layers.length; i++)
                pIdents[i] = i;
        }

        //Process defined identifiers
        else {
            //If the identifiers are not in an array
            if (!pIdents instanceof Array)
                pIdents = [pIdents];

            //Clean all identifiers within the array
            for (var i = 0; i < pIdents.length; i++)
                pIdents[i] = this.validifyLayerIdentifier(pIdents[i], -1);
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

        //Loop through all layers and check for collisions
        for (var i = 0; i < pIdents.length; i++) {
            //Loop through all polling positions
            for (var j = 0; j < pollPositions.length; j++) {
                //Check if collision data is present at the cooridinate 
                if (activeMap.layers[pIdents[i]].collisionData[pollPositions[j].y][pollPositions[j].x])
                    return true;
            }
        }

        //Return no collision found
        return false;
    },

    /*
        TileMapManager : draw - Renders the currently active map as seen by a passed in camera
        22/11/2016

        @param[in] pCtx - The context of the canvas to render to
        @param[in] pCam - The Camera object being used to view the map
        @param[in] pIdents - Either a single identifier or an array of identifiers for layers to render (Default 
                             renders everything)
    */
    draw: function(pCtx, pCam, pIdents) {
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////-----------------------------------------Check Critical Values----------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Check there is an active map
        if (this.__Internal__Dont__Modify__.currentMapIndex < 0)
            throw new Error("Can not draw as there is no active map. Please set and active map before attempting to draw");

        //Check that the context is valid
        else if (!pCtx instanceof CanvasRenderingContext2D)
            throw new Error("Can not draw using " + pCtx + " (Type '" + typeof pCtx + "') as the 2D Context. Please use a 2D HTML5 canvas context object");

        //Check the camera is valid
        else if (!pCam instanceof Camera)
            throw new Error("Can not draw using " + pCam + " (Type '" + typeof pCam + "') as the Camera. Please use a Camera object");

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Clean the Identifiers---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Check if the identifiers where defined
        if (pIdents == null) {
            //Create an array
            pIdents = [];

            //Add every index into the array
            for (var i = 0; i < activeMap.layers.length; i++)
                pIdents[i] = i;
        }

        //Process defined identifiers
        else {
            //If the identifiers are not in an array
            if (!pIdents instanceof Array)
                pIdents = [pIdents];

            //Clean all identifiers within the array
            for (var i = 0; i < pIdents.length; i++)
                pIdents[i] = this.validifyLayerIdentifier(pIdents[i], -1);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////------------------------------------------Find The Area To Draw---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Get the projection view matrix from the Camera
        var projView = pCam.projectionView;

        //Store the inverse of projection view
        var projViewInv = projView.inversed;

        //Get the canvas area from the camera
        var renderArea = pCamera.canvasDimensions;

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

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////---------------------------------------------Draw The Tiles-------------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Set the transform used to draw
        pCtx.setTransform(projView.data[0][0], projView.data[0][1], projView.data[1][0], projView.data[1][1], projView.data[2][0], projView.data[2][1]);

        //Get a reference to the current map
        var curMap = this.__Internal__Dont__Modify__.loadedMaps[this.__Internal__Dont__Modify__.currentMapIndex];

        //Loop through the ID layers to draw
        for (var i = 0; i < pIdents.length; i++) {
            //Get the current layer ID
            var ID = pIdents[i];

            //Check if this layer is visible
            if (!curMap.layers[ID].visible) continue;

            //Set the opacity level
            pCtx.globalAlpha = curMap.layers[ID].opacity;

            //Loop through the Y axis cells to draw
            for (var y = drawMin.y; y <= drawMax.y; y++) {
                //Check the Y coord is valid
                if (y < 0 || y >= curMap.height) continue;

                //Loop through the X axis cells to draw
                for (var x = drawMin.x; x <= drawMax.x; x++) {
                    //Check the X coord is valid
                    if (x < 0 || x >= curMap.width) continue;

                    //Get the MapCell for this location
                    var cell = curMap.layers[ID].data[y][x];

                    //Check there is a cell to draw
                    if (!cell instanceof MapCell) continue;

                    //Draw the tile
                    pCtx.drawImage(curMap.tilesets[cell.tilesetIndex].image,
                        cell.x, cell.y, cell.w, cell.h,
                        x * curMap.tileWidth, y * curMap.tileHeight, curMap.tileWidth, curMap.tileHeight);
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
 *      Requires:
 *      ExtendProperties.js
 *
 *      Version: 2.0
 *      Reads JSON files from a location and pulls the required data
 *
 *      Purpose:
 *      Load the map information from a Tiled Map Editors 
 *      save file (*.json) in a way that can be displayed
 **/

/*
    TileMap : Constructor - Intitialise with default values or load 
                            a map file
    21/11/2016
*/
function TileMap() {
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
    this.tileWidth = 0;
    this.tileHeight = 0;
};

ExtendProperties(TileMap, {
    /*
        TileMap : loadMap - Load a map from a Tiled Map Editor .json file
        21/11/2016

        @param[in] pFilepath - The filepath of the .json file to load the information from
        @param[in] pImageCallback - An optional callback function that can be passed the 
                                    filepath of an image to load. Must return the loaded image
                                    (If not defined a new image object will be created for the 
                                    image)

        @return this - Returns itself once the function has completed                                   
    */
    loadMap: function(pFilePath, pImageCallback) {
        //Create a container for the return XML results
        var content = null;

        //Create the HTTP request
        var httpReq = new XMLHttpRequest();

        //Set the on load function
        httpReq.onload = function() {
            //Set the content 
            content = (httpReq.status === 200 && httpReq.readyState === 4 ? httpReq.responseText : "");
        };

        //Open the connection request
        httpReq.open("GET", pFilePath, true);

        //Send the request
        httpReq.send();

        //Record the starting time
        var startTime = Date.now();

        //Loop while waiting for a reply
        while (content === null) {
            //If 5 seconds pass then force an exit
            if (Date.now() - startTime >= 5000)
                content = "";
        }

        //If the response came back with nothing throw an error
        if (content === "")
            throw new Error("Could not load the information from " + pFilePath);

        //Parse the recieved JSON information
        var mapObj = JSON.parse(content);

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////--------------------------------------Load Base Map Information---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Read the map dimensions
        this.width = mapObj.width;
        this.height = mapObj.height;

        //Read the tile dimensions
        this.tileWidth = mapObj.tilewidth;
        this.tileHeight = mapObj.tileheight;

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////---------------------------------------Load Tileset Information---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Assign all of the tilesets to this map object
        this.tilesets = mapObj.tilesets;

        //Loop through and load all of the images
        for (var i = 0; i < this.tilesets.length; i++) {
            //Check if there is a image loading callback assigned
            if (typeof pImageCallback === "function")
                this.tilesets[i].image = pImageCallback(this.tilesets[i].image);

            //Otherwise create a new image element and assign the source
            else {
                //Store the source
                var src = this.tilesets[i].image;

                //Create the new image object
                this.tilesets[i].image = new Image();

                //Assign the source to the image
                this.tilesets[i].image.src = src;
            }
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////----------------------------------------Load Layers Information---------------------------------------////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Clear all current layer information
        this.layers = [];
        this.layerNamesToIndex = [];
        this.objectLayers = [];

        //Loop through all layers and find the required layers
        for (var i = 0; i < mapObj.layers.length; i++) {
            //Switch on the type of layer that is identified
            switch (mapObj.layers[i].type) {
                case "tilelayer":
                    //Store the index this layer is being saved at
                    var ind = this.layers.length;

                    //Assign this layer object to the next available layer index
                    this.layers[ind] = mapObj.layers[i];

                    //Check if this name already exists
                    if (this.layers[ind].name in this.layerNamesToIndex)
                        console.log("WARNING: Two tile layers with the same names ('" + this.layers[ind].name + "') were loaded. Name identifiers may not select the desired layer for rendering");

                    //Store the index of this named layer
                    this.layerNamesToIndex[this.layers[ind].name] = ind;

                    //Delete the offset values (They will just hurt me)
                    delete this.layers[ind].x;
                    delete this.layers[ind].y;

                    //Store the data values in a temporary location
                    var data = this.layers[ind].data;

                    //Add the collision data array to the layer
                    this.layers[ind].collisionData = [];

                    //Process the data values into quick readable formats
                    var tileProg = 0;
                    for (var y = 0; y < this.height; y++) {
                        //Create a new array for this line of data
                        this.layers[ind].data[y] = [];

                        //Create a new array for this line of collision data
                        this.layers[ind].collisionData[y] = [];

                        //Loop through all values on this line
                        for (var x = 0; x < this.width; x++) {
                            //Get the tile index 
                            var tileIndex = data[tileProg++];

                            //Find the tileset that this index belongs to
                            var foundTileset = -1;
                            for (var j = 0; j < this.tilesets.length; j++) {
                                //Check the tile index is within the tilesets range
                                if (tileIndex >= this.tilesets[j].firstgid && tileIndex < this.tilesets[j].firstgid + this.tilesets[i].tilecount) {
                                    foundTileset = j;
                                    break;
                                }
                            }

                            //Ensure that a tileset was found
                            if (foundTileset >= 0) {
                                //Subtract the first ID to get index into tileset
                                tileIndex -= this.tilesets[foundTileset].firstgid;

                                //Create a new Map Cell object
                                var cell = new MapCell();

                                //Assign the source image area
                                cell.w = this.tilesets[foundTileset].tilewidth;
                                cell.h = this.tilesets[foundTileset].tileheight;
                                cell.x = this.tilesets[foundTileset].margin + (tileIndex % this.tilesets[foundTileset].columns) * (cell.w + this.tilesets[foundTileset].spacing);
                                cell.y = this.tilesets[foundTileset].margin + Math.floor(tileIndex / this.tilesets[foundTileset].columns) * (cell.h + this.tilesets[foundTileset].spacing);

                                //Assign the used tileset index
                                cell.tilesetIndex = foundTileset;

                                //Add the cell to the layer map
                                this.layers[ind].data[y][x] = cell;
                            }

                            //Throw an error if there is a tileindex issue
                            else if (tileIndex != 0) throw new Error("Unable to find the tileset used for the Map Cell with TileID of " + tileIndex + ". This occured on layer " + ind + " ('" + this.layers[ind].name + "')");

                            //Set the collision data
                            this.layers[ind].collisionData[y][x] = (this.layers[ind].data[y][x] instanceof MapCell ? 1 : 0);
                        }
                    }

                    break;
                case "objectgroup":
                    //Assign this layer object to the  object layers map
                    this.objectLayers[this.objectLayers.length] = mapObj.layers[i];
                    break;
            }
        }

        //Return itself
        return this;
    },
});