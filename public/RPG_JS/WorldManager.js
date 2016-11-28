/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                  Type Definition                                           ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *		Name: TransitionState
 *		Author: Mitchell Croft
 *		Date: 28/11/2016
 *
 *		Purpose:
 *		Flag the current progress of the World Manager as it transitions
 *		between different maps
 **/
var TransitionState = { COMPLETED: 0, EXITING: 1, WAITING: 2, ENTERING: 3 };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *		Name: WorldManager
 *		Author: Mitchell Croft
 *		Date: 28/11/2016
 *
 *		Requires:
 *		Camera.js, ExtendProperties.js
 *
 *		Version: 1.0
 *
 *		Purpose:
 *		Load and manage a number of tile maps that allows for transitioning
 *		between different map environments
 **/

/*
	WolrdManager : Constructor - Initialise with default values
	28/1/12016

	@param[in] pImgCB - An optional function callback which takes in a file path
						an returns an image object that can be used for rendering
						(By default creates a new image everytime as needed)
	@param[in] pObjCB - An optional function callback that can be passed an object
						layer for user processing (Default does nothing)
*/
function WorldManager(pImgCB, pObjCB) {
	/*  WARNING:
        Don't modify this internal object from the outside of the WorldManager.
        Instead use camera properties and functions to modify these values
        as this allows for the internal information to update itself and keep it
        correct.
    */
	this.__Internal__Dont__Modify__ = {
		//Store the filepath used to load the World this is managing
		fileLocation: null,

		//Store a map of the defined maps names and their relative filepaths
		definedMaps: [],

		//Store a TileMap object which stores the values for the current map
		currentMap: null,

		//Store a reference to the name of the next map to load
		toLoad: null,

		//Flag if the manager is transitioning between amps
		state: TransitionState.COMPLETED,

		//Store a transition timer value
		transitionTimer: 1,

		//Store a time for half of the transition length
		transitionLength: 1,

		//Store a reference to the image loading callback
		imgCB: (typeof pImgCB === "function" ? pImgCB : function(pFilePath) {
			//Create a new image
			var img = new Image();

			//Assign the source filepath
			img.src = pFilePath;
		}),

		//Store a reference to the object loading callback
		objCB: (typeof pObjCB === "function" ? pObjCB : null),

		//Store a map of the layers to highlight when rendering
		highlightLayers: [],
	};
};

