/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Entity
 *      Author: Mitchell Croft
 *      Date: 30/11/2016
 *
 *      Requires:
 *      Vec2.js, AnimationController.js, ExtendProperties.js
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Provide a base point for a game Entity within a
 *      world
 **/

/*
    Entity : Constructor - Initialise with default values
    30/11/2016
*/
function Entity() {
    /*  WARNING:
        Don't modify this internal object from the outside of the Entity.
        Instead use camera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Flag if the entity is alive or dead
        alive: true,

        //Store an animator for the entity
        animator: new AnimationController(),

        //Store the position of the entity within the world
        position: new Vec2(),

        //Store the dimensions of the Entity
        width: 0,
        height: 0,

        //Store offset values in order to update the animator
        movementOffset: new Vec2(),
    }
};

ExtendProperties(Entity, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Entity : alive - Get the alive flag of the current Entity
        30/11/2016

        @return bool - Returns true if the Entity is still alive
    */
    get alive() {
        return this.__Internal__Dont__Modify__.alive;
    },

    /*
        Entity : alive - Set the laive flag of the current Entity
        30/11/2016

        @param[in] pState - A bool representing the new alive state of the Entity
    */
    set alive(pState) {
        //Check the type
        if (typeof pState === "boolean")
            throw new Error("Can not set the Entity alive flag to " + pState + " (Type: '" + typeof pState + "') Please use a boolean value");

        //Set the Entity alive flag
        this.__Internal__Dont__Modify__.alive = pState;
    },

    /*
        Entity : animator - Get the animator associated with the Entity
        30/11/2016

        @return AnimationController - Returns an AnimationController object
    */
    get animator() {
        return this.__Internal__Dont__Modify__.animator;
    },

    /*
        Entity : position - Get the position of the current Entity
        30/11/2016

        @return Vec2 - Returns a Vec2 object holding the world position
    */
    get position() {
        return new Vec2(this.__Internal__Dont__Modify__.position);
    },

    /*
        Entity : position - Set the position of the current Entity. This is used in instances
                            of teleporation, for walking use the Entity.move function
        30/11/2016

        @param[in] pPos - A Vec2 object holding the new position for the Entity
    */
    set position(pPos) {
        //Check the type
        if (!pPos instanceof Vec2)
            throw new Error("Can not set the position of the Entity to " + pPos + " (Type: '" + typeof pPos + "') Please use a Vec2 object");

        //Set the position
        this.__Internal__Dont__Modify__.position.set(pPos);
    },

    /*
        Entity : x - Get the X position of the Entity (Calculated by subtracting -width / 2 from the position)
        30/11/2016

        @return number - Returns a number holding the X position of the Entity
    */
    get x() {
        return this.__Internal__Dont__Modify__.position.x - (this.__Internal__Dont__Modify__.width / 2);
    },

    /*
        Entity : y - Get the Y position of the Entity (Calculated by subtracting -height / 2 from the position)
        30/11/2016

        @return number - Returns a number holding the Y position of the Entity
    */
    get y() {
        return this.__Internal__Dont__Modify__.position.y - (this.__Internal__Dont__Modify__.height / 2);
    },

    /*
        Entity : width - Get the width of the current Entity
        30/11/2016

        @return number - Returns the width of the Entity as a number
    */
    get width() {
        return this.__Internal__Dont__Modify__.width;
    },

    /*
        Entity : width - Set the width of the current Entity
        30/11/2016

        @param[in] pDim - A number holding the new value of the Entities width (Must >= 0)
    */
    set width(pDim) {
        //Check the type
        if (typeof pDim !== "number")
            throw new Error("Can not set the Entity width to " + pDim + " (Type: '" + typeof pDim + "') Please use a number >= 0");

        //Set the width
        this.__Internal__Dont__Modify__.width = Math.max(0, pDim);
    },

    /*
        Entity : height - Get the height of the current Entity
        30/11/2016

        @return number - Returns the height of the Entity as a number
    */
    get height() {
        return this.__Internal__Dont__Modify__.height;
    },

    /*
        Entity : height - set the height of the current Entity
        30/11/2016

        @param[in] pDim - A number holding the new value of the Entities height (Must be >= 0)
    */
    set height(pDim) {
        //Check the type
        if (typeof pDim !== "number")
            throw new Error("Can not set the Entity height to " + pDim + " (Type: '" + typeof pDim + "') Please use a number >= 0");

        //Set the height
        this.__Internal__Dont__Modify__.height = Math.max(0, pDim);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Entity : move - Move the Entity by an offset
        30/11/2016

        @param[in] pDisp - A Vec2 object containing the displacement to apply
    */
    move: function(pDisp) {
        //Check the type
        if (!pDisp instanceof Vec2)
            throw new Error("Can not move the player by " + pDisp + " (Type: '" + typeof pDisp + "') Please use a Vec2 object");

        //Move the players current position
        this.__Internal__Dont__Modify__.position.addSet(pDisp);

        //Add the movement value to the movement offset store
        this.__Internal__Dont__Modify__.movementOffset.addSet(pDisp);
    },

    /*
        Entity : update - Update the internal values of the Entity
        30/11/2016

        @param[in] pDelta - The delta time for the current cycle
    */
    update: function(pDelta) {
        //Check if the Animation Controller has loaded
        if (this.__Internal__Dont__Modify__.animator.loaded) {
            //Update current animation based on the movement offset values
            this.__Internal__Dont__Modify__.animator.paused = !this.__Internal__Dont__Modify__.movementOffset.sqrMag;
            if (this.__Internal__Dont__Modify__.movementOffset.x) this.__Internal__Dont__Modify__.animator.currentAnimation = "Walk " + (this.__Internal__Dont__Modify__.movementOffset.x < 0 ? "Left" : "Right");
            else if (this.__Internal__Dont__Modify__.movementOffset.y) this.__Internal__Dont__Modify__.animator.currentAnimation = "Walk " + (this.__Internal__Dont__Modify__.movementOffset.y < 0 ? "Up" : "Down");

            //Update the internal animator
            this.__Internal__Dont__Modify__.animator.update(pDelta);
        }

        //Reset the movement offset
        this.__Internal__Dont__Modify__.movementOffset.reset();
    },

    /*
        Entity : draw - Render the current animator frame to a passed in context
        30/11/2016

        @param[in] pCtx - The context of the canvas to render to
    */
    draw: function(pCtx) {
        //Ensure the animator has loaded
        if (!this.__Internal__Dont__Modify__.animator.loaded) return;

        //Get the animator image/frame
        var aniFrame = this.__Internal__Dont__Modify__.animator.drawFrame;

        //Render the frame to the context
        pCtx.drawImage(aniFrame.image,
            aniFrame.x, aniFrame.y, aniFrame.w, aniFrame.h, this.x, this.y, this.width, this.height);
    },
});