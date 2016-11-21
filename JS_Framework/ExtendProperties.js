/*
 *      Name: ExtendProperties
 *      Author: Mitchell Croft
 *      Date: 27/09/2016
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Add additional functionality to an objects
 *      prototype without overwriting pre-existing 
 *      prototype information
 **/

/*
    ExtendProperties - Add the properties contained within pCollection to the 
                       prototype of pObj
    27/09/2016

    @param[in/out] pObj - The object type to add the properties to
    @param[in] pCollection - An object containing the properties to include
                             in pObj

    Example:

    //Add a random direction property to Vec2 
    ExtendProperties(Vec2, {
        get random() {
            return new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        },
    });
*/
function ExtendProperties(pObj, pCollection) {
    //Store the descriptor of the property extracted from the collection
    var description;

    //Loop through all the properties inside the collection
    for (var prop in pCollection) {
        //Get the property descriptor for the prop
        description = Object.getOwnPropertyDescriptor(pCollection, prop);

        //Apply property if not undefined
        if (typeof description !== "undefined")
            Object.defineProperty(pObj.prototype, prop, description);
    }
};