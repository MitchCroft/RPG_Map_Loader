/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Graphics
 *      Author: Mitchell Croft
 *      Date: 30/11/2016
 *
 *      Version: 3.0
 *      Removed use of pre-existing canvas objects and added a double buffer
 *
 *      Requires:
 *      Mat3.js, Color.js, ExtendProperties.js
 *
 *      Purpose:
 *      Control and manage the rendering of 2D graphics to a contained 
 *      HTML5 canvas object. Provides basic hierarchal rendering capabilities.
 **/

/*
    Graphics : Constructor - Initialise the graphics manager
    30/11/2016

    @param[in] pWidth - The desired width of the canvas
    @param[in] pHeight - The desired height of the canvas
    @param[in] pResizeCallback - A bool flag to indicate if the graphics object
                                 should call a user defined callback when the window
                                 resizes (Default true)

    Example:

    //Create the graphics object
    var graphics = new Graphics(1280, 720);
    OR
    var graphics = new Graphics(1280, 720, false);
*/
function Graphics(pWidth, pHeight, pResizeCallback) {
    /*  WARNING:
        Don't modify this internal object from the outside of the Graphics object.
        Instead use Graphics object properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Store two canvas objects for rendering to
        canvas: [],

        //Store references to the 2D context's for the different canvas'
        context: [],

        //Store the currently active buffer that is being rendered to
        renderBufferIndex: 0,

        //Store a stack of hierarchal matricies
        renderStack: [],

        //Store a map of loaded images
        imageMap: [],

        //Store a callback to a function which takes in the new window dimensions
        windowResizeCallback: null,

        //Save a list of callbacks to execute when the canvas changes size
        canvasResizeEvents: [],
    };

    //Create the canvas and context objects
    for (var i = 0; i < 2; i++) {
        //Create the canvas
        this.__Internal__Dont__Modify__.canvas[i] = document.createElement("canvas");

        //Add the canvas to the document
        document.body.appendChild(this.__Internal__Dont__Modify__.canvas[i]);

        //Set the dimensions of the canvas
        this.__Internal__Dont__Modify__.canvas[i].width = Math.abs(pWidth);
        this.__Internal__Dont__Modify__.canvas[i].height = Math.abs(pHeight);

        //Get the 2D context from the canvas
        this.__Internal__Dont__Modify__.context[i] = this.__Internal__Dont__Modify__.canvas[i].getContext("2d");

        //Hide the current render buffer
        //this.__Internal__Dont__Modify__.canvas[i].style.visibility = (i === this.__Internal__Dont__Modify__.renderBufferIndex ? "hidden" : "visible");
    }

    //Setup the window resize callback
    if (pResizeCallback !== false) {
        //Store a reference to this
        var that = this;

        //Assign the window callback
        window.addEventListener("resize", function() {
            //If the callback function has been set call it
            if (typeof that.__Internal__Dont__Modify__.windowResizeCallback === "function")
                that.__Internal__Dont__Modify__.windowResizeCallback(window.innerWidth, window.innerHeight);
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
        Graphics : draw - Get the rendering context for the current render buffer
        30/11/2016

        @return CanvasRenderingContext2D - Returns the rendering context for the current render buffer
    */
    get draw() {
        return this.__Internal__Dont__Modify__.context[this.__Internal__Dont__Modify__.renderBufferIndex];
    },

    /*
        Graphics : canvas - Get the canvas that is currently being rendered to
        30/11/2016

        @return Canvas - Returns a HTML5 canvas object 
    */
    get canvas() {
        return this.__Internal__Dont__Modify__.canvas[this.__Internal__Dont__Modify__.renderBufferIndex];
    },

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
        Graphics : size - Set the size of the contained canvas objects
        30/11/2016

        @param[in] pDim - A Vec2 object containing the new dimensions of the canvas

        Example:

        //Resize the canvas object
        Graphics.size = new Vec2(1280, 720);
    */
    set size(pDim) {
        //Check the type
        if (!pDim instanceof Vec2)
            throw new Error("Can not set the canvas dimensions to " + pDim + " (Type: '" + typeof pDim + "') Please use a Vec2 object");

        //Loop through the the canvas obejcts
        for (var i = 0; i < this.__Internal__Dont__Modify__.canvas.length; i++) {
            //Set the canvas dimensions
            this.__Internal__Dont__Modify__.canvas[i].width = pDim.x;
            this.__Internal__Dont__Modify__.canvas[i].height = pDim.y;
        }

        //Trigger the resize callback events
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
        //Loop through all canvas obejcts and set the width
        for (var i = 0; i < this.__Internal__Dont__Modify__.canvas.length; i++)
            this.__Internal__Dont__Modify__.canvas[i].width = pWidth;

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
        //Loop through all canvas obejcts and set the height
        for (var i = 0; i < this.__Internal__Dont__Modify__.canvas.length; i++)
            this.__Internal__Dont__Modify__.canvas[i].height = pHeight;

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
    /////                                             Rendering Functions                                            ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : beginRender - Start the rendering with the passed in properties
        30/11/2016

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
    beginRender: function(pTranslateX, pTranslateY, pRot, pScaleX, pScaleY) {
        //Create the new transform
        var transform = createTransform(pTranslateX, pTranslateY, pRot, pScaleX, pScaleY);

        //Check if there are other transforms in the stack
        if (this.__Internal__Dont__Modify__.renderStack.length)
            transform.set(this.__Internal__Dont__Modify__.renderStack[this.__Internal__Dont__Modify__.renderStack.length - 1].multi(transform));

        //Apply the transform
        this.transform = transform;

        //Push the transform onto the render stack
        this.__Internal__Dont__Modify__.renderStack.push(transform);
    },

    /*
        Graphics : endRender - End the rendering process restoring the pre-render properties
        30/11/2016

        Example:

        //Draw player image
        Graphics.draw.drawImage(...);

        //End the rendering
        Graphics.endRender();
    */
    endRender: function() {
        //Pop the current transform from the stack
        this.__Internal__Dont__Modify__.renderStack.pop();

        //Reset the previous transform if it exists
        if (this.__Internal__Dont__Modify__.renderStack.length)
            this.transform = this.__Internal__Dont__Modify__.renderStack[this.__Internal__Dont__Modify__.renderStack.length - 1];

        //Otherwise reset the transform
        else this.transform = null;
    },

    /*
        Graphics : loadImage - Creates and loads an image from the specified file path
                               if it does not already exist. Returns the previous instance
                               if it does exist.
        30/11/2016

        @param[in] pFilePath - The filepath of the image to load (Relative to the HTML calling this)

        @return Image Element - Returns a reference to an HTML Image element that has been
                                added to the document and assigned the passed in image

        Example:

        //Load the player image
        var playerImage = Graphics.loadImage("Sprites/player.png");
    */
    loadImage: function(pFilePath) {
        //Check if the image has already been loaded
        if (!(pFilePath in this.__Internal__Dont__Modify__.imageMap)) {
            //Create a new Image object
            this.__Internal__Dont__Modify__.imageMap[pFilePath] = new Image();

            //Assign the source filepath
            this.__Internal__Dont__Modify__.imageMap[pFilePath].src = pFilePath;
        }

        //Return the image object
        return this.__Internal__Dont__Modify__.imageMap[pFilePath];
    },

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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Resize Functions                                             ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : setWindowResizeCallback - Set the callback function for the window resize event
        30/11/2016

        @param[in] pCB - A function that takes in the new width and height of the viewable area (Or 
                         null to remove the callback)

        Example:

        //Set the window resize callback
        Graphics.setWindowResizeCallback(function(pWidth, pHeight) {
            //TODO: React to the window resize
        });
    */
    setWindowResizeCallback: function(pCB) {
        //Check for null
        if (pCB == null) {
            this.__Internal__Dont__Modify__.windowResizeCallback = null;
            return;
        }

        //Check the type
        if (typeof pCB !== "function")
            throw new Error("Can not set the Graphics window resize callback to " + pCB + " (Type: '" + typeof pCB + "') Please use a function that accepts the viewable width and height or null");

        //Set the callback
        this.__Internal__Dont__Modify__.windowResizeCallback = pCB;
    },

    /*
        Graphics : addCanvasResizeEvent - Add a callback function to be called when the canvas is resized via
                                          the Graphics object
        30/11/2016

        @param[in] pCB - A function that takes in the new width and height of the canvas

        @return bool - Returns true if the callback was added to the event list

        Example:

        //Add a canvas resize callback
        if (Graphics.addCanvasResizeEvent(resizeFunction)) {
            //TODO: Output success message
        }
    */
    addCanvasResizeEvent: function(pCB) {
        //Check the type
        if (typeof pCB !== "function")
            throw new Error("Can not add a canvas resize event using " + pCB + " (Type: '" + typeof pCB + "') Please use a function that takes in the new width and height of the canvas");

        //Check if the function already exists in the list
        for (var i = 0; i < this.__Internal__Dont__Modify__.canvasResizeEvents.length; i++) {
            //Check for a function match
            if (this.__Internal__Dont__Modify__.canvasResizeEvents[i] === pCB) return false;
        }

        //Add the callback to the list
        this.__Internal__Dont__Modify__.canvasResizeEvents.push(pCB);

        //Return success
        return true;
    },

    /*
        Graphics : removeCanvasResizeEvent - Remove a callback function from the canvas resize events list
        30/11/2016

        @param[in] pCB - The function to remove from the callback list

        @return bool - Returns true if the callback was removed from the list

        Example:

        //Remove the callback from the canvas resizing
        if (Graphics.removeCanvasResizeEvent(resizeFunction)) {
            //TODO: Output success message
        }
    */
    removeCanvasResizeEvent: function(pCB) {
        //Loop through the events list
        for (var i = 0; i < this.__Internal__Dont__Modify__.canvasResizeEvents.length; i++) {
            //Check for a function match
            if (this.__Internal__Dont__Modify__.canvasResizeEvents[i] === pCB) {
                //Remove the function from the list
                this.__Internal__Dont__Modify__.canvasResizeEvents.splice(i, 1);

                //Return success
                return true;
            }
        }

        //Default return failure
        return false;
    },

    /*
        Graphics : triggerResizeEvents - Go through and call all canvas resize event callbacks
                                         (Called through size, width and height properties)
        30/11/2016

        Example:

        //Force resize callbacks
        Graphics.triggerResizeEvents();
    */
    triggerResizeEvents: function() {
        //Loop through all resize events 
        for (var i = 0; i < this.__Internal__Dont__Modify__.canvasResizeEvents.length; i++)
            this.__Internal__Dont__Modify__.canvasResizeEvents[i](this.canvas.width, this.canvas.height);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Graphics : swapBuffers - Swap over the currently active render buffer
        30/11/2016

        Example:

        //TODO: Render all obejcts for the frame

        //Swap over the render buffers
        Graphics.swapBuffers();
    */
    swapBuffers: function() {
        //Store the index of the other buffer
        var otherBuffer = (this.__Internal__Dont__Modify__.renderBufferIndex + 1) % this.__Internal__Dont__Modify__.canvas.length;

        //Swap the visibility over
        this.__Internal__Dont__Modify__.canvas[this.__Internal__Dont__Modify__.renderBufferIndex].style.visibility = "visible";
        this.__Internal__Dont__Modify__.canvas[otherBuffer].style.visibility = "hidden";

        //Save the new active render buffer
        this.__Internal__Dont__Modify__.renderBufferIndex = otherBuffer;
    },
});