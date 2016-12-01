/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: EntityController
 *      Author: Mitchell Croft
 *      Date: 01/12/2016
 *
 *      Requires: 
 *      Entity.js, ExtendProperties.js
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Provide a base object for handling the movement of an 
 *      Entity object
 **/

/*
    EntityController : Constructor - Initialise with default values
    01/12/2016

    @param[in] pEntity - A reference to the Entity object to control
    @param[in] pControl - A function that takes in delta time and move the
                          internal Entity through the use of this.entity
*/
function EntityController(pEntity, pControl) {
    /*  WARNING:
        Don't modify this internal object from the outside of the EntityController.
        Instead use Entity properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //Store a reference to the Entity that is being controlled 
        entity: (pEntity instanceof Entity ? pEntity : null),

        //Store a reference to the function that is being used to calculate movement
        control: (typeof pControl === "function" ? pControl : null),
    };
};

ExtendProperties(EntityController, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        EntityController : entity - Get the Entity that is being managed by this controller
        01/12/2016

        @return Entity - Returns an Entity object or null if none is set
    */
    get entity() {
        return this.__Internal__Dont__Modify__.entity;
    },

    /*
        EntityContoller : entity - Set the Entity object that is being controlled by this controller
        01/12/2016

        @param[in] pObj - An Entity object to be controlled or null to remove
    */
    set entity(pObj) {
        //Check for null
        if (pObj == null) {
            this.__Internal__Dont__Modify__.entity = null;
            return;
        }

        //Check the type
        if (!pObj instanceof Entity)
            throw new Error("Can not set the Entity Controllers Entity to " + pObj + " (Type: '" + typeof pObj + "') Please use a Entity object or null to remove");

        //Set the value
        this.__Internal__Dont__Modify__.entity = pObj;
    },

    /*
        EntityController : controlFunc - Set the control function used by this Entity Controller
        01/12/2016

        @param[in] pFunc - A function that takes in the delta time for the cycle 
    */
    set controlFunc(pFunc) {
        //Check the type
        if (typeof pFunc !== "function")
            throw new Error("Can not set the Entity Controllers control function to " + pFunc + " (Type: '" + typeof pFunc + "') Please use a function that takes in delta time as a parameter and returns a Vec2 object containing the displacement to apply to the Entity");

        //Set the control function
        this.__Internal__Dont__Modify__.control = pFunc.bind(this);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        EntityController : update - Update the currently controlled Entity
        01/12/2016

        @param[in] pDelta - The delta time for the current cycle
    */
    update: function(pDelta) {
        //Check there is an Entity
        if (!this.__Internal__Dont__Modify__.entity) return;

        //Check if a control function has been set
        if (this.__Internal__Dont__Modify__.control)
            this.__Internal__Dont__Modify__.control(pDelta);

        //Update the internal Entity
        this.__Internal__Dont__Modify__.entity.update(pDelta);
    },

    /*
        EntityController : draw - Pass render parameters onto the internal Entity for drawing
        01/12/2016

        @param[in] pCtx - The context of the canvas to render to
    */
    draw: function(pCtx) {
        //Check there is an internal entity
        if (this.__Internal__Dont__Modify__.entity)
            this.__Internal__Dont__Modify__.entity.draw(pCtx);
    },
});