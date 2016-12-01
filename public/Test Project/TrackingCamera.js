/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: TrackingCamera
 *      Author: Mitchell Croft
 *      Date: 01/12/2016
 *
 *      Requires:
 *      Camera.js, Entity.js, ExtendProperties.js
 *
 *      Purpose:
 *      Provide a simple camera which will follow a single 
 *      Entity object
 **/

/*
    TrackingCamera : Constructor - Initialise with default values
    01/12/2016

    @param[in] pCanvas - The canvas object to use for scaling the camera view
    @param[in] pViewWidth - The width of the cameras view (World Units)
    @param[in] pViewHeight - The height of the cameras view (World Units)
    @param[in] pDistance - Scales the drawn elements to give the appearance
                           of distance. 1 is regular. Must be greater than 0.
                           (Default 1) 
    @param[in] pTarget - The Entity object for the Camera to follow (Default null)
*/
function TrackingCamera(pCanvas, pViewWidth, pViewHeight, pDistance, pTarget) {
    /*  WARNING:
        Don't modify this internal object from the outside of the TrackingCamera.
        Instead use TrackingCamera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Store the camera to use
        camera: new Camera(pCanvas, pViewWidth, pViewHeight, pDistance),

        //Store the target of the TrackingCamera 
        target: (pTarget instanceof Entity ? pTarget : null),

        //Store the speed with which the camera moves
        moveSpeed: 0,

        //Store the maximum distance from the target the Camera can be before moving at full speed
        maxDistance: 0,
    };
};

ExtendProperties(TrackingCamera, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        TrackingCamera : camera - Get the Camera that this object contains
        01/12/2016

        @return Camera - Returns a Camera object
    */
    get camera() {
        return this.__Internal__Dont__Modify__.camera;
    },

    /*
        TrackingCamera : target - Get the target of the TrackingCamera
        01/12/2016

        @return Entity - Returns an Entity object or null if no target
    */
    get target() {
        return this.__Internal__Dont__Modify__.target;
    },

    /*
        TrackingCamera : target - Set the Entity that is the target of the current Camera
        01/12/2016

        @param[in] pTarget - An Entity object or null to remove the target
    */
    set target(pTarget) {
        //Check for null
        if (pTarget == null) {
            this.__Internal__Dont__Modify__.target = null;
            return;
        }

        //Check the type
        if (!pTarget instanceof Entity)
            throw new Error("Can not set the Tracking Camera's target to " + pTarget + " (Type: '" + typeof pTarget + "') Please use an Entity object");

        //Set the target
        this.__Internal__Dont__Modify__.target = pTarget;
    },

    /*
        TrackingCamera : moveSpeed - Get the current move speed of the Tracking Camera
        01/12/2016

        @return number - Returns the movement speed as a number
    */
    get moveSpeed() {
        return this.__Internal__Dont__Modify__.moveSpeed;
    },

    /*
        TrackingCamera : moveSpeed - Set the current move speed of the Tracking Camera
        01/12/2016

        @param[in] pVal - A number containing the new movement speed
    */
    set moveSpeed(pVal) {
        //Check the type
        if (typeof pVal !== "number")
            throw new Error("Can not set the Tracking Camera's move speed to " + pVal + " (Type: '" + typeof pVal + "') Please use a number");

        //Set the speed
        this.__Internal__Dont__Modify__.moveSpeed = pVal;
    },

    /*
        TrackingCamera : maxDistance - Get the maximum distance the Tracking Camera can
                                       be away from the target before moving at top speed
        01/12/2016

        @return number - Returns the max distance as a number
    */
    get maxDistance() {
        return this.__Internal__Dont__Modify__.maxDistance;
    },

    /*
        TrackingCamera : maxDistance - Set the maximum distance the Tracking Camera can
                                       be away from the target before moving at top speed
        01/12/2016

        @param[in] pVal - A number containing the new max distance
    */
    set maxDistance(pVal) {
        //Check the type
        if (typeof pVal !== "number")
            throw new Error("Can not set the Tracking Camera's max distance to " + pVal + " (Type: '" + typeof pVal + "') Please use a number");

        //Set the distance
        this.__Internal__Dont__Modify__.maxDistance = pVal;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        TrackingCamera : update - Update the position of the TrackingCamera
        01/12/2016

        @param[in] pDelta - The delta time for the current cycle
    */
    update: function(pDelta) {
        //Check there is a target
        if (!this.__Internal__Dont__Modify__.target) return;

        //Get the vector to the player
        var camSeperationVec = this.__Internal__Dont__Modify__.target.position.subtract(this.__Internal__Dont__Modify__.camera.position);

        //Get the cameras distance scale
        var moveScale = Math.clamp01(camSeperationVec.mag / this.__Internal__Dont__Modify__.maxDistance);

        //Move the camera towards the players position
        this.__Internal__Dont__Modify__.camera.position = this.__Internal__Dont__Modify__.camera.position.addSet(camSeperationVec.normalize().multi(this.__Internal__Dont__Modify__.moveSpeed * moveScale * pDelta));
    },
});