/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: StateManager
 *      Author: Mitchell Croft
 *      Date: 30/07/2016
 *
 *      Version: 2.0
 *      Improved code readability and reduced code complexity
 *
 *      Purpose:
 *      Manage the active game loop function and supply delta
 *      time to user state functions
 **/

var StateManager = new function() {
    //Track the change in timer every cycle
    var prevTime = Date.now();
    var currTime = Date.now();

    //Store the delta time each cycle
    var deltaTime = 0;

    //Track the function to be called in the game loop
    var gameFunc = null;

    /*
        StateManager : gameLoop - The function that will be run every window animation frame request
        17/06/2016
    */
    var gameLoop = function() {
        //Update the delta time
        prevTime = currTime;
        currTime = Date.now();
        deltaTime = (currTime - prevTime) * 0.001;

        //Clamp delta time to a max of 1
        deltaTime = (deltaTime > 1 ? 1 : deltaTime);

        //Run the game function
        if (gameFunc) gameFunc(deltaTime);

        //Request browser re-call the game loop
        window.requestAnimationFrame(gameLoop);
    };

    //Run the game loop function
    gameLoop();

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Main Function                                                ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        StateManager : setGameFunction - Set the function that will be called every animation frame
        17/06/2016
    
        @param[in] pFunc - The function that will be called every frame (Takes deltaTime as the only parameter)
    
        Example:
    
        //SET THE GAME STATE
        if (First Button Pressed)
            StateManager.setGameFunction(menuFunction);
        else if (Second Button Pressed)
            StateManager.setGameFunction(gameFunction);
        else if (Third Button Pressed)
            StateManager.setGameFunction(creditsFunction);
    */
    this.setGameFunction = function(pFunc) {
        //Check the type 
        if (typeof pFunc !== "function")
            throw new Error("Can not set the State manager's game function to " + pFunc + " (Type: '" + typeof pFunc + "') Please use a function that can take in delta time");

        //Set the function
        gameFunc = pFunc;
    };
};