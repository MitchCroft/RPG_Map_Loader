/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Mat3
 *      Author: Mitchell Croft
 *      Date: 28/07/2016
 *
 *      Requires:
 *      Vec2.js, ExtendProperties.js
 *
 *      Version: 2.0        
 *      Added properties as well as additional functionality (Inverse)
 *      
 *      Purpose:
 *      Provide methods for rendering 2D sprites in a hierarchal manner. Matrix is coloumn major
 *
 *      0,0 | 1,0 | 2,0
 *      0,1 | 1,1 | 2,1
 *      0,2 | 1,2 | 2,2
 **/

/*
    Mat3 : Constructor - Initialise the matrix as copy of another Mat3 or an identity matrix
    28/07/2016

    @param[in] pMat - The Mat3 object to copy (Default undefined)

    Example:

    //Create an identity matrix
    var identity = new Mat3();

    OR

    //Create a copy of a matrix
    var copyMat = new Mat3(matrix);
*/
function Mat3(pMat) {
    //Check if a matrix was supplied to copy
    if (pMat instanceof Mat3) {
        this.data = [
            [pMat.data[0][0], pMat.data[0][1], pMat.data[0][2]],
            [pMat.data[1][0], pMat.data[1][1], pMat.data[1][2]],
            [pMat.data[2][0], pMat.data[2][1], pMat.data[2][2]]
        ];
    }

    //Setup as an identity matrix
    else {
        this.data = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
    }
};