ExtendProperties(WorldManager, {
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////                                                                                                            ////
	/////                                               Property Definitions                                         ////
	/////                                                                                                            ////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/*
		WorldManager : transitionTime - Get the length of the current transition time
		28/11/2016

		@return number - Returns a number which is the amount of time the WorldManager will use to swap over maps
	*/
	get transitionTime() {
		return this.__Internal__Dont__Modify__.transitionLength;
	},

	/*
		WorldManager : transitionTime - Set the time it takes for the World Manager to transition between maps
		28/11/2016

		@param[in] pTime - A number defining the length of time to swap over the map (Must be >= 0)
	*/
	set transitionTime(pTime) {
		//Check the value
		if (typeof pTime !== "number")
			throw new Error("Can not set the World Manager's transition time to " + pTime + " (Type: '" + typeof pTime + "') Please use a number >= 0");

		//Set the length of time
		this.__Internal__Dont__Modify__.transitionLength = Math.max(0, pTime);

		//If no current map, set timer at half of the value
		if (!this.__Internal__Dont__Modify__.currentMap)
			this.__Internal__Dont__Modify__.transitionTimer = this.__Internal__Dont__Modify__.transitionLength / 2;
	},

	/*
		WorldManager : transitionProgress - Get the progress of the transition between maps
		28/11/2016

		@return number - Returns the progress as a number between 0 - 1 where 1 is complete
	*/
	get transitionProgress() {
		return Math.clamp01(this.__Internal__Dont__Modify__.transitionTimer / this.__Internal__Dont__Modify__.transitionLength);
	},

	/*
		WorldManager : imageCB - Set the callback function used for loading images
		28/11/2016

		@param[in] pCB - A function that can be passed a filepath and returns an image to be used for rendering
	*/
	set imageCB(pCB) {
		//Check the value
		if (typeof pCB !== "function")
			throw new Error("Can not set the image loading callback function to " + pCB + " (Type: '" + typeof pCB + "') Please use a function that can take a filepath as the only parameter and return an image object");

		//Set the callback
		this.__Internal__Dont__Modify__.imgCB = pCB;
	},

	/*
		WorldManager : objectCB - Set the callback function used for processing object layers on maps
		28/11/2016

		@param[in] pCB - A function that can be passed an object layer for user processing
	*/
	set objectCB(pCB) {
		//Check for null
		if (pCB == null) {
			//Clear the stored callback
			this.__Internal__Dont__Modify__.objCB = null;

			//Exit the function
			return;
		}

		//Check the value
		if (typeof pCB !== "function")
			throw new Error("Can not set the object prcessing function to " + pCB + " (Type: '" + typeof pCB + "') Please use a function that takes in an object layer object");

		//Set the callback
		this.__Internal__Dont__Modify__.objCB = pCB;
	},

	/*
		WorldManager : highlightLayers - Set the names of the layers to highlight when rendering 
		28/11/2016

		@param[in] pIdents - Either a single or an array of string identifiers
	*/
	set highlightLayers(pIdents) {
		//Clear the current highlight layers map
		this.__Internal__Dont__Modify__.highlightLayers = [];

		//Check the input for null
		if (pIdents == null) return;

		//Check the value
		if (typeof pIdents !== "string" && !pIdents instanceof Array)
			throw new Error("Can not set the highlight layers to " + pIdents + " (Type: '" + typeof pIdents + "') Please use either a single string or an array of string layer identifiers");

		//Check array values
		else if (pIdents instanceof Array) {
			//Loop through the array and check
			for (var i = 0; i < pIdents.length; i++) {
				//Check the type
				if (typeof pIdents[i] !== "string")
					throw new Error("Can not set a highlight layer to " + pIdents[i] + " (Type: '" + typeof pIdents[i] + "') Please use string identifiers");
			}
		}

		//Add values to the map
		for (var i = 0; i < pIdents.length; i++)
			this.__Internal__Dont__Modify__.highlightLayers[pIdents[i]] = true;
	},

	/*
		WorldManager : activeMap - Set the active map
		28/11/2016

		@param[in] pIdent - A string identifier that matches with one of the defined map names
							from the loaded World JSON file
	*/
	set activeMap(pIdent) {
		//Check the type
		if (typeof pIdent !== "string")
			throw new Error("Can not set the WorldManager's active map to " + pIdent + " (Type: '" + typeof pIdent + "') Please use a string identifier from the loaded World JSON file");

		//Check that the identifier exists in the map
		else if (!pIdent in this.__Internal__Dont__Modify__.definedMaps)
			throw new Error("Could not load the map " + pIdent + " as it does not exist in the list of defined maps");

		//Set the transition name
		this.__Internal__Dont__Modify__.toLoad = pIdent;

		//Reset the time value
		this.__Internal__Dont__Modify__.transitionTimer = 0;

		//Flag the manager as transitioning
		this.__Internal__Dont__Modify__.state = TransitionState.EXITING;
	},

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////                                                                                                            ////
	/////                                               Main Functions                                               ////
	/////                                                                                                            ////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/*
		WorldManager : update - Update the internal values and check for map loading
		28/11/2016

		@param[in] pDelta - The delta time for the current cycle
	*/
	update: function(pDelta) {
		//Check if there is any loading work that needs to be done
		if (this.__Internal__Dont__Modify__.state) {
			//If the manager is not waiting add onto delta time
			if (this.__Internal__Dont__Modify__.state !== TransitionState.WAITING)
				this.__Internal__Dont__Modify__.transitionTimer += pDelta;

			//Check if there is a map to start loading
			if (typeof this.__Internal__Dont__Modify__.toLoad === "string")
				this.__Internal__Dont__Modify__.toLoad = new TileMap().loadMap(this.__Internal__Dont__Modify__.fileLocation +
					this.__Internal__Dont__Modify__.definedMaps[this.__Internal__Dont__Modify__.toLoad],
					this.__Internal__Dont__Modify__.imgCB);

			//Once half of the transition is done, wait for the map to load
			if (this.__Internal__Dont__Modify__.toLoad instanceof TileMap &&
				this.__Internal__Dont__Modify__.state === TransitionState.EXITING &&
				this.transitionProgress >= 0.5)
				this.__Internal__Dont__Modify__.state = TransitionState.WAITING;

			//Once the map has loaded start entering the new map
			if (this.__Internal__Dont__Modify__.toLoad.loaded &&
				this.__Internal__Dont__Modify__.state === TransitionState.WAITING) {
				//Flag the manager as entering the new map
				this.__Internal__Dont__Modify__.state = TransitionState.ENTERING;

				//Move over the toLoad map object to the current level
				this.__Internal__Dont__Modify__.currentMap = this.__Internal__Dont__Modify__.toLoad;

				//Clear the to load variable
				this.__Internal__Dont__Modify__.toLoad = null;

				//Loop thorugh the object layers and pass them to the callback
				if (typeof this.__Internal__Dont__Modify__.objCB === "function") {
					for (var i = 0; i < this.__Internal__Dont__Modify__.currentMap.objectLayers.length; i++)
						this.__Internal__Dont__Modify__.objCB(this.__Internal__Dont__Modify__.currentMap.objectLayers[i]);
				}
			}

			//Once the transition has finished flag the end of the transition
			if (this.__Internal__Dont__Modify__.state === TransitionState.ENTERING &&
				this.transitionProgress === 1)
				this.__Internal__Dont__Modify__.state = TransitionState.COMPLETED;
		}
	},
});