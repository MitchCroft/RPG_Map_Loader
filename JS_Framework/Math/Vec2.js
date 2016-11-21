/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Vec2
 *      Author: Mitchell
 *      Date: 28/07/2016
 *
 *      Requires:
 *      ExtendProperties.js
 *
 *      Version: 2.0
 *      Added property values to improve usability
 *
 *      Purpose:
 *      Store 2D positional and directional information as well
 *      as provide functionality to enable positional vector math in
 *      a 2D environment.
 **/

/*
    Vec2 : Constructor - Initialise a Vec2 object with starting values
    28/07/2016

    @param[in] pFirst - Either a Vec2 object to copy the values of, a number
                        to be assigned to the X axis or undefined
    @param[in] pSecond - Either a number to be assigned to the Y axis or
                         undefined

    Example:

    //Store the players position
    var playerPosition = new Vec2(respawnPosition);     //Result - x = respawnPosition.x
    OR                                                             y = respawnPosition.y
    var playerPosition = new Vec2(10, 15);              //Result - x = 10, y = 15
    OR 
    var playerPosition = new Vec2(10);                  //Result - x = 10, y = 10
    OR 
    var playerPosition = new Vec2();                    //Result - x = 0, y = 0
*/
function Vec2(pFirst, pY) {
    //Find the axis' values
    switch (typeof pFirst) {
        case "number":
            this.x = pFirst;
            this.y = (typeof pY === "number" ? pY : pFirst);
            break;
        case "object":
            if (pFirst instanceof Vec2) {
                this.x = pFirst.x;
                this.y = pFirst.y;
                break;
            }
        default:
            this.x = 0;
            this.y = 0;
            break;
    }
};

ExtendProperties(Vec2, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Vec2 : clone - Create a copy of the Vec2 object
        28/07/2016

        @return Vec2 - Returns a new Vec2 object with the same values as the current

        Example:

        //Create a bullet at the player
        var bulletPos = playerPosition.clone;
    */
    get clone() {
        return new Vec2(this.x, this.y);
    },

    /*
        Vec2 : mag - Returns the magnitude/length of the Vec2 object
        28/07/2016

        @return number - Returns the magnitude/length as a single number

        Example:

        //Get the players speed
        var playerSpeed = playerVelocity.mag;
    */
    get mag() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    /*
        Vec2 : sqrMag - Returns the square magnitude/length of the Vec2 object
        28/07/2016

        @return number - Returns the magnitude/length as a single number

        Example:

        //Get the players speed squared
        var playerSpeedSq = playerVelocity.sqrMag;
    */
    get sqrMag() {
        return ((this.x * this.x) + (this.y * this.y));
    },

    /*
        Vec2 : normalized - Returns the normal of the Vec2 object without modifying it
        28/07/2016

        @return Vec2 - Returns a Vec2 object holding the normal of the current Vec2 object

        Example:

        //Get the players current direction
        var playerDirection = playerVelocity.normalized;
    */
    get normalized() {
        return new Vec2(this.x, this.y).normalize();
    },

    /*
        Vec2 : negative - Returns the negative of the current Vec2 object
        28/07/2016

        @return Vec2 - Returns a new Vec2 object that is the negative of the current Vec2 object

        Example:

        //Fire bullet in opposite direction of the player
        var bulletDirection = playerDirection.negative;
    */
    get negative() {
        return new Vec2(-this.x, -this.y);
    },

    /*
        Vec2 : right - Returns the vector perpendicular to the current in the clockwise direction
        28/07/2016

        @return Vec2 - Returns a new Vec2 object that holds the perpendicular values

        Example:

        //Get the direction to the right of the player
        var right = playerDirection.right;
    */
    get right() {
        return new Vec2(-this.y, this.x);
    },

    /*
        Vec2 : left - Returns the vector perpendicular to the current in the anti-clockwise direction
        28/07/2016

        @return Vec2 - Returns a new Vec2 object that holds the perpendicular values

        Example:

        //Get the direction to the left of the player
        var left = playerDirection.left;
    */
    get left() {
        return new Vec2(this.y, -this.x);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                                   Main Functions                                           ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Vec2 : reset - Reset the Vec2 object to zero on both axis
        28/07/2016

        @return this - Returns itself once the function has ended

        Example:

        //Stop the player moving
        playerVelocity.reset();
    */
    reset: function() {
        //Reset axis' values
        this.x = this.y = 0;

        //Return itself
        return this;
    },

    /*
        Vec2 : normalize - Normalizes the axis of the Vec2 object to give a magnitude of 1 (Or 0 if both axis' are 0)
        28/07/2016

        @return this - Returns itself once the function ended

        Example:

        //Get a random direction
        var randDir = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1);
        randDir.normalize();
    */
    normalize: function() {
        //Get the square magnitude of the axis'
        var mag = ((this.x * this.x) + (this.y * this.y));

        //Ensure there is a magnitude
        if (mag) {
            //Get the square of the magnitude
            mag = Math.sqrt(mag);

            //Normalize the axis'
            this.x /= mag;
            this.y /= mag;
        }

        //Return itself
        return this;
    },

    /*
        Vec2 : dot - Returns the dot product between 2 Vec2 objects (The current and the passed in object)
        28/07/2016

        @param[in] pVec - The Vec2 object to get the dot product between

        @return number - Returns the dot product as a single number

        Example:

        //Check if the player is moving with the wind
        var windDirection = new Vec2(1, 0);

        if (playerDirection.dot(windDirection) >= 0.5) {
            //TODO: Make the player move faster
        }
    */
    dot: function(pVec) {
        return ((this.x * pVec.x) + (this.y * pVec.y));
    },

    /*
        Vec2 : rotate - Rotate the current Vec2 object by the passed in amount of radians
        28/06/2016

        @param[in] pRot - The amount of radians to rotate the vector by

        @return this - Returns itself once the function has ended

        Example:

        //Turn the player
        playerDirection.rotate(Math.PI);    //Rotates the player direction by 180 degrees clockwise
    */
    rotate: function(pRot) {
        //Get the sin and cos values
        var sin = Math.sin(pRot);
        var cos = Math.cos(pRot);

        //Get the rotated values
        var xRot = (this.x * cos) - (this.y * sin);
        var yRot = (this.x * sin) + (this.y * cos);

        //Set the new axis values
        this.x = xRot;
        this.y = yRot;

        //Return itself
        return this;
    },

    /*
        Vec2 : rotated - Return a copy of the current Vec2 object rotatated by the passed in amount of radians
        26/10/2016

        @param[in] pRot - The amount of radians to rotate the vector by

        @return Vec2 - Returns a Vec2 object contianing the result of the rotation

        Example:

        //Get the direction 90 degrees to the right of the player
        var perpendicular = playerDirection.rotated(Math.PI / 2); //Gets the rotation of the player direction by 90 degrees clockwise
    */
    rotated: function(pRot) {
        //Get the sin and cos values
        var sin = Math.sin(pRot);
        var cos = Math.cos(pRot);

        //Get the rotated values
        var xRot = (this.x * cos) - (this.y * sin);
        var yRot = (this.x * sin) + (this.y * cos);

        //Return the rotated values
        return new Vec2(xRot, yRot);
    },

    /*
        Vec2 : lerp - Linearly interpolates between the current Vec2 object and a passed in Vec2 object
                      by the scale of pT
        28/07/2016

        @param[in] pVec - The second Vec2 object which is used as the end point (Returned when pT is 1)
        @param[in] pT - The scale with which to interpolate between the two Vec2 objects (Number between 0 - 1)

        @return Vec2 - Returns a new Vec2 object that interpolated between the current and pVec by pT

        Example:

        //Get the halfway point between the player and an obstacle
        var halfway = playerPosition.lerp(obstaclePosition, 0.5);
    */
    lerp: function(pVec, pT) {
        return new Vec2(this.x + (pVec.x - this.x) * pT,
            this.y + (pVec.y - this.y) * pT);
    },

    /*
        Vec2 : toString - Get the current Vec2 object as a string
        28/07/2016

        @param[in] pDecimal - The number of decimal places to round the axis values to (Default 3)

        @return string - Returns the Vec2 object as a string

        Example:

        //Output the players position
        console.log(playerposition.toString());
    */
    toString: function(pDecimal) {
        //Clean the pDecimal value
        if (typeof pDecimal !== "number")
            pDecimal = 3;

        //Return the string 
        return "(" + this.x.toFixed(pDecimal) + ", " + this.y.toFixed(pDecimal) + ")";
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                                   Math Functions                                           ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Vec2 : set - Set the values of the current Vec2 object to that of the passed in Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to copy

        @return this - Returns itself once the function has ended

        Example:

        //Move the bullet to the players position
        bulletPosition.set(playerPosition);
    */
    set: function(pVec) {
        //Copy the axis values over
        this.x = pVec.x;
        this.y = pVec.y;

        //Return itself
        return this;
    },

    /*
        Vec2 : equal - Determines if the passed in the Vec2 object is equivelant to the current Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to check against

        @return bool - Returns true if the two Vec2 objects are equivelant

        Example:

        //Check if player coord is selected
        if (selectedCoord.equal(playerCoord)) {
            //TODO: Do stuff (E.g. Select player)
        }
    */
    equal: function(pVec) {
        return (this.x === pVec.x && this.y === pVec.y);
    },

    /*
        Vec2 : notEqual - Determines if the passed in Vec2 object is different to the current Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to check against 

        @return bool - Returns true if the two Vec2 objects are different

        Example:

        //Check if the player is moving in the correct direction
        if (playerDirection.notEqual(playerVelocity.normalized)) {
            //TODO: Change velocity towards direction
        }
    */
    notEqual: function(pVec) {
        return (this.x !== pVec.x || this.y !== pVec.y);
    },

    /*
        Vec2 : less - Determines if the current Vec2 object has less magnitude/length then the passed
                      in Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to compare against

        @return bool - Returns true if the current vec2 object has less magnitude/length then the passed
                       in Vec2 object

        Example:

        //Determine which player is fastest
        if (playerOneVelocity.less(playerTwoVelocity)) {
            //TODO: Print player two faster
        }
    */
    less: function(pVec) {
        return (this.sqrMag < pVec.sqrMag);
    },

    /*
        Vec2 : lessEqual - Determines if the current Vec2 object has less than or equal magnitude/length
                           then the passed in Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to compare against

        @return bool - Returns true if the current Vec2 object has less then or equal magnitude/length
                       then the passed in Vec2 object

        Example:
        
        //Determine which player is fastest
        if (playerOneVelocity.lessEqual(playerTwoVelocity)) {
            //TODO: Print player one is not faster then player two
        }
    */
    lessEqual: function(pVec) {
        return (this.sqrMag <= pVec.sqrMag);
    },

    /*
        Vec2 : greater - Determines if the current Vec2 object has a greater magnitude/length then the passed
                         in Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to compare against

        @return bool - Returns true if the current Vec2 object has a greater magnitude/length then the 
                       passed in Vec2 object

        Example:

        //Determine which player is fastest
        if (playerOneVelocity.greater(playerTwoVelocity)) {
            //TODO: Print player one faster
        }
    */
    greater: function(pVec) {
        return (this.sqrMag > pVec.sqrMag);
    },

    /*
        Vec2 : greaterEqual - Determines if the current Vec2 object has a greater then or equal magnitude/length
                              then the passed in Vec2 object
        28/07/2016

        @param[in] pVec - The Vec2 object to compare against

        @return bool - Returns true if the current Vec2 object has a greater then or equal magnitude/length
                       then the passed in Vec2 object

        Example:

        //Determine which player is fastest
        if (playerTwoVelocity.greaterEqual(playerOneVelocity)) {
            //TODO: Print player two is not faster then player one
        }
    */
    greaterEqual: function(pVec) {
        return (this.sqrMag >= pVec.sqrMag);
    },

    /*
        Vec2 : add - Get the result of adding a Vec2 object to the current
        28/07/2016

        @param[in]  pVec - The Vec2 object to add to the current

        @return Vec2 - Returns a Vec2 object holding the result of the addition

        Example:

        //Get the position ahead of the player
        var playerAhead = playerPosition.add(playerVelocity);
    */
    add: function(pVec) {
        return new Vec2(this.x + pVec.x, this.y + pVec.y);
    },

    /*
        Vec2 : addSet - Add the values of antoher Vec2 object to the current
        28/07/2016

        @param[in] pVec - The Vec2 object to add to the current

        @return this - Returns itself once the function has ended

        Example:

        //Move the players position by velocity
        playerPosition.addSet(playerVelocity);
    */
    addSet: function(pVec) {
        //Add the axis values
        this.x += pVec.x;
        this.y += pVec.y;

        //Return itself
        return this;
    },

    /*
        Vec2 : subtract - Get the result of subtracting a Vec2 object from the current
        28/07/2016

        @param[in] pVec - The Vec2 object to subtract from the current

        @return Vec2 - Returns a Vec2 object holding the result of the subtraction

        Example:

        //Get distance to the enemy
        var distance = enemyPosition.subtract(playerPosition);
    */
    subtract: function(pVec) {
        return new Vec2(this.x - pVec.x, this.y - pVec.y);
    },

    /*
        Vec2 : subtractSet - Subtract the values of another Vec2 object from the current
        18/07/2016

        @param[in] pVec - The Vec2 object to subtract from the current

        @return this - Returns itself once the function has ended

        Example:

        //Subtract wind velocity from the players velocity
        playerVelocity.subtractSet(windVelocity);
    */
    subtractSet: function(pVec) {
        //Subtract the axis values
        this.x -= pVec.x;
        this.y -= pVec.y;

        //Return itself
        return this;
    },

    /*
        Vec2 : multi - Get the result of multiplying the current Vec2 object by a number
        28/07/2016

        @param[in] pSclr - The number value to multiply the current by

        @return Vec2 - returns a Vec2 object holding the result of the multiplication

        Example:

        //Get the furthest position the player can move to
        var furthest = playerPosition.add(playerDirection.multi(PLAYER_MAX_SPEED));
    */
    multi: function(pSclr) {
        return new Vec2(this.x * pSclr, this.y * pSclr);
    },

    /*
        Vec2 : multiSet - Multiply the current Vec2 object by a number
        28/07/2016

        @param[in] pSclr - The number value to multiply the current by

        @return this - Returns itself once the function has ended

        Example:

        //Apply a speed boost
        if (Check if boost key is pressed)
        playerVelocity.multiSet(2);
    */
    multiSet: function(pSclr) {
        //Multiply the axis values
        this.x *= pSclr;
        this.y *= pSclr;

        //Return itself
        return this;
    },

    /*
        Vec2 : div - Get the result of dividing the current Vec2 object by a number
        28/07/2016

        @param[in] pSclr - The number to divide the current by

        @return Vec2 - Returns a Vec2 object holding the result of the division

        Example:

        //Check the position the player would move to if moving at half speed
        var hlafPos = playerPosition.add(playerVelocity.div(2));
    */
    div: function(pSclr) {
        return new Vec2(this.x / pSclr, this.y / pSclr);
    },

    /*
        Vec2 : divSet - Divide the current Vec2 object by a number
        28/07/2016

        @param[in] pSclr - The number to divide the current by

        @return this - Returns itself once the function has ended

        Example:

        //Slow down the player due to environmental hazard
        if (Player is hazerdous area) 
            playerVelocity.divSet(2);
    */
    divSet: function(pSclr) {
        //Divide the axis values
        this.x /= pSclr;
        this.y /= pSclr;

        //Return itself
        return this;
    },
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                  General Functions                                         ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
    vec2Lerp - Returns a Vec2 object which has been linearly interpolated between pStar and pEnd points
               by pT
    28/07/2016

    @param[in] pStart - The starting point of the interpolation (pT of 0 returns this)
    @param[in] pEnd - The end point of the interpolation (pT of 1 returns this)
    @param[in] pT - The scale with which to interpolate the two Vec2 objects (Between 0 - 1)

    @return Vec2 - Returns the interpolated values as a new Vec2 object

    Example:

    //Get the halfway point between the player and an obstacle
    var hlafwayPosition = vec2Lerp(playerPosition, obstaclePosition, 0.5);
*/
function vec2Lerp(pStart, pEnd, pT) {
    return new Vec2(pStart.x + (pEnd.x - pStart.x) * pT,
        pStart.y + (pEnd.y - pStart.y) * pT);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                               Helper Functions                                             ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
    cleanRotation - Given any degree rotation bring it back to the 0 - 359 range
    30/08/2016

    @param[in] pRot - The rotation value to clean

    @return number - Returns the value of pRot bound to 0 - 359

    Example:

    //Get a random rotation
    var randRot = cleanRotation(Math.random() * 2000);
*/
function cleanRotation(pRot) {
    //If the rotation value is into the negatives 
    if (pRot < 0) return (360 + pRot % 360);

    //Otherwise simple modulus calculation
    else return pRot % 360;
};