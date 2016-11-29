/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: AnimationController
 *      Author: Mitchell Croft
 *      Date: 25/11/2016
 *
 *      Requires:
 *      ExtendProperties.js
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Maintain a set of animations based on Animator JSON files
 *      that define a number of attributes about the animations
 *
 *      NOTE: Animator JSON Layout
 *
 *      name: The name of the animator
 *      tilesets: An array of file paths to different tile sets relative to the 
 *                Animator JSON file. A random one will be selected to use for 
 *                the Animation Controller, so all of the properties of this file
 *                should be applicable to all tile sets
 *      framewidth: The width of a single animation frame
 *      frameheight: The height of a single animation frame
 *      columns: The number of columns that are on the 
 *      imagewidth: The width of the tileset image
 *      imageheight: The height of the tileset image
 *      speed: The speed with which the animations should playback at
 *      animations: An array of objects with the following properties
 *          name: The name of the current animation (Used for selection)
 *          frames: An array of indicies onto the tilesheet for the frames
 *                  that make up this animation
 *          speed: The speed at which this animation should playback at
 *          fps: The number of frames per second this animation should play at
 **/

/*
    AnimationController : Constructor - Initialise with default values
    25/11/2016
*/
function AnimationController() {
    /*  WARNING:
        Don't modify this internal object from the outside of the AnimationController.
        Instead use camera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Store a flag to indicate when this AnimationController has been loaded
        loaded: false,

        //Store the name of the Animator that is loaded
        name: "UNNAMED",

        //Store a reference to the image being used by this controller
        image: null,

        //Store information about the loaded tileset
        framewidth: 0,
        frameheight: 0,
        columns: 0,
        imagewidth: 0,
        imageheight: 0,

        //Store the overall speed scale to apply to all animations
        speed: 0,

        //Store a flag, used to pause the playback of animations
        paused: false,

        //Store an array of the animations loaded
        animations: [],

        //Store the names of the animations and their index location
        namedIndicies: [],

        //Store the index of the current animation
        currentAnimation: -1,

        //Store the idex of the current frame that is being shown
        currentFrame: -1,

        //Store the elapsed time between frame changes
        elapsedTime: 0,
    };
};

ExtendProperties(AnimationController, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        AnimationController : loaded - Get the loaded state of the AnimationController
        25/11/2016

        @return bool - Returns true if the AnimationController has been loaded
    */
    get loaded() {
        return this.__Internal__Dont__Modify__.loaded;
    },

    /*
        AnimationController : name - Get's the name of the current Animator in use
        25/11/2016

        @return string - Returns the name as a string
    */
    get name() {
        return this.__Internal__Dont__Modify__.name;
    },

    /*
        AnimationController : framewidth - Get the width of a single frame
        25/11/2016

        @return number - Returns a number containing the width of a single frame
    */
    get framewidth() {
        return this.__Internal__Dont__Modify__.framewidth;
    },

    /*
        AnimationController : frameheight - Get the height of a single frame

        25/11/2016

        @return number - Returns a number containing the height of a single frame
    */
    get frameheight() {
        return this.__Internal__Dont__Modify__.frameheight;
    },

    /*
        AnimationController : speed - Get the speed scale applied all animations
        25/11/2016

        @return number - Returns a number that represents the speed scale
    */
    get speed() {
        return this.__Internal__Dont__Modify__.speed;
    },

    /*
        AnimationController : speed - Set the speed scale applied to all animations
        25/11/2016

        @param[in] pScl - A number defineing the new speed scale (>= 0)
    */
    set speed(pScl) {
        //Check the type 
        if (typeof pScl !== "number")
            throw new Error("Can not set the Animation Controllers speed to " + pScl + " (Type: '" + typeof pScl + "'). Please use a number that is >= 0");

        //Clamp the scale to a minimum of 0
        pScl = Math.max(0, pScl);

        //Set the speed scale
        this.__Internal__Dont__Modify__.speed = pScl;
    },

    /*
        AnimationController : paused - Gets the flag that indicates if the Animation
                                       Controller is paused
        25/11/2016

        @return bool - Returns true if the Controller is paused
    */
    get paused() {
        return this.__Internal__Dont__Modify__.paused;
    },

    /*
        AnimationController : paused - Set the flag that indicates if Animation playback
                                       is paused
        25/11/2016

        @param[in] pState - A bool indicating the new paused state
    */
    set paused(pState) {
        //Check the type
        if (typeof pState !== "boolean")
            throw new Error("Can not set the Animation Controller's paused state to " + pState + " (Type: '" + typeof pState + "') Please use a boolean value");

        //Set the state flag
        this.__Internal__Dont__Modify__.paused = pState;
    },

    /*
        AnimationController : currentIndex - Returns the index of the current animation
        25/11/2016

        @return number - Returns the index as integral number or -1 if none
    */
    get currentIndex() {
        return this.__Internal__Dont__Modify__.currentAnimation;
    },

    /*
        AnimationController : currentName - Returns the name of the current animation
        25/11/2016

        @return string - Returns the name as string or null if none
    */
    get currentName() {
        //Check there is an active animation
        if (this.__Internal__Dont__Modify__.currentAnimation < 0) return null;

        //Return the name of the animation
        return this.__Internal__Dont__Modify__.animations[this.__Internal__Dont__Modify__.currentAnimation].name;
    },

    /*
        AnimationController : currentAnimation - Set the current animation that is playing
        25/11/2016

        @param[in] pIdent - Either a number defining the index of the animation or a string
                            containing the name of the animation to play
    */
    set currentAnimation(pIdent) {
        //Validify the identification value
        switch (typeof pIdent) {
            case "number":
                //Round the identifier to the nearest whole 
                pIdent = Math.round(pIdent);

                //Check the identifier is within the usabel range
                if (pIdent < 0 || pIdent >= this.__Internal__Dont__Modify__.animations.length)
                    throw new Error("Can not use animation " + pIdent + " as it is not within the useable range. Please use a valid index (0 - " + this.__Internal__Dont__Modify__.animations.length - 1 + ")");
                break;
            case "string":
                //Check the identifier is used for one of the animations
                if (!pIdent in this.__Internal__Dont__Modify__.namedIndicies)
                    throw new Error("Can not use animation " + pIdent + " as it is not a valid animation name.");

                //Retrieve the index of the animation
                pIdent = this.__Internal__Dont__Modify__.namedIndicies[pIdent];
                break;
            default:
                throw new Error("Can not use " + pIdent + " (Type: '" + typeof pIdent + "') as an animation identifier. Please use a valid index or string identifier");
        }

        //Check if the specified animation is already playing
        if (pIdent === this.__Internal__Dont__Modify__.currentAnimation) return;

        //Set the current animation index
        this.__Internal__Dont__Modify__.currentAnimation = pIdent;

        //Reset the frame progress values
        this.__Internal__Dont__Modify__.currentFrame =
            this.__Internal__Dont__Modify__.elapsedTime = 0;
    },

    /*
        AnimationController : drawFrame - Get an object describing the frame to render
        25/11/2016

        @return object - Returns an object with an "image" object containing a reference
                         to the image to render and an x, y, w and h that describe the source
                         image dimensions to render
    */
    get drawFrame() {
        //Get the current frame
        var frame = this.__Internal__Dont__Modify__.animations[this.__Internal__Dont__Modify__.currentAnimation].frames[this.__Internal__Dont__Modify__.currentFrame];

        //Return the object
        return {
            //Provide a reference to the image to draw
            image: this.__Internal__Dont__Modify__.image,

            //Calculate the source dimensions
            x: frame.x,
            y: frame.y,
            w: frame.w,
            h: frame.h,
        };
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        AnimationController : loadAnimator - Load the animations from a Animator .json file
        25/11/2016

        @param[in] pFilePath - The filepath of the .json file to load the information from
        @param[in] pImageCallback - An optional callback function that can be passed the 
                                    filepath of an image to load. Must return the loaded image
                                    (If not defined a new image object will be created for the 
                                    image)
        @param[in] pIndex - An optional index defining the tileset to use (Default random)

        @return this - Returns itself once the function has completed   
    */
    loadAnimator: function(pFilePath, pImageCallback, pIndex) {
        //FLag this Animation Controller as not being loaded
        this.__Internal__Dont__Modify__.loaded = false;

        //Store a reference to the current AnimationController
        var that = this;

        //Create the HTTP request
        var httpReq = new XMLHttpRequest();

        //Set the on load function
        httpReq.onload = function() {
            //Set the content 
            var content = (httpReq.status === 200 && httpReq.readyState === 4 ? httpReq.responseText : "");

            //Check if the content was loaded
            if (content === "") throw new Error("Unable to load the content found at " + pFilePath);

            //Parse the recieved JSON information
            var animator = JSON.parse(content);

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////---------------------------------------Load Tileset Information---------------------------------------////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Store the name of the animator
            that.__Internal__Dont__Modify__.name = animator.name;

            //Store the index of the tileset to load
            var toLoad = (typeof pIndex === "number" ? pIndex : Math.floor(Math.random() * animator.tilesets.length));

            //Load the image via the callback if set
            if (typeof pImageCallback === "function")
                that.__Internal__Dont__Modify__.image = pImageCallback(Path.getDirectory(pFilePath) + animator.tilesets[toLoad]);

            //Otherwise create a new image object
            else {
                that.__Internal__Dont__Modify__.image = new Image();
                that.__Internal__Dont__Modify__.image.src = Path.getDirectory(pFilePath) + animator.tilesets[toLoad];
            }

            //Store the tile sheet information
            that.__Internal__Dont__Modify__.framewidth = animator.framewidth;
            that.__Internal__Dont__Modify__.frameheight = animator.frameheight;
            that.__Internal__Dont__Modify__.columns = animator.columns;
            that.__Internal__Dont__Modify__.imagewidth = animator.imagewidth;
            that.__Internal__Dont__Modify__.imageheight = animator.imageheight;

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////---------------------------------------Load Animation Information-------------------------------------////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Save the speed of the animator
            that.__Internal__Dont__Modify__.speed = animator.speed;

            //Save all the animations to the internal array
            that.__Internal__Dont__Modify__.animations = animator.animations;

            //Reset the named indices map
            that.__Internal__Dont__Modify__.namedIndicies = [];

            //Loop through all animations
            for (var i = 0; i < that.__Internal__Dont__Modify__.animations.length; i++) {
                //Store a reference to the current animation
                var curAnim = that.__Internal__Dont__Modify__.animations[i];

                //Check if that animations name appears in the named indicies
                if (curAnim.name in that.__Internal__Dont__Modify__.namedIndicies)
                    console.log("WARNING: " + curAnim.name + " already exists in the Animation Controller. Using that as an identifier may not get the Animation desired");

                //Add the index to the named indicies map
                that.__Internal__Dont__Modify__.namedIndicies[curAnim.name] = i;

                //Convert the FPS value into a timer value
                curAnim.fps = 1 / curAnim.fps;

                //Loop through and process all frame IDs
                for (var k = 0; k < curAnim.frames.length; k++) {
                    //Store the ID of the frame
                    var frameID = curAnim.frames[k];

                    //Set the frame source information
                    curAnim.frames[k] = {
                        w: that.__Internal__Dont__Modify__.framewidth,
                        h: that.__Internal__Dont__Modify__.frameheight,
                        x: (frameID % that.__Internal__Dont__Modify__.columns) * that.__Internal__Dont__Modify__.framewidth,
                        y: Math.floor(frameID / that.__Internal__Dont__Modify__.columns) * that.__Internal__Dont__Modify__.frameheight,
                    };
                }
            }

            //Reset the animation progress values
            that.__Internal__Dont__Modify__.currentAnimation =
                that.__Internal__Dont__Modify__.currentFrame =
                that.__Internal__Dont__Modify__.elapsedTime = 0;

            //Flag that animation controller as loaded
            that.__Internal__Dont__Modify__.loaded = true;
        };

        //Open the connection request
        httpReq.open("GET", pFilePath, true);

        //Send the request
        httpReq.send();

        //Return itself
        return this;
    },

    /*
        AnimationController : update - Update the Animation Controller values
        25/11/2016

        @param[in] pDelta - The delta time for the current cycle
    */
    update: function(pDelta) {
        //If playback is halted for any reason, exit the function
        if (!this.__Internal__Dont__Modify__.loaded ||
            this.__Internal__Dont__Modify__.currentAnimation < 0 ||
            this.__Internal__Dont__Modify__.speed === 0 ||
            this.__Internal__Dont__Modify__.paused)
            return;

        //Add the delta time to the elapsed time
        this.__Internal__Dont__Modify__.elapsedTime += pDelta;

        //Get the current animation 
        var curAnim = this.__Internal__Dont__Modify__.animations[this.__Internal__Dont__Modify__.currentAnimation];

        //Claculate the time per frame for the current animation
        var timePerFrame = curAnim.fps / curAnim.speed / this.__Internal__Dont__Modify__.speed;

        //Loop until the elapsed time is used up
        while (this.__Internal__Dont__Modify__.elapsedTime >= timePerFrame) {
            //Advance the current frame by 1
            this.__Internal__Dont__Modify__.currentFrame = (this.__Internal__Dont__Modify__.currentFrame + 1) % curAnim.frames.length;

            //Subtract the time per frame from the timer
            this.__Internal__Dont__Modify__.elapsedTime -= timePerFrame;
        }
    },
});