ExtendProperties(Mat3, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Mat3 : clone - Create a copy of the current Mat3 object
        28/07/2016

        @return Mat3 - Returns a new Mat3 object with the values of the current

        Example:

        //Create a copy of the values
        var copyMat = myMat3.clone;
    */
    get clone() {
        return new Mat3(this);
    },

    /*
        Mat3 : transposed - Returns a copy of the current Mat3 object transposed
        28/07/2016

        @return Mat3 - Returns a Mat3 object containing the current Mat3 object transposed

        Example:

        //Get the transpose of the current Mat3 object
        var transpose = myMat3.transposed;
    */
    get transposed() {
        //Create a new Mat3 object
        var temp = new Mat3(this);

        //Transpose the values
        temp.data[1][0] = this.data[0][1];
        temp.data[2][0] = this.data[0][2];
        temp.data[0][1] = this.data[1][0];
        temp.data[2][1] = this.data[1][2];
        temp.data[0][2] = this.data[2][0];
        temp.data[1][2] = this.data[2][1];

        //Return the transposed matrix
        return temp;
    },

    /*
        Mat3 : inversed - Returns a copy of the current Mat3 object inversed
                          http://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html
        28/07/2016

        @return Mat3 - Returns a Mat3 object containing the current Mat3 object inversed

        Example:

        //Get the inverse of the 'camera' transform
        var view = cameraTransform.inversed;
    */
    get inversed() {
        //Create the matrix of minors
        var minor = new Mat3();

        //Calculate the values
        minor.data[0][0] = this.data[1][1] * this.data[2][2] - this.data[2][1] * this.data[1][2];
        minor.data[1][0] = this.data[0][1] * this.data[2][2] - this.data[2][1] * this.data[0][2];
        minor.data[2][0] = this.data[0][1] * this.data[1][2] - this.data[1][1] * this.data[0][2];

        minor.data[0][1] = this.data[1][0] * this.data[2][2] - this.data[2][0] * this.data[1][2];
        minor.data[1][1] = this.data[0][0] * this.data[2][2] - this.data[2][0] * this.data[0][2];
        minor.data[2][1] = this.data[0][0] * this.data[1][2] - this.data[1][0] * this.data[0][2];

        minor.data[0][2] = this.data[1][0] * this.data[2][1] - this.data[2][0] * this.data[1][1];
        minor.data[1][2] = this.data[0][0] * this.data[2][1] - this.data[2][0] * this.data[0][1];
        minor.data[2][2] = this.data[0][0] * this.data[1][1] - this.data[1][0] * this.data[0][1];

        //Create the matrix of cofactors
        var cofactor = new Mat3();

        //Calculate the values
        cofactor.data[0][0] = minor.data[0][0];
        cofactor.data[1][0] = minor.data[1][0] * -1;
        cofactor.data[2][0] = minor.data[2][0];

        cofactor.data[0][1] = minor.data[0][1] * -1;
        cofactor.data[1][1] = minor.data[1][1];
        cofactor.data[2][1] = minor.data[2][1] * -1;

        cofactor.data[0][2] = minor.data[0][2];
        cofactor.data[1][2] = minor.data[1][2] * -1;
        cofactor.data[2][2] = minor.data[2][2];

        //Create the Adjugate matrix
        var adjugate = cofactor.transposed;

        //Find the detriment
        var detriment = this.data[0][0] * minor.data[0][0] -
            this.data[1][0] * minor.data[1][0] +
            this.data[2][0] * minor.data[2][0];

        //Multiply the adjugate by 1/detriment
        var invDetriment = 1 / detriment;

        adjugate.data[0][0] *= invDetriment;
        adjugate.data[1][0] *= invDetriment;
        adjugate.data[2][0] *= invDetriment;

        adjugate.data[0][1] *= invDetriment;
        adjugate.data[1][1] *= invDetriment;
        adjugate.data[2][1] *= invDetriment;

        adjugate.data[0][2] *= invDetriment;
        adjugate.data[1][2] *= invDetriment;
        adjugate.data[2][2] *= invDetriment;

        //Return the inverse
        return adjugate;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Mat3 : transpose - Transpose the current Mat3 object
        28/07/2016

        @return this - Returns itself once the function has ended

        Example:

        //Get matrix transpose
        myMat3.transpose();
    */
    transpose: function() {
        //Store the original values
        var temp = new Mat3(this);

        //Transpose the values
        this.data[1][0] = temp.data[0][1];
        this.data[2][0] = temp.data[0][2];
        this.data[0][1] = temp.data[1][0];
        this.data[2][1] = temp.data[1][2];
        this.data[0][2] = temp.data[2][0];
        this.data[1][2] = temp.data[2][1];

        //Return itself
        return this;
    },

    /*
        Mat3 : inverse - Inverse the current Mat3 object
        28/07/2016

        @return this - Returns itself once the function has ended

        Example:

        //Get the inverse of the 'camera' transform
        var view = new Mat3(camera).inverse();
    */
    inverse: function() {
        //Create the matrix of minors
        var minor = new Mat3();

        //Calculate the values
        minor.data[0][0] = this.data[1][1] * this.data[2][2] - this.data[2][1] * this.data[1][2];
        minor.data[1][0] = this.data[0][1] * this.data[2][2] - this.data[2][1] * this.data[0][2];
        minor.data[2][0] = this.data[0][1] * this.data[1][2] - this.data[1][1] * this.data[0][2];

        minor.data[0][1] = this.data[1][0] * this.data[2][2] - this.data[2][0] * this.data[1][2];
        minor.data[1][1] = this.data[0][0] * this.data[2][2] - this.data[2][0] * this.data[0][2];
        minor.data[2][1] = this.data[0][0] * this.data[1][2] - this.data[1][0] * this.data[0][2];

        minor.data[0][2] = this.data[1][0] * this.data[2][1] - this.data[2][0] * this.data[1][1];
        minor.data[1][2] = this.data[0][0] * this.data[2][1] - this.data[2][0] * this.data[0][1];
        minor.data[2][2] = this.data[0][0] * this.data[1][1] - this.data[1][0] * this.data[0][1];

        //Create the matrix of cofactors
        var cofactor = new Mat3();

        //Calculate the values
        cofactor.data[0][0] = minor.data[0][0];
        cofactor.data[1][0] = minor.data[1][0] * -1;
        cofactor.data[2][0] = minor.data[2][0];

        cofactor.data[0][1] = minor.data[0][1] * -1;
        cofactor.data[1][1] = minor.data[1][1];
        cofactor.data[2][1] = minor.data[2][1] * -1;

        cofactor.data[0][2] = minor.data[0][2];
        cofactor.data[1][2] = minor.data[1][2] * -1;
        cofactor.data[2][2] = minor.data[2][2];

        //Create the Adjugate matrix
        var adjugate = cofactor.transposed;

        //Find the detriment
        var detriment = this.data[0][0] * minor.data[0][0] -
            this.data[1][0] * minor.data[1][0] +
            this.data[2][0] * minor.data[2][0];

        //Multiply the adjugate by 1/detriment
        var invDetriment = 1 / detriment;

        this.data[0][0] = adjugate.data[0][0] * invDetriment;
        this.data[1][0] = adjugate.data[1][0] * invDetriment;
        this.data[2][0] = adjugate.data[2][0] * invDetriment;

        this.data[0][1] = adjugate.data[0][1] * invDetriment;
        this.data[1][1] = adjugate.data[1][1] * invDetriment;
        this.data[2][1] = adjugate.data[2][1] * invDetriment;

        this.data[0][2] = adjugate.data[0][2] * invDetriment;
        this.data[1][2] = adjugate.data[1][2] * invDetriment;
        this.data[2][2] = adjugate.data[2][2] * invDetriment;

        //Return itself
        return this;
    },

    /*
        Mat3 : translated - Get the copy of the current Mat3 object translated by specified values
        28/07/2016

        @param[in] pX - The value to be translated along the X axis
        @param[in] pY - The value to be translated along the Y axis

        @return Mat3 - Returns a Mat3 holding the result of the translation

        Example:
        
        //Get the world matrix after the player has moved
        var futureMat = playerMatrix.translated(velocity.x, velocity.y);
    */
    translated: function(pX, pY) {
        //Create a copy of the current Mat3
        var temp = new Mat3(this);

        //Translate the temp
        temp.data[2][0] += pX;
        temp.data[2][1] += pY;

        //Return the temp
        return temp;
    },

    /*
        Mat3 : translate - Translate the current Mat3 object by the specified values
        28/07/2016

        @param[in] pX - The value to be translated along the X axis
        @param[in] pY - The value to be translated along the Y axis

        @return this - Returns itself once the function has ended

        Example:
        
        //Move the player 
        playerMatrix.translate(velocity.x, velocity.y);
    */
    translate: function(pX, pY) {
        //Add the translation values
        this.data[2][0] += pX;
        this.data[2][1] += pY;

        //Return itself
        return this;
    },

    /*
        Mat3 : rotated - Get the copy of the current Mat3 object rotated by the specified value
        28/07/2016

        @param[in] pRot - The amount with which to rotate the Mat3 object (Number in radians)

        @return Mat3 - Returns a Mat3 holding the result of the rotation

        Example:

        //Get the world matrix after the player has turned
        var futureMat = playerMatrix.rotated(PLAYER_TURN_SPEED);
    */
    rotated: function(pRot) {
        //Create a matrix to hold the rotation
        var rotMat = new Mat3();

        //Get the sin/cos values
        var sin = Math.sin(pRot);
        var cos = Math.cos(pRot);

        //Set the rotation values
        rotMat.data[0][0] = cos;
        rotMat.data[1][0] = -sin;
        rotMat.data[0][1] = sin;
        rotMat.data[1][1] = cos;

        //Return the result of the multiplication
        return this.multi(rotMat);
    },

    /*
        Mat3 : rotate - Rotate the current Mat3 object by the specified value
        28/07/2016

        @param[in] pRot - The amount with which to rotate the Mat3 object (Number in radians)

        @return this - Returns itself once the function has ended

        Example:

        //Rotate the player
        playerMatrix.rotate(Math.PI);
    */
    rotate: function(pRot) {
        //Create a matrix to hold the rotation
        var rotMat = new Mat3();

        //Get the sin/cos values
        var sin = Math.sin(pRot);
        var cos = Math.cos(pRot);

        //Set the rotation values
        rotMat.data[0][0] = cos;
        rotMat.data[1][0] = -sin;
        rotMat.data[0][1] = sin;
        rotMat.data[1][1] = cos;

        //Return the result of the multiplication
        return this.multiSet(rotMat);
    },

    /*
        Mat3 : scaled - Get the copy of the current Mat3 object scaled by the specified values
        28/07/2016

        @param[in] pX - The value with which to scale the X axis of the Mat3
        @param[in] pY - The value with which to scale the Y axis of the Mat3

        @return Mat3 - Returns a Mat3 holding the result of the scaling

        Example:

        //Get the world matrix after the player shrunk
        var futureMat = playerMatrix.scaled(0.5, 0.5);
    */
    scaled: function(pX, pY) {
        //Create the scale matrix
        var sclMat = new Mat3();

        //Setup the scale values
        sclMat.data[0][0] = pX;
        sclMat.data[1][1] = pY;

        //Return the result of the multiplication
        return this.multi(sclMat);
    },

    /*
        Mat3 : scale - Scale the current Mat3 object by the specified values
        28/07/2016

        @param[in] pX - The value with which to scale the X axis of the Mat3
        @param[in] pY - The value with which to scale the Y axis of the Mat3

        @return this - Returns itself once the function has ended

        Example:

        //Shrink the player
        playerMatrix.scale(0.5, 0.5);
    */
    scale: function(pX, pY) {
        //Create the scale matrix
        var sclMat = new Mat3();

        //Setup the scale values
        sclMat.data[0][0] = pX;
        sclMat.data[1][1] = pY;

        //Return the result of the multiplication
        return this.multiSet(sclMat);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Math Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Mat3 : set - Set the current mat3 object to the values of another
        28/07/2017

        @param[in] pMat - The Mat3 object to copy

        @return this - Returns itself once the function has ended

        Example:

        //Copy the values of another matrix
        copyMat.set(myMat3);
    */
    set: function(pMat) {
        //Copy the values
        this.data[0][0] = pMat.data[0][0];
        this.data[1][0] = pMat.data[1][0];
        this.data[2][0] = pMat.data[2][0];

        this.data[0][1] = pMat.data[0][1];
        this.data[1][1] = pMat.data[1][1];
        this.data[2][1] = pMat.data[2][1];

        this.data[0][2] = pMat.data[0][2];
        this.data[1][2] = pMat.data[1][2];
        this.data[2][2] = pMat.data[2][2];

        //Return itself
        return this;
    },

    /*
        Mat3 : multi - Multiply the current Mat3 object by another
        28/07/2016

        @param[in] pMat - The Mat3 object to multiply the current by

        @return Mat3 - Returns a Mat3 object holding the result of the multiplication

        Example:

        //Get the players global transform
        var globalTransform = worldTransform.multi(localTransform);
    */
    multi: function(pMat) {
        //Create a new Mat3 to hold the result
        var temp = new Mat3();

        //Preform the multiplication
        temp.data[0][0] = this.data[0][0] * pMat.data[0][0] + this.data[1][0] * pMat.data[0][1] + this.data[2][0] * pMat.data[0][2];
        temp.data[1][0] = this.data[0][0] * pMat.data[1][0] + this.data[1][0] * pMat.data[1][1] + this.data[2][0] * pMat.data[1][2];
        temp.data[2][0] = this.data[0][0] * pMat.data[2][0] + this.data[1][0] * pMat.data[2][1] + this.data[2][0] * pMat.data[2][2];

        temp.data[0][1] = this.data[0][1] * pMat.data[0][0] + this.data[1][1] * pMat.data[0][1] + this.data[2][1] * pMat.data[0][2];
        temp.data[1][1] = this.data[0][1] * pMat.data[1][0] + this.data[1][1] * pMat.data[1][1] + this.data[2][1] * pMat.data[1][2];
        temp.data[2][1] = this.data[0][1] * pMat.data[2][0] + this.data[1][1] * pMat.data[2][1] + this.data[2][1] * pMat.data[2][2];

        temp.data[0][2] = this.data[0][2] * pMat.data[0][0] + this.data[1][2] * pMat.data[0][1] + this.data[2][2] * pMat.data[0][2];
        temp.data[1][2] = this.data[0][2] * pMat.data[1][0] + this.data[1][2] * pMat.data[1][1] + this.data[2][2] * pMat.data[1][2];
        temp.data[2][2] = this.data[0][2] * pMat.data[2][0] + this.data[1][2] * pMat.data[2][1] + this.data[2][2] * pMat.data[2][2];

        //Return the temp
        return temp;
    },

    /*
        Mat3 : multiSet - Set the current Mat3 object to the multiplication between it and the passed in Mat3
        28/07/2016

        @param[in] pMat - The Mat3 object to multiply the current by

        @return this - Returns itself once the function has ended

        Example:

        //Get a transform
        translationMat.multiSet(rotationMat);
    */
    multiSet: function(pMat) {
        //Create a copy of the current Mat3
        var temp = new Mat3(this);

        //Preform the multiplication
        this.data[0][0] = temp.data[0][0] * pMat.data[0][0] + temp.data[1][0] * pMat.data[0][1] + temp.data[2][0] * pMat.data[0][2];
        this.data[1][0] = temp.data[0][0] * pMat.data[1][0] + temp.data[1][0] * pMat.data[1][1] + temp.data[2][0] * pMat.data[1][2];
        this.data[2][0] = temp.data[0][0] * pMat.data[2][0] + temp.data[1][0] * pMat.data[2][1] + temp.data[2][0] * pMat.data[2][2];

        this.data[0][1] = temp.data[0][1] * pMat.data[0][0] + temp.data[1][1] * pMat.data[0][1] + temp.data[2][1] * pMat.data[0][2];
        this.data[1][1] = temp.data[0][1] * pMat.data[1][0] + temp.data[1][1] * pMat.data[1][1] + temp.data[2][1] * pMat.data[1][2];
        this.data[2][1] = temp.data[0][1] * pMat.data[2][0] + temp.data[1][1] * pMat.data[2][1] + temp.data[2][1] * pMat.data[2][2];

        this.data[0][2] = temp.data[0][2] * pMat.data[0][0] + temp.data[1][2] * pMat.data[0][1] + temp.data[2][2] * pMat.data[0][2];
        this.data[1][2] = temp.data[0][2] * pMat.data[1][0] + temp.data[1][2] * pMat.data[1][1] + temp.data[2][2] * pMat.data[1][2];
        this.data[2][2] = temp.data[0][2] * pMat.data[2][0] + temp.data[1][2] * pMat.data[2][1] + temp.data[2][2] * pMat.data[2][2];

        //Return itself
        return this;
    },

    /*
        Mat3 : multiVec - Multiply the current Mat3 object by a Vec2 object
        09/08/2016

        @param[in] pVec - The Vec2 object to multiply the current by

        @return Vec2 - Returns a Vec2 object holding the result of the multiplication

        Example:

        //Transform a point by a matrix
        var transformedPoint = globalMat.multiVec(point);
    */
    multiVec: function(pVec) {
        return new Vec2(
            this.data[0][0] * pVec.x + this.data[1][0] * pVec.y + this.data[2][0],
            this.data[0][1] * pVec.x + this.data[1][1] * pVec.y + this.data[2][1]
        );
    },
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                  General Functions                                         ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
    createTranslationMat - Create a translation matrix from the passed in values
    28/07/2016

    @param[in] pX - The X translation value to set in the matrix
    @param[in] pY - The Y translation value to set in the matrix

    @return Mat3 - Returns a Mat3 with the translation values passed in

    Example:

    //Create the translation matrix
    var transMat = createTranslationMat(5, 5);
*/
function createTranslationMat(pX, pY) {
    //Create a Mat3 object
    var transMat = new Mat3();

    //Set the translation values
    transMat.data[2][0] = pX;
    transMat.data[2][1] = pY;

    //Return the translation matrix
    return transMat;
};

/*
    createRotationMat - Create a rotation matrix from the passed in value
    28/07/2016

    @param[in] pRot - The amount with which to rotate the Mat3 object (Number in radians)

    @return Mat3 - Returns a Mat3 object with the rotation values

    Example:

    //Create the rotation matrix
    var rotMat = createRotationMat(Math.PI);
*/
function createRotationMat(pRot) {
    //Create a matrix to hold the rotation
    var rotMat = new Mat3();

    //Get the sin/cos values
    var sin = Math.sin(pRot);
    var cos = Math.cos(pRot);

    //Set the rotation values
    rotMat.data[0][0] = cos;
    rotMat.data[1][0] = -sin;
    rotMat.data[0][1] = sin;
    rotMat.data[1][1] = cos;

    //Return the rotation matrix
    return rotMat;
};

/*
    createScaleMat - Create a scale matrix from the passed in values
    28/07/2016

    @param[in] pX - The value with which to scale the X axis of the Mat3
    @param[in] pY - The value with which to scale the Y axis of the Mat3

    @return Mat3 - Returns a Mat3 object with the scale values

    Example:

    //Create the scale matrix
    var sclMat = createScaleMat(2, 2);
*/
function createScaleMat(pX, pY) {
    //Create the scale matrix
    var sclMat = new Mat3();

    //Setup the scale values
    sclMat.data[0][0] = pX;
    sclMat.data[1][1] = pY;

    //Return the scale matrix
    return sclMat;
};

/*
    createTransform - Create a transform from the passed in values
    28/07/2016

    @param[in] pTranslateX - The amount the transform should be translated on the X axis (Default 0)
    @param[in] pTranslateY - The amount the transform should be translated on the Y axis (Default 0)
    @param[in] pRot - The amount the transform should be rotated (Radians, Default 0)
    @param[in] pScaleX - The amount the transform should be scaled on the X axis (Default 1)
    @param[in] pScaleY - The amount the transform should be scaled on the Y axis (Default 1)

    @return Mat3 - REturns a Mat3 object with the transform values

    Example:

    //Create the object transform
    var transform = createTransform(posX, posY, rot, size, size);
*/
function createTransform(pTranslateX, pTranslateY, pRot, pScaleX, pScaleY) {
    //Create the Mat3 transform
    var transform = createTranslationMat(typeof pTranslateX === "number" ? pTranslateX : 0,
        typeof pTranslateY === "number" ? pTranslateY : 0);

    //Apply rotation
    if (typeof pRot === "number") transform.multiSet(createRotationMat(pRot));

    //Apply Scaling
    var sclX = typeof pScaleX === "number";
    var sclY = typeof pScaleY === "number";

    if (sclX || sclY) transform.multiSet(createScaleMat(sclX ? pScaleX : 1, sclY ? pScaleY : 1));

    //Return the transform
    return transform;
};