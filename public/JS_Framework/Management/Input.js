/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                            Object Definition                                               ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Input
 *      Author: Mitchell Croft
 *      Date: 29/07/2016
 *
 *      Requires:
 *      Vec2.js
 *
 *      Version: 2.0
 *      Added axis values. Cleaned up comments and code layout
 *
 *      Purpose:
 *      Manage changes in input states and provide an interface
 *      for using that information within a game project. Object
 *      is created on file load, to use call the update function
 *      once per game loop (i.e. cycle)
 **/

var Input = new function() {
    //Track key states per cycle
    var preKeyState = [];
    preKeyState.length = 256;
    preKeyState.fill(false);
    var curKeyState = [];
    curKeyState.length = 256;
    curKeyState.fill(false);

    //Store input changes inbetween cycles
    var bufferState = [];

    //Store a map of the different axis values
    var axisValues = [];

    //Store an array of the different InputAxis objects
    var axisObjects = [];

    //Store the mouse position
    this.mousePos = new Vec2();

    //Store a reference to the canvas in use for mouse coord correction
    var screenCanvas = null;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Functions                                               ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Input : update - Update the input states based on the changes since the last cycle
        29/07/2016
        
        Requires:
        This function must be called oonce (and only once) per cycle. Call this function at the start of 
        your game loop.

        @param[in] pDelta - The delta time for cycle

        Example:

        function gameLoop() {
            //Update input manager
            Input.update(deltaTime);
        }
    */
    this.update = function(pDelta) {
        //Loop through the buffer state and copy values over
        for (var i = bufferState.length - 1; i >= 0; i--) {
            //Copy the current state to the previous
            preKeyState[i] = curKeyState[i];

            //Copy the current state from the buffer
            curKeyState[i] = bufferState[i];
        }

        //Update the axis values
        for (var axisName in axisObjects) {
            //Test this is actaully a name in the map
            if (!axisObjects.hasOwnProperty(axisName)) continue;

            //Flag if input has been included
            var strengthVal = 0;

            //Store the average gravity of all InputAxis objects
            var gravAvg = 0;

            //Loop through the axis objects
            for (var i = axisObjects[axisName].length - 1; i >= 0; i--) {
                //Add the gravity to the average
                gravAvg += axisObjects[axisName][i].gravity;

                //Get a total of the strength for this object
                var objVal = 0;

                //Check if positive key is down
                if (curKeyState[axisObjects[axisName][i].positiveKey] ||
                    curKeyState[axisObjects[axisName][i].altPositiveKey])
                    objVal += axisObjects[axisName][i].strength * pDelta;

                //Check if negative key is down
                if (curKeyState[axisObjects[axisName][i].negativeKey] ||
                    curKeyState[axisObjects[axisName][i].altNegativeKey])
                    objVal -= axisObjects[axisName][i].strength * pDelta;

                //Check if the strength is stronger then current
                if (Math.abs(objVal) > Math.abs(strengthVal))
                    strengthVal = objVal;
            }

            //Test if there is any strength to apply
            if (strengthVal) {
                //Add the strength value
                axisValues[axisName] += strengthVal;

                //Clamp the axis value from -1 to 1
                axisValues[axisName] = (axisValues[axisName] > 1 ? 1 : axisValues[axisName] < -1 ? -1 : axisValues[axisName]);
            }

            //If no strength apply gravity
            else {
                //Get the direction
                var dir = Math.sign(axisValues[axisName]) * -1;

                //Average out the gravity value
                gravAvg /= axisObjects[axisName].length;

                //Get the gravity value applied to the current value
                var appliedVal = axisValues[axisName] + gravAvg * pDelta * dir;

                //Assign the axis values
                axisValues[axisName] = (Math.sign(appliedVal) === dir ? 0 : appliedVal);
            }
        }
    };

    /*
        Input : setCanvas - Sets the canvas object that will be used to offset the mouse position
        29/07/2016

        @param[in] pCnv - A reference to the canvas object present on HTML document

        Example:

        //Set the input managers canvas
        Input.setCanvas(canvas);

        OR

        //Remove the assigned canvas object
        Input.setCanvas(null);
    */
    this.setCanvas = function(pCnv) {
        screenCanvas = pCnv;
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                                 Axis Functions                                             ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Input : addAxis - Add a new InputAxis object to be used by the Input manager
        29/07/2016

        @param[in] pAxis - The new InputAxis object to add to the Input manager

        @return bool - Returns true if the axis was successfully added to the manager

        Example:

        //Setup Input axis'
        if (Input.addAxis(horizontalAxis)) {
            //TODO: Continue loading game values
        }
    */
    this.addAxis = function(pAxis) {
        //Check pAxis is an InputAxis object
        if (!(pAxis instanceof InputAxis)) return false;

        //Check if axis already exists
        if (!(pAxis.name in axisValues)) {
            //Create the axis value
            axisValues[pAxis.name] = 0;

            //Create the array for InputAxis objects with this name
            axisObjects[pAxis.name] = [];
        }

        //Add the the axis object to the map
        axisObjects[pAxis.name].push(pAxis);

        //Return success
        return true;
    };

    /*
        Input : removeAxis - Remove an InputAxis object from the Input manager
        29/07/2016

        @param[in] pAxis - The InputAxis object to remove from the Input manager

        @return bool - Returns true if the object was successfully removed

        Example:

        if (Input.removeAxis(horizontalAxis)) {
            //TODO: Prompt user for new input
        }
    */
    this.removeAxis = function(pAxis) {
        //Check pAxis is an InputAxis object
        if (!(pAxis instanceof InputAxis)) return false;

        //Check if axis value exists
        if (!(pAxis.name in axisValues)) return false;

        //Track if the object was found
        var found = false;

        //Loop through the InputAxis objects to look for match
        for (var i = axisObjects[pAxis.name].length - 1; i >= 0; i--) {
            if (axisObjects[pAxis.name][i] === pAxis) {
                //Remove the object from the array
                axisObjects[pAxis.name].splice(i, 1);

                //Set the found flag
                found = true;

                //Exit the loop
                break;
            }
        }

        //If the value was found check if axis values can be deleted
        if (found && axisObjects[pAxis.name].length === 0) {
            //Delete the axis value
            delete axisValues[pAxis.name];

            //Delete the axis the axis objects array
            delete axisObjects[pAxis.name];
        }

        //Return could not find the item
        return found;
    };

    /*
        Input : clearAxis - Completly clears all InputAxis objects with a specified name
        29/07/2016

        @param[in] pName - The name of the axis to clear

        @return bool - Returns true if the axis was successfully removed

        Example:

        if (Input.clearAxis("horizontal")) {
            //TODO: Prompt user for new input
        }
    */
    this.clearAxis = function(pName) {
        //Check if the axis exists
        if (!(pName in axisValues)) return false;

        //Delete the axis value
        delete axisValues[pName];

        //Delete the axis objects
        delete axisObjects[pName];

        //Return successfull
        return true;
    };

    /*
        Input : getAxis - Gets the value of the specified axis 
        29/07/2016

        @param[in] pName - The name of the axis to retrieve

        @return number - Returns a number between 1 and -1 as the axis value

        Example:

        //Add player movement
        playerPosition += PLAYER_MOVE_SPEED * Input.getAxis("move");
    */
    this.getAxis = function(pName) {
        return axisValues[pName];
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Keyboard Functions                                           ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Input : keyDown - Check if the passed in key is currently down
        29/07/2016

        @param[in] pKey - An integral number reflecting the key to check

        @return bool - Returns true if the key is down

        Example:

        //Check for forward movement
        if (Input.keyDown(Keys.UP)) {
            //TODO: Move the player forward
        }
    */
    this.keyDown = function(pKey) {
        return curKeyState[pKey];
    };

    /*
        Input : keyUp - Check if the passed in key is currently up
        29/07/2016

        @param[in] pKey - An integral number reflecting the key to check

        @return bool - Returns true if the key is down

        Example:

        //Check if the player is not sneaking
        if (Input.keyUp(Keys.SHIFT)) {
            //TODO: Make lots of noise
        }
    */
    this.keyUp = function(pKey) {
        return !curKeyState[pKey];
    };

    /*
        Input : keyPressed - Checks to see if the key has been pressed this cycle
        29/07/2016

        @param[in] pKey - An integral number reflecting the key to check

        @return bool - Returns true if the key has been pressed

        Example:

        //Fire the players gun
        if (Input.keyPressed(Keys.SPACE)) {
            //TODO: Fire a bullet
        }
    */
    this.keyPressed = function(pKey) {
        return (curKeyState[pKey] && !preKeyState[pKey]);
    };

    /*
        Input : keyReleased - Checks to see if the key has been released this cycle
        29/07/2016

        @param[in] pKey - An integral number reflecting the key to check

        @return bool - Returns true if the key has been released

        Example:

        //Throw cooked grenade
        if (Input.keyReleased(Keys.TAB)) {
            //TODO: Throw grenade
        }
    */
    this.keyReleased = function(pKey) {
        return (!curKeyState[pKey] && preKeyState[pKey]);
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Mouse Functions                                              ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Input : mouseDown - Checks to see if the mouse button is currently down
        29/07/2016

        @param[in] pBtn - An integral number reflecting the to button to check (1 - 3 inclusive)

        @return bool - Returns true if the button is down

        Example:

        //Check if attack is charging
        if (Input.mouseDown(Buttons.LEFT_CLICK)) {
            //TODO: Charge attack
        }
    */
    this.mouseDown = this.keyDown;

    /*
        Input : mouseUp - Checks to see if the mouse button is currently up
        29/07/2016

        @param[in] pBtn - An integral number reflecting the button to check (1 - 3 inclusive)

        @return bool - Returns true if the button is up

        Example:

        //Check if player is aiming
        if (Input.mouseUp(Buttons.RIGHT_CLICK)) {
            //TODO: Add movement code
        }
    */
    this.mouseUp = this.keyUp;

    /*
        Input : mousePressed - Checks to see if the mouse button has been pressed this cycle
        29/07/2016

        @param[in] pBtn - An integral number reflecting the button to check (1 - 3 inclusive)

        @return bool - Returns true if the button has been pressed

        Example:

        //Choose player spawn point
        if (Input.mousePressed(Buttons.MIDDLE_CLICK)) {
            //TODO: Place the spawn point
        }
    */
    this.mousePressed = this.keyPressed;

    /*
        Input : mouseReleased - Checks to see if the mouse button has been released this cycle
        29/07/2016

        @param[in] pBtn - An integral number reflecting the button to check (1 - 3 inclusive)

        @return bool - Returns true if the button has been released

        Example:

        //Release cooking grenade when player release button
        if (Input.mouseReleased(Buttons.RIGHT_CLICK)) {
            //TODO: Throw grenade
        }
    */
    this.mouseReleased = this.keyReleased;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                            Setup Event Listeners                                           ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        window : keydown - Add a callback for the keydown event to the window
        29/07/2016

        @param[in] pEvt - Information about the event that occurred
    */
    window.addEventListener("keydown", function(pEvt) {
        bufferState[pEvt.keyCode] = true;
    }, false);

    /*
        window : keyup - Add a callback for the keyup event to the window
        29/07/2016

        @param[in] pEvt - Information about the event that occurred
    */
    window.addEventListener("keyup", function(pEvt) {
        bufferState[pEvt.keyCode] = false;
    }, false);

    /*
        window : mousedown - Add a callback for the mousedown event to the window
        29/07/2016

        @param[in] pEvt - Information about the event that occurred
    */
    window.addEventListener("mousedown", function(pEvt) {
        //Add support for IE
        if (!pEvt.which && pEvt.button) {
            if (pEvt.button & 1) pEvt.which = 1;
            else if (pEvt.button & 4) pEvt.which = 2;
            else if (pEvt.button & 2) pEvt.which = 3;
        }

        //Set the mouse down value
        bufferState[pEvt.which] = true;
    }, false);

    /*
        window : mouseup - Add a callback for the mouseup event to the window
        29/07/2016

        @param[in] pEvt - Information about the event occurred
    */
    window.addEventListener("mouseup", function(pEvt) {
        //Add support for IE
        if (!pEvt.which && pEvt.button) {
            if (pEvt.button & 1) pEvt.which = 1;
            else if (pEvt.button & 4) pEvt.which = 2;
            else if (pEvt.button & 2) pEvt.which = 3;
        }

        //Set the mouse up value
        bufferState[pEvt.which] = false;
    }, false);

    /*
        window : mousemove - Add a callback for the mousemove event to the window
        29/07/2016

        @param[in] pEvt - Information about the event occurred
    */
    window.addEventListener("mousemove", function(pEvt) {
        //Set the new position
        Input.mousePos.x = pEvt.pageX;
        Input.mousePos.y = pEvt.pageY;

        //Check if a canvas object has been set
        if (screenCanvas !== null) {
            Input.mousePos.x -= screenCanvas.offsetLeft;
            Input.mousePos.y -= screenCanvas.offsetTop;
        }
    }, false);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                            Object Definition                                               ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: InputAxis
 *      Author: Mitchell Croft
 *      Date: 29/07/2016
 *
 *      Purpose:
 *      Allow for scaleable input return based on a combination
 *      of input values (Key or button)
 **/

/*
    InputAxis : Constructor - Initialise with default values
    29/07/2016

    @param[in] pName - A string defining a name to assign to the axis (WARNING: This must
                       not change once it has been added to the Input manager)
    @param[in] pPos - The key that adds a positive value to the axis (Default 0)
    @param[in] pNeg - The key that adds a negative value to the axis (Default 0)
    @param[in] pStr - The strength of this InputAxis object (1 takes one second 
                      to reach full value, 2 half a second, 0.5 two seconds etc.) (Default 1)
    @param[in] pGrav - The gravity of this InputAxis object (How long it takes to return 
                       to a 0 value) (Default 1)
    @param[in] pAltPos - An alternative key that can be used to add a positive value
                         to the axis (Default 0)
    @param[in] pAltNeg - An alternative key that can be used to add a negative value
                         to the axis (Default 0)

    Example:

    //Create a horizontal movement axis
    var axis = new InputAxis("horizontal", Keys.D, Keys.A, 2, 0.5, Keys.RIGHT, Keys.LEFT);
*/
function InputAxis(pName, pPos, pNeg, pStr, pGrav, pAltPos, pAltNeg) {
    //Store the name of the axis that this object effects
    this.name = (typeof pName === "string" ? pName : "UNNAMED");

    //Store key values that effect the axis value
    this.positiveKey = (typeof pPos === "number" ? pPos : 0);
    this.negativeKey = (typeof pNeg === "number" ? pNeg : 0);

    //Store the alternative key values
    this.altPositiveKey = (typeof pAltPos === "number" ? pAltPos : 0);
    this.altNegativeKey = (typeof pAltNeg === "number" ? pAltNeg : 0);

    //Store the strength of the input axis 
    this.strength = (typeof pStr === "number" ? pStr : 1);

    //Store the gravity of the input axis
    this.gravity = (typeof pGrav === "number" ? pGrav : 1);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                               Key Defines                                                  ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Keys
 *      Author: Mitchell Croft
 *      Date: 15/06/2016
 *
 *      Purpose:
 *      Name the numerical values with the key's that they correspond with
 *      to enable input coding in a readable fashion. These values should
 *      be altered 
 *
 *      Key codes taken from http://www.cambiaresearch.com/articles/15/javascript-key-codes
 **/

var Keys = {
    //NUMBERS
    NUM0: 48,
    NUM1: 49,
    NUM2: 50,
    NUM3: 51,
    NUM4: 52,
    NUM5: 53,
    NUM6: 54,
    NUM7: 55,
    NUM8: 56,
    NUM9: 57,
    PAD0: 96,
    PAD1: 97,
    PAD2: 98,
    PAD3: 99,
    PAD4: 100,
    PAD5: 101,
    PAD6: 102,
    PAD7: 103,
    PAD8: 104,
    PAD9: 105,

    //LETTERS
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,

    //SPECIAL CHARACTERS
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS: 20,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    LEFT_WIN: 91,
    RIGHT_WIN: 92,
    SELECT: 93,
    MULTIPLY: 106,
    ADD: 107,
    SUBTRACT: 109,
    DECIMAL_POINT: 110,
    DIVIDE: 111,
    NUM_LOCK: 144,
    SCOLL_LOCK: 145,
    SEMI_COLON: 186,
    EQUAL_SIGN: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    BACK_SLASH: 220,
    TILDE: 192,
    OPEN_BRACKET: 219,
    CLOSE_BRACKET: 221,
    SINGLE_QUOTE: 222,

    //FUNCTION KEYS
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                           Mouse Button Defines                                             ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Buttons
 *      Author: Mitchell Croft
 *      Date: 15/06/2016
 *
 *      Purpose:
 *      Name the numerical values that correspond to the different mouse 
 *      buttons to enable input coding in a readable fashion. These values
 *      should not be altered.
 **/

var Buttons = { LEFT_CLICK: 1, MIDDLE_CLICK: 2, RIGHT_CLICK: 3 };