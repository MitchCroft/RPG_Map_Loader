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

/*
 *      Name: Math Extensions
 *      Author: Mitchell Croft
 *      Date: 23/11/2016
 *
 *      Version: 1.0
 *
 *      Purpose:
 *      Add additional functionality to the Math object
 **/

//Add angle conversion values
Math.rad2Deg = 180 / Math.PI;
Math.deg2Rad = Math.PI / 180;

/*
    Math : clamp - Clamps a specified value between a defined min and max
    24/11/2016

    @param[in] pVal - The value to be clamped
    @param[in] pMin - The minimum value that can be returned
    @param[in] pMax - The maximum value that can be returned

    @return number - Returns the value between the two points
*/
Math.clamp = function(pVal, pMin, pMax) {
    return (pVal < pMin ? pMin : (pVal > pMax ? pMax : pVal));
};

/*
    Math : clamp01 - Clamps a specified value between 0 and 1
    24/11/2016

    @param[in] pVal - The value to be clamped 

    @return number - Returns the value clamped between 0 and 1
*/
Math.clamp01 = function(pVal) {
    return (pVal < 0 ? 0 : (pVal > 1 ? 1 : pVal));
};

/*
    Math : lerp - Linearly interpolate between two numbers
    24/11/2016

    @param[in] pStart - The starting value to interpolate from
    @param[in] pEnd - The ending value to interpolate to
    @param[in] pT - The scale to indicate the progress between the points

    @return number - Returns the interpolated value 
*/
Math.lerp = function(pStart, pEnd, pT) {
    return (pStart + (pEnd - pStart) * pT);
};

/*
    Math : lerpClamped - Linearly interpolate between numbers, clamping the scale between 0 and 1
    24/11/2016

    @param[in] pStart - The starting value to interpolate from
    @param[in] pEnd - The ending value to interpolate to
    @param[in] pT - The scale to indicate the progress between the points

    @return number - Returns the interpolated value between the two points
*/
Math.lerpClamped = function(pStart, pEnd, pT) {
    //Clamp the scale between 0 and 1
    pT = Math.clamp01(pT);

    //Return the interpolation
    return (pStart + (pEnd - pStart) * pT);
};

/*
    Math : randomRange - Returns a random number between a defined range
    24/11/2016

    @param[in] pMin - The minimum value of the range (inclusive)
    @param[in] pMax - The maximum value of the range (exclusive)

    @return number - Returns a random number between the defined range
*/
Math.randomRange = function(pMin, pMax) {
    return (Math.random() * (pMax - pMin) + pMin);
};