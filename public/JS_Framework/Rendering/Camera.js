/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                            Object Definition                                               ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Camera
 *      Author: Mitchell Croft
 *      Date: 28/08/2016
 *
 *      Requires:
 *      Mat3.js, ExtendProperties.js
 *
 *      Version: 2.0
 *      Added scaling to provide consistant viewing area across 
 *      different resolution canvas objects.
 *  
 *      Purpose:
 *      Provide a basic 2D orthographic camera for rendering 
 *      game worlds to a HTML5 canvas object
 **/

/*
    Camera : Constructor - Initialise with default values for the specified
                           viewport dimensions on the supplied canvas
    28/08/2016

    @param[in] pCanvas - The canvas object to use for scaling the camera view
    @param[in] pViewWidth - The width of the cameras view (World Units)
    @param[in] pViewHeight - The height of the cameras view (World Units)
    @param[in] pDistance - Scales the drawn elements to give the appearance
                           of distance. 1 is regular. Must be greater than 0.
                           (Default 1) 
    
    Example:

    //Create the world camera
    var worldCam = new Camera(gameCanvas, 1280, 720);
    OR
    var worldCam = new Camera(gameCanvas, 1280, 720, 5);
*/
function Camera(pCanvas, pViewWidth, pViewHeight, pDistance) {
    /*  WARNING:
        Don't modify this internal object from the outside of the camera.
        Instead use camera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
    this.__Internal__Dont__Modify__ = {
        //World values
        pos: new Vec2(),
        rot: 0,
        dist: 2 / (typeof pDistance === "number" ? (pDistance < 0.001 ? 0.001 : pDistance) : 1),

        //Rendering values
        canvasDimensions: new Vec2(pCanvas.width, pCanvas.height),
        viewportSize: new Vec2(pViewWidth, pViewHeight),
        viewportScale: new Vec2(pCanvas.width / pViewWidth, pCanvas.height / pViewHeight),
        projection: new Mat3()
    };

    //Setup the projection matrix
    this.__Internal__Dont__Modify__.projection.data[0][0] = this.__Internal__Dont__Modify__.viewportScale.x * this.__Internal__Dont__Modify__.dist;
    this.__Internal__Dont__Modify__.projection.data[1][1] = this.__Internal__Dont__Modify__.viewportScale.y * this.__Internal__Dont__Modify__.dist;
    this.__Internal__Dont__Modify__.projection.data[2][0] = pCanvas.width / 2;
    this.__Internal__Dont__Modify__.projection.data[2][1] = pCanvas.height / 2;
};

ExtendProperties(Camera, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Camera : position - Return the world position of the Camera object
        28/08/2016

        @return Vec2 - Returns a Vec2 object containing the position

        Example:

        //Get the world position of the camera
        var cameraPos = Camera.position;
    */
    get position() {
        return new Vec2(this.__Internal__Dont__Modify__.pos);
    },

    /*
        Camera : position - Set the world position of the Camera object
        28/08/2016

        @param pPos - A Vec2 object containing the new Camera position

        Example:

        //Move the camera to the player
        Camera.position = playerPos;
    */
    set position(pPos) {
        this.__Internal__Dont__Modify__.pos.set(pPos);
    },

    /*
        Camera : x - Return the X axis world position of the Camera object
        28/08/2016

        @return number - Returns the X position as a number

        Example:

        //Get the x position of the camera
        var camPosX = Camera.x;
    */
    get x() {
        return this.__Internal__Dont__Modify__.pos.x;
    },

    /*
        Camera : x - Set the X world position of the Camera object
        28/08/2016

        @param[in] pVal - The new value to set as the X position

        Example:

        //Move the camera to the players X position
        Camera.x = playerPosition.x;
    */
    set x(pVal) {
        this.__Internal__Dont__Modify__.pos.x = pVal;
    },

    /*
        Camera : y - Get the Y world position of the Camera object
        28/08/2016

        @return number - Returns the Y position as a number

        Example:

        //Get the y position of the camera
        var camPosY = Camera.y;
    */
    get y() {
        return this.__Internal__Dont__Modify__.pos.y;
    },

    /*
        Camera : y - Set the Y world position of the Camera object
        28/08/2016

        @param[in] pVal - The new value to set as the Y position

        Example:

        //Move the camera to the players Y position
        Camera.y = playerPosition.y;
    */
    set y(pVal) {
        this.__Internal__Dont__Modify__.pos.y = pVal;
    },

    /*
        Camera : rotation - Get the rotation of the Camera object
        28/08/2016

        @return number - Returns the current rotation of the Camera in degrees

        Example:

        //Get the rotation of the camera
        var camRot = Camera.rotation;
    */
    get rotation() {
        return this.__Internal__Dont__Modify__.rot;
    },

    /*
        Camera : rotation - Set the rotation of the Camera object
        28/08/2016

        @param[in] pVal - A number defining the new rotation of the camera 
                          object in degrees

        Example:
        
        //Rotate the camera over time
        Camera.rotation = ((Math.sin(Date.now() * 0.001) + 1) / 2) * 360;
    */
    set rotation(pVal) {
        this.__Internal__Dont__Modify__.rot = pVal;
    },

    /*
        Camera : distance - Get the scale value emulating distance from the canvas
        28/08/2016

        @return number - Returns a number representing the distance of the Camera

        Example:

        //Get the distance of the camera 
        var camDistance = Camera.distance;
    */
    get distance() {
        return 2 / this.__Internal__Dont__Modify__.dist;
    },

    /*
        Camera : distance - Set the scale value emulating distance from the canvas
        28/08/2016

        @param[in] pVal - The number vlaue to set the distance to (Must be greater
                          than 0)

        Example:

        //Zoom the camera in and out over time
        Camera.distance = ((Math.sin(Date.now() * 0.001) + 1) / 2) * (MAX - MIN) + MIN;
    */
    set distance(pVal) {
        //Update the distance value
        this.__Internal__Dont__Modify__.dist = 2 / (pVal < 0.001 ? 0.001 : pVal);

        //Update the projection matrix
        this.__Internal__Dont__Modify__.projection.data[0][0] = this.__Internal__Dont__Modify__.viewportScale.x * this.__Internal__Dont__Modify__.dist;
        this.__Internal__Dont__Modify__.projection.data[1][1] = this.__Internal__Dont__Modify__.viewportScale.y * this.__Internal__Dont__Modify__.dist;
    },

    /*
        Camera : canvasDimensions - Get the current canvas dimensions that are being used for the Camera object
        29/09/2016

        @return Vec2 - Returns a Vec2 object with the canvas dimensions contained

        Example:

        //Get the dimensions of the area the camera is rendering to
        var renderDim = Camera.canvasDimensions;
    */
    get canvasDimensions() {
        return new Vec2(this.__Internal__Dont__Modify__.canvasDimensions);
    },

    /*
        Camera : canvasDimensions - Set the canvas dimensions that are used for the Camera object
        28/08/2016

        @param[in] pDim - A Vec2 object that contains the new canvas dimensions

        Example:

        //TODO: Setup callback for canvas resize

        //Resize the cameras canvas size
        Camera.canvasDimensions = new Vec2(Canvas.width, Canvas.height);
    */
    set canvasDimensions(pDim) {
        //Save the new canvas dimensions
        this.__Internal__Dont__Modify__.canvasDimensions.set(pDim);

        //Update the viewport scale
        this.__Internal__Dont__Modify__.viewportScale.x = this.__Internal__Dont__Modify__.canvasDimensions.x / this.__Internal__Dont__Modify__.viewportSize.x;
        this.__Internal__Dont__Modify__.viewportScale.y = this.__Internal__Dont__Modify__.canvasDimensions.y / this.__Internal__Dont__Modify__.viewportSize.y;

        //Update the projection matrix
        this.__Internal__Dont__Modify__.projection.data[0][0] = this.__Internal__Dont__Modify__.viewportScale.x * this.__Internal__Dont__Modify__.dist;
        this.__Internal__Dont__Modify__.projection.data[1][1] = this.__Internal__Dont__Modify__.viewportScale.y * this.__Internal__Dont__Modify__.dist;
        this.__Internal__Dont__Modify__.projection.data[2][0] = pDim.x / 2;
        this.__Internal__Dont__Modify__.projection.data[2][1] = pDim.y / 2;
    },

    /*
        Camera : viewDimensions - Get the viewport dimensions of the Camera object
        28/08/2016

        @return Vec2 - Returns a Vec2 object containing the viewport dimensions

        Example:

        //Get the viewport dimensions of the world camera
        var viewDim = Camera.viewDimensions;
    */
    get viewDimensions() {
        return new Vec2(this.__Internal__Dont__Modify__.viewportSize);
    },

    /*
        Camera : viewDimensions - Set the viewport dimensions of the Camera object
        28/08/2016

        @param[in] pDim - A Vec2 object containing the new viewport dimensions for
                          the Camera object

        Example:

        //Set the viewport dimensions of the world camera
        Camera.viewDimensions = new Vec2(1280, 720);
    */
    set viewDimensions(pDim) {
        //Set the new view dimensions
        this.__Internal__Dont__Modify__.viewportSize.set(pDim);

        //Adjust the viewport scale values
        this.__Internal__Dont__Modify__.viewportScale.x = this.__Internal__Dont__Modify__.canvasDimensions.x / this.__Internal__Dont__Modify__.viewportSize.x;
        this.__Internal__Dont__Modify__.viewportScale.y = this.__Internal__Dont__Modify__.canvasDimensions.y / this.__Internal__Dont__Modify__.viewportSize.y;

        //Adjust the projection matrix
        this.__Internal__Dont__Modify__.projection.data[0][0] = this.__Internal__Dont__Modify__.viewportScale.x * this.__Internal__Dont__Modify__.dist;
        this.__Internal__Dont__Modify__.projection.data[1][1] = this.__Internal__Dont__Modify__.viewportScale.y * this.__Internal__Dont__Modify__.dist;
    },

    /*
        Camera : viewWidth - Get the viewport width of the Camera object
        28/08/2016

        @return number - Returns a number with the viewport width of the Camera

        Example:

        //Get the width of the cameras viewport
        var camViewWidth = Camera.viewWidth;
    */
    get viewWidth() {
        return this.__Internal__Dont__Modify__.viewportSize.x;
    },

    /*
        Camera : viewWidth - Set the viewport width of the Camera object
        28/08/2016

        @param[in] pVal - A number representing the new width of the Camera
                          objects viewport

        Example:

        //Set the camera viewport width
        Camera.viewWidth = 1280;
    */
    set viewWidth(pVal) {
        //Set the new view dimensions
        this.__Internal__Dont__Modify__.viewportSize.x = pVal;

        //Adjust the viewport scale values
        this.__Internal__Dont__Modify__.viewportScale.x = this.__Internal__Dont__Modify__.canvasDimensions.x / this.__Internal__Dont__Modify__.viewportSize.x;

        //Adjust the projection matrix
        this.__Internal__Dont__Modify__.projection.data[0][0] = this.__Internal__Dont__Modify__.viewportScale.x * this.__Internal__Dont__Modify__.dist;
    },

    /*
        Camera : viewHeight - Get the viewport height of the Camera object
        28/08/2016

        @return number - Returns a number with the viewport height of the Camera

        Example:

        //Get the height of the cameras viewport
        var camViewHeight = Camera.viewHeight;
    */
    get viewHeight() {
        return this.__Internal__Dont__Modify__.viewportSize.y;
    },

    /*
        Camera : viewHeight - Set the viewport height of the Camera object
        28/08/2016

        @param[in] pVal - A number representing the new height of the Camera
                          objects viewport

        Example:

        //Set the camera viewport height
        Camera.viewHeight = 720;
    */
    set viewHeight(pVal) {
        //Set the new view dimensions
        this.__Internal__Dont__Modify__.viewportSize.y = pVal;

        //Adjust the viewport scale values
        this.__Internal__Dont__Modify__.viewportScale.y = this.__Internal__Dont__Modify__.canvasDimensions.y / this.__Internal__Dont__Modify__.viewportSize.y;

        //Adjust the projection matrix
        this.__Internal__Dont__Modify__.projection.data[1][1] = this.__Internal__Dont__Modify__.viewportScale.y * this.__Internal__Dont__Modify__.dist;
    },

    /*
        Camera : globalMat - Get the global matrix for the Camera object
        28/08/2016

        @return Mat3 - Returns a Mat3 object holding the global transform for
                       the Camera object

        Example:

        //Get the world cameras global matrix
        var camGlobal = Camera.globalMat;
    */
    get globalMat() {
        return createTransform(this.__Internal__Dont__Modify__.pos.x,
            this.__Internal__Dont__Modify__.pos.y,
            this.__Internal__Dont__Modify__.rot * Math.PI / 180);
    },

    /*
        Camera : view - Get the view matrix from the camera object
        28/08/2016

        @return Mat3 - Returns a Mat3 object holding the view matrix for the 
                       Camera object

        Example:

        //Get the cameras view matrix
        var camView = Camera.view;
    */
    get view() {
        return this.globalMat.inverse();
    },

    /*
        Camera : projection - Get the projection matrix from the camera object
        21/11/2016

        @return Mat3 - Returns a Mat3 object holding the projection matrix for the
                       Camera object

        Example:

        //Get the cameras projection matrix
        var camProj = Camera.projection;
    */
    get projection() {
        return new Mat3(this.__Internal__Dont__Modify__.projection);
    },

    /*
        Camera : projectionView - Get the projection view matrix from the Camera 
                                  object
        28/08/2016

        @return Mat3 - Returns a Mat3 object holding the projection matrix for
                       Camera object

        Example:

        //Get the projection view matrix from the camera
        var projView = Camera.projectionView;
    */
    get projectionView() {
        return this.__Internal__Dont__Modify__.projection.multi(this.view);
    },

    /*
        Camera : projectionUI - Get the projection matrix used to scale UI elements
                                to the viewable canvas
        21/11/2016

        @return Mat3 - Returns a Mat3 object holding the scaleing to apply to UI
                       elements

        Example:

        //Get the UI projection matrix from the camera
        var projUI = Camera.projectionUI;
    */
    get projectionUI() {
        return createScaleMat(this.__Internal__Dont__Modify__.viewportScale.x,
            this.__Internal__Dont__Modify__.viewportScale.y);
    },
});