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
        currentMapIndex: 0,

        //Store the display dimensions for the tiles
        displayDimensions: new Vec2(typeof pDisplayTileWidth === "number" ? pDisplayTileWidth : 10, typeof pDisplayTileHeight === "number" ? pDisplayTileHeight : 10),

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
        TileMapManager : validifyLayerIdentifier - Takes an identification value and returns a valid layer index
        21/11/2016

        @param[in] pIdent - The identifier to validate (Number, string or null)
        @param[in] pDefault - The default index to assign if the identifier is invalid

        @return number - Returns a whole number that is either the vlaid index or the default
    */
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
 *      Name: Layer
 *      Author: Mitchell Croft
 *      Date: 21/11/2016
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Store the rendering information for a single layer of a Tiled map file
 **/

/*
    Layer : Constructor -Initialise with default values
    21/11/2016
*/
function Layer() {
    //Store an array of MapCell objects that make up this layer
    this.data = [];

    //Store an array of collision data about this layer
    this.collisionData = [];

    //Store the rendering values of the layer
    this.name = "UNNAMED";
    this.visible = false;
    this.opacity = 0;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: TileSet
 *      Author: Mitchell Croft
 *      Date: 21/11/2016
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Load and save information relating to the tilesets used to render
 *      a Tiled map
 **/

/*
    TileSet : Constructor - Initialise with default values
    21/11/2016
*/
function TileSet() {
    //Store the image used to store the tileset
    this.image = null;

    //Store padding/spacing information
    this.margin = 0;
    this.spacing = 0;

    //Store the tileset dimensions
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;

    //Store the tile layout values
    this.firstID = 0;
    this.columns = 0;
    this.tileCount = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
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
 *      Version: 1.0
 *
 *      Purpose:
 *      Load the map information from a Tiled Map Editors 
 *      save file (*.json) in a way that can be displayed
 **/

/*
    TileMap : Constructor - Intitialise with default values or load 
                            a map file
    21/11/2016

    @parma[in] pFilePath - The filepath to the .json file to load
*/
function TileMap(pFilePath) {
    //Create an array for the differemt layers of the map
    this.layers = [];

    //Store the index values of the names of the layers in the map
    this.layerNamesToIndex = [];

    //Store the objects found on the map
    this.objectLayers = [];

    //Store the names of the object layers (For supplying to callback functions)
    this.objectLayerIdentifiers = [];

    //Store the different tilesets used by the TileMap
    this.tilesets = [];

    //Store the map dimensions
    this.width = 0;
    this.height = 0;

    //Store the tile dimensions
    this.tileWidth = 0;
    this.tileHeight = 0;

    //Check if the file path is a string
    if (typeof pFilePath === "string")
        this.loadMap(pFilePath);
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
        httpReq.open("GET", pFilepath, true);

        //Send the request
        httpReq.send();

        //Loop while waiting for a reply
        while (content === null);

        //If the response is not an XML document throw an error
        if (content === "") return;

        //Parse the recieved JSON information
        var mapObj = JSON.parse(content);

        //Read the map dimensions
        this.width = mapObj.width;
        this.height = mapObj.height;

        //Read the tile dimensions
        this.tileWidth = mapObj.tilewidth;
        this.tileHeight = mapObj.tileheight;

        //Load the tilesets in use
        this.tilesets = [];
        for (var i = 0; i < mapObj.tilesets.length; i++) {
            //Create a new tileset object
            var set = new TileSet();

            //Load padding information
            set.spacing = mapObj.tilesets[i].spacing;
            set.margin = mapObj.tilesets[i].margin;

            //Load image dimensions
            set.imageWidth = mapObj.tilesets[i].imagewidth;
            set.imageHeight = mapObj.tilesets[i].imageheight;
            set.tileWidth = mapObj.tilesets[i].tilewidth;
            set.tileHeight = mapObj.tilesets[i].tileheight;

            //Load the tile layout values
            set.firstID = mapObj.tilesets[i].firstgid;
            set.columns = mapObj.tilesets[i].columns;
            set.tileCount = mapObj.tilesets[i].tilecount;

            //Check for image callback
            if (typeof pImageCallback === "function")
                set.image = pImageCallback(mapObj.tilesets[i].image);

            //Create a new image object
            else {
                set.image = new Image();
                set.image.src = mapObj.tilesets[i].image;
            }

            //Store the tilset in the array
            this.tilesets[i] = set;
        }

        //Create an array to hold the loaded Map objects
        this.objectLayers = [];

        //Create an array to hold the identifiers of the objects layers
        this.objectLayerIdentifiers = [];

        //Load the layer information
        this.layers = [];
        for (var i = 0; i < mapObj.layers.length; i++) {
            //Switch based on the layers type 
            switch (mapObj.layers[i].type) {
                case "tilelayer":
                    //Create a new layer object
                    var set = new Layer();

                    //Load rendering values
                    set.name = mapObj.layers[i].name;
                    set.visible = mapObj.layers[i].visible;
                    set.opacity = mapObj.layers[i].opacity;

                    //Load data values
                    var tileProg = 0;
                    for (var y = 0; y < this.height; y++) {
                        //Create a new array for this line of data
                        set.data[y] = [];

                        //Create a new array for this line of collision data
                        set.collisionData[y] = [];

                        //Loop through all values on this line
                        for (var x = 0; x < this.width; x++) {
                            //Get the tile index
                            var tileIndex = mapObj.layers[i].data[tileProg++];

                            //Find the tileset the index belongs to
                            var foundTileset = -1;
                            for (var j = 0; j < this.tilesets.length; j++) {
                                //Check if the tile index is within the tilesets range
                                if (tileIndex >= this.tilesets[j].firstID && tileIndex < this.tilesets[j].firstID + this.tilesets[j].tileCount) {
                                    foundTileset = j;
                                    break;
                                }
                            }

                            //Ensure the tileset was found
                            if (foundTileset >= 0) {
                                //Subtract the first ID to get the index onto the tilesheet
                                tileIndex -= this.tilesets[foundTileset].firstID;

                                //Create a new Map Cell object
                                var cell = new MapCell();

                                //Assign the source image area
                                cell.w = this.tilesets[foundTileset].tileWidth;
                                cell.h = this.tilesets[foundTileset].tileHeight;
                                cell.x = this.tilesets[foundTileset].margin + (tileIndex % this.tilesets[foundTileset].columns) * (cell.w + this.tilesets[foundTileset].spacing);
                                cell.y = this.tilesets[foundTileset].margin + Math.floor(tileIndex / this.tilesets[foundTileset].columns) * (cell.h + this.tilesets[foundTileset].spacing);

                                //Assign the used tileset index
                                cell.tilesetIndex = foundTileset;

                                //Add cell to layer map
                                set.data[y][x] = cell;
                            }

                            //Through not found error
                            else if (tileIndex != 0) throw new Error("Unable to find the tileset used for the Map Cell with TileID of " + tileIndex);

                            //Set the collision data
                            set.collisionData[y][x] = (set.data[y][x] instanceof MapCell ? 1 : 0);
                        }
                    }

                    //Add the layer to the TileMap
                    this.layers[this.layers.length] = set;

                    //Check the layer name duplicate 
                    if (set.name in this.layerNamesToIndex)
                        console.log("Warning: Two layers with the same names were identified in the map being loaded. Name identifiers may not select the desired layer for rendering");

                    //Add the name to the index map
                    this.layerNamesToIndex[set.name] = this.layers.length - 1;
                    break;
                case "objectgroup":
                    //Add an array for the current object layer
                    this.objectLayers[this.objectLayers.length] = [];

                    //Set the object layer identifier
                    this.objectLayerIdentifiers[this.objectLayerIdentifiers.length] = mapObj.layers[i].name;

                    //Loop through all of this layers objects, add objects to the current object layer
                    for (var j = 0; j < mapObj.layers[i].objects.length; j++)
                        this.objectLayers[this.objectLayers.length - 1].push(mapObj.layers[i].objects[j]);
                    break;
            }
        }

        //Return itself
        return this;
    },
});