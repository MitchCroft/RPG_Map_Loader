/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Graphics
 *      Author: Mitchell Croft
 *      Date: 30/08/2016
 *
 *      Version: 2.1
 *      Added window monitoring to provide window resize callback functionality
 *
 *      Requires:
 *      Mat3.js, Color.js, ExtendProperties.js
 *
 *      Purpose:
 *      Control and manage the rendering of 2D graphics to a contained
 *      HTML5 canvas object. Provides basic hierarchal rendering
 *      capabilities.
 **/

/*
    Graphics : Constructor - Initialise the graphics manager
    30/08/2016

    @param[in] pWidth - The desired width of the canvas (Default to tag settings)
    @param[in] pHeight - The desired height of the canvas (Default to tag settings)
    @param[in] pID - The ID of the canvas object to retrieve (Default to first on page)
    @param[in] pResizeCallback - A bool flag to indicate if the graphics object should
                                 call a user defiend callback when the window resizes (Default true)

    Example:

    //Create the graphics object
    var graphics = new Graphics();
    OR
    var graphics = new Graphics(1280, 720);
    OR
    var graphics = new Graphics(1280, 720, "gameCanvas");
    OR
    var graphics = new Graphics(1280, 720, "gameCanvas", false);
*/
function Graphics(pWidth, pHeight, pID, pResizeCallback) {
    //Get the canvas object
    this.canvas = (typeof pID === "string" ? document.getElementById(pID) :
        document.getElementsByTagName("canvas")[0]);

    //Check that a canvas was found
    if (this.canvas == null) {
        //Create the new canvas element
        this.canvas = document.createElement("canvas");

        //Add the canvas to the document
        document.body.appendChild(this.canvas);
    }

    //Set the window dimensions
    if (typeof pWidth === "number") this.canvas.width = Math.abs(pWidth);
    if (typeof pHeight === "number") this.canvas.height = Math.abs(pHeight);

    //Get the 2D context from the canvas
    this.draw = this.canvas.getContext("2d");

    //Create the render stack
    var renderStack = [];

    //Store a map of loaded images
    var imageMap = [];

    //Store a callback to a function which takes in the new window dimensions
    var windowResizeCallback = null;

    //Save a list of callbacks to execute when the canvas changes size
    var canvasResizeEvents = [];

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                            Rendering Functions                                             ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : beginRender - Start the rendering with the passed in properties
        31/07/2016

        @param[in] pTranslateX - The X value to translate the drawing point to (Default 0)
        @param[in] pTranslateY - The Y value to translate the drawing point to (Default 0)
        @param[in] pRot - The amount of rotation (Radians) to apply to the rendering process (Default 0)
        @param[in] pScaleX - The amount that the X dimension should be scaled by (Default 1)
        @param[in] pScaleY - The amount that the Y dimension should be scaled by (Default 1)

        Example:

        //Render the player to the canvas
        Graphics.beginRender(position.x, position.y, rotation, scale.x, scale.y);

        //Draw player image
        Graphics.draw.drawImage(...);
    */
    this.beginRender = function(pTranslateX, pTranslateY, pRot, pScaleX, pScaleY) {
        //Create the new transform
        var transform = createTranslationMat(typeof pTranslateX === "number" ? pTranslateX : 0,
            typeof pTranslateY === "number" ? pTranslateY : 0);

        //Apply the rotation matrix
        if (typeof pRot === "number")
            transform.multiSet(createRotationMat(pRot));

        //Apply the scale matrix
        if (typeof pScaleX === "number" || typeof pScaleY === "number")
            transform.multiSet(createScaleMat(typeof pScaleX === "number" ? pScaleX : 1,
                typeof pScaleY === "number" ? pScaleY : 1));

        //Check if there are other transforms in the stack
        if (renderStack.length)
            transform.set(renderStack[renderStack.length - 1].multi(transform));

        //Apply the transform
        this.transform = transform;

        //Push the transform onto the render stack
        renderStack.push(transform);
    };

    /*
        Graphics : endRender - End the rendering process restoring the pre-render properties
        31/07/2016

        Example:

        //Draw player image
        Graphics.draw.drawImage(...);

        //End the rendering
        Graphics.endRender();
    */
    this.endRender = function() {
        //Pop the current transform from the stack
        renderStack.pop();

        //Reset the previous transform if it exists
        if (renderStack.length) this.transform = renderStack[renderStack.length - 1];

        //Set the identity matrix
        else this.transform = null;
    };

    /*
        Graphics : loadImage - Creates and loads an image from the specified file path
                               if it does not already exist. Returns the previous instance
                               if it does exist.
        31/07/2016

        @param[in] pFilepath - The filepath of the image to load (Relative to the HTML calling this)

        @return Image Element - Returns a reference to an HTML Image element that has been
                                added to the document and assigned the passed in image

        Example:

        //Load the player image
        var playerImage = Graphics.loadImage("Sprites/player.png");
    */
    this.loadImage = function(pFilepath) {
        //Check if the image has already been loaded
        if (!(pFilepath in imageMap)) {
            //Create a new image
            imageMap[pFilepath] = new Image();
            imageMap[pFilepath].src = pFilepath;
        }

        //Return the image object
        return imageMap[pFilepath];
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Resize Functions                                             ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : setWindowResizeCallback - Set the callback function for the window resize event
        30/08/2016

        @param[in] pCB - A function that takes in the new width and height of the viewable area (Or null
                         to remove any callbacks)

        @return bool - Returns true if the callback was set

        Example:

        //Set the window resize callback
        Graphics.setWindowResizeCallback(function(pWidth, pHeight) {
            //TODO: React to the window resize
        });
    */
    this.setWindowResizeCallback = function(pCB) {
        //Check the parameter is a function
        if (pCB !== null && typeof pCB !== "function") return false;

        //Overwrite previous callback
        windowResizeCallback = pCB;

        //Return success
        return true;
    };

    /*
        Graphics : addCanvasResizeEvent - Add a callback function to be called when the canvas is resized 
                                          via the Graphics object
        30/08/2016

        @param[in] pCB - A function that takes in the new width and height of the viewable area as parameters

        @return bool - Returns true if the callback was added to the event list

        Example:

        //Add a callback to canvas resizing
        if (Graphics.addCanvasResizeEvent(resizeFunction)) {
            //TODO: Output the success message
        }
    */
    this.addCanvasResizeEvent = function(pCB) {
        //Ensure the parameter is a function
        if (typeof pCB !== "function") return false;

        //Check that the function has not already been added once
        for (var i = 0; i < canvasResizeEvents.length; i++) {
            if (canvasResizeEvents[i] === pCB) return false;
        }

        //Add the callback to the list
        canvasResizeEvents.push(pCB);

        //Return success
        return true;
    };

    /*
        Graphics : removeCanvasResizeEvent - Remove a callback function from the canvas resize events list
        30/08/2016

        @param[in] pCB - The function to remove from the callback list

        @return bool - Returns true if the callback was removed from the list

        Example:

        //Remove the callback from the canvas resizing
        if (Graphics.removeCanvasResizeEvent(resizeFunction)) {
            //TODO: Output the cuccess message
        }
    */
    this.removeCanvasResizeEvent = function(pCB) {
        //Loop through the events list
        for (var i = 0; i < canvasResizeEvents.length; i++) {
            //Check for function amtch
            if (canvasResizeEvents[i] === pCB) {
                //remove the function from the list
                canvasResizeEvents.splice(i, 1);

                //Return success
                return true;
            }
        }

        //Default return failure
        return false;
    };

    /*
        Graphics : triggerResizeEvents - Go through and call all canvas resize event callbacks
                                         (Called through size, width and height properties)
        30/08/2016

        Example:

        //Force resize callbacks
        Graphics.triggerResizeEvents();
    */
    this.triggerResizeEvents = function() {
        //Loop through all resize events
        for (var i = 0; i < canvasResizeEvents.length; i++)
            canvasResizeEvents[i](this.canvas.width, this.canvas.height);
    };

    //////////////////////////////-----Setup Window Resize Callback-----\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    if (pResizeCallback !== false) {
        //Assign the window callback
        window.addEventListener("resize", function() {
            //If the callback function has been set call it
            if (typeof windowResizeCallback === "function")
                windowResizeCallback(window.innerWidth, window.innerHeight);
        }, false);
    }
};

ExtendProperties(Graphics, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : transform - Change the current transform being being used to render
        31/07/2016

        @param[in] pTrans - The transform to assign (Null clears current transform)

        Example:

        //Set player transform
        Graphics.transform = playerTransform;

        OR

        //Clear the current transform
        Graphics.transform = null;
    */
    set transform(pTrans) {
        //Test the type of pTrans
        if (pTrans instanceof Mat3)
            this.draw.setTransform(pTrans.data[0][0], pTrans.data[0][1], pTrans.data[1][0], pTrans.data[1][1], pTrans.data[2][0], pTrans.data[2][1]);

        //Remove the current transform
        else
            this.draw.setTransform(1, 0, 0, 1, 0, 0);
    },

    /*
        Graphics : size - Get the size of the contained canvas object
        28/08/2016

        @return Vec2 - Returns a Vec2 object holding the size of the canvas

        Example:

        //Get the dimensions of the canvas
        var canvasBounds = Graphics.size;
    */
    get size() {
        return new Vec2(this.canvas.width, this.canvas.height);
    },

    /*
        Graphics : size - Set the size of the contained canvas object
        28/08/2016

        @param[in] pDim - A Vec2 object containing the new dimensions of the canvas

        Example:

        //Resize the canvas object
        Graphics.size = new Vec2(1280, 720);
    */
    set size(pDim) {
        //Set the canvas dimensions
        this.canvas.width = pDim.x;
        this.canvas.height = pDim.y;

        //Trigger resize callbacks
        this.triggerResizeEvents();
    },

    /*
        Graphics : width - Returns the current width of the canvas being used
        31/07/2016

        @return number - Returns the width as a number

        Example:

        //Position the player halfway across the screen
        playerPositionX = Graphics.width / 2;
    */
    get width() {
        return this.canvas.width;
    },

    /*
        Graphics : width - Sets the width of the current canvas object
        31/07/2016

        @param[in] pWidth - A number representing the new width of the canvas

        Example:

        //Resize the canvas to user selection
        Graphics.width = userWidth;
    */
    set width(pWidth) {
        //Change the size of the canvas
        this.canvas.width = pWidth;

        //Trigger resize callbacks
        this.triggerResizeEvents();
    },

    /*
        Graphics : height - Returns the current height of the canvas being used
        31/07/2016

        @return number - Returns the height as a number

        Example:

        //Position the player halfway down the screen
        playerPositionY = Graphics.height;      
    */
    get height() {
        return this.canvas.height;
    },

    /*
        Graphics : height - Sets the height of the current canvas object
        31/07/2016

        @param[in] pHeight - A number representing the new height of the canvas

        Example:

        //Resize the canvas to user selection
        Graphics.height = userHeight;
    */
    set height(pHeight) {
        //Change the size of the canvas
        this.canvas.height = pHeight;

        //Trigger resize callbacks
        this.triggerResizeEvents();
    },

    /*
        Graphics : availableArea - Get the available area on the current window
        30/08/2016

        @return Vec2 - Returns a Vec2 object containing the available window area

        Example:

        //Get the total dimensions of the window
        var available = Graphics.availableArea;
    */
    get availableArea() {
        return new Vec2(window.innerWidth, window.innerHeight);
    },

    /*
        Graphics : availableWidth - Get the available width on the current window
        30/08/2016

        @return number - Returns a number containing the total available width

        Example:

        //Get the width of the window
        var availableWidth = Graphics.availableWidth;
    */
    get availableWidth() {
        return window.innerWidth;
    },

    /*
        Graphics : availableHeight - Get the available height on the current window
        30/08/2016

        Return number - Returns a number containing the total available height

        Example:

        //Get the height of the window
        var availableHeight = Graphics.availableHeight;
    */
    get availableHeight() {
        return window.innerHeight;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : outlineText - Render text to a specified position with an outline
        17/06/2016

        @param[in] pText - The text to render to the display
        @param[in] pXPos - The X position to render the text at
        @param[in] pYPos - The Y position to render the text at
        @param[in] pMainCol - The color to render the main body of text in (Default White)
        @param[in] pBorderCol - The color to render the outline of text in (Default Black)
        @param[in] pScale - The scale of the border from the main body of text (Default 1)

        Example:

        //DISPLAY WINNER
        Graphics.outlineText('You Win!', width / 2, height / 2, 'green', 'black', 2);
    */
    outlineText: function(pText, pXPos, pYPos, pMainCol, pBorderCol, pScale) {
        //Define the text offset values
        var offsets = [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }];

        //Set the offset color
        this.draw.fillStyle = (pBorderCol instanceof Color ? pBorderCol.rgba :
            typeof pBorderCol === "string" ? pBorderCol : "#000");

        //Get the scale value
        if (typeof pScale !== "number")
            pScale = 1;

        //Loop through and render background text
        for (var i = 0; i < offsets.length; i++)
            this.draw.fillText(pText, pXPos + offsets[i].x * pScale, pYPos + offsets[i].y * pScale);

        //Set the main color
        this.draw.fillStyle = (pMainCol instanceof Color ? pMainCol.rgba :
            typeof pMainCol === "string" ? pMainCol : "#FFF");

        //Render main text
        this.draw.fillText(pText, pXPos, pYPos);
    },
});