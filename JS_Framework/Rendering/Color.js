/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                 Object Definition                                          ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *      Name: Color
 *      Author: Mitchell Croft
 *      Date: 28/07/2016
 *
 *      Requires:
 *      ExtendProperties.js
 *
 *      Version: 2.0
 *      Added property values to improve usability
 *
 *      Puspose:
 *      Manage color values that can be used to 
 *      display graphics with varying visual styles
 **/

/*
    Color : Constructor - Initialise a Color object with starting values (Default black)
    28/07/2016

    @param[in] pFirst - Either a Color object to copy, integral number for the red channel 
                        or a hex color value or undefined
    @param[in] pG - The 0-255 number for x channel (Integral number) or undefined 
    @param[in] pB - The 0-255 number for x channel (Integral number) or undefined
    @param[in] pA - The 0-1 scale for the alpha channel, or number

    Example:

    //Create a color
    var col = new Color(otherColor);        //Result - r = otherCol.r
                                                       g = otherCol.g
                                                       b = otherCol.b
    OR                                                 a = otherCol.a
    var col = new Color(255, 0, 0, 1);      //Result - r = 255, g = 0, b = 0, a = 1
    OR
    var col = new Color("#FF0000FF");       //Result - r = 255, g = 0, b = 0, a = 1
    OR
    var col = new Color("#FF0000");         //Result - r = 255, g = 0, b = 0, a = 1
    OR
    var col = new Color("#F00F");           //Result - r = 255, g = 0, b = 0, a = 1
    OR
    var col = new Color("#F00");            //Result - r = 255, g = 0, b = 0, a = 1
    OR
    var col = new Color();                  //Result - r = 0, g = 0, b = 0, a = 1
*/
function Color(pFirst, pG, pB, pA) {
    //Switch on the type of the first parameter
    switch (typeof pFirst) {
        case "number":
            this.setRGBA(pFirst, pG, pB, pA);
            break;
        case "string":
            this.hex = pFirst;
            break;
        case "object":
            if (pFirst instanceof Color) {
                this.r = pFirst.r;
                this.g = pFirst.g;
                this.b = pFirst.b;
                this.a = pFirst.a;
                break;
            }
        default:
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.a = 1;
            break;
    }
};

ExtendProperties(Color, {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                               Property Definitions                                         ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Color : clone - Create a copy of the Color object
        28/07/2016

        @return Color - Returns a new Color object with the same values as the current

        Example:

        //Copy the players color
        var bulletColor = playerColor.clone;
    */
    get clone() {
        return new Color(this);
    },

    /*
        Color : hex - Get the value of the color object as a hex string (No alpha)
        28/07/2016

        @return string - Returns a string contanining the hexidecimal value of the color (Return format "#RRGGBB")

        Example:

        //Set context draw color
        canvasContext.fillStyle - myColor.hex;
    */
    get hex() {
        //Get the color values
        var rString = this.r.toString(16);
        if (rString.length === 1) rString = "0" + rString;

        var gString = this.g.toString(16);
        if (gString.length === 1) gString = "0" + gString;

        var bString = this.b.toString(16);
        if (bString.length === 1) bString = "0" + bString;

        //Compile the string
        return "#" + rString + gString + bString;
    },

    /*
        Color : hex - Set the values of the color object to that of a Hex definition (RGBA)
        28/07/2016

        @param[in]  pHex - The string that holds the color value in the format "#RRGGBBAA"

        @return this - Returns itself once the function has ended

        Example:

        //Set the color object to red
        myColor.hex = "#FF0000FF";
        OR
        myColor.hex = "#FF0000";            
        OR
        myColor.hex = "#F00F";
        OR
        myColor.hex = "#F00";           
    */
    set hex(pHex) {
        //Check first character is # classification
        if (pHex[0] !== "#") return this;

        //Set default values
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;

        //Extract the color value (Skip the #)
        pHex = pHex.substring(1);

        //Calculate the jump rate
        var skipRate = (pHex.length > 5 ? 2 : 1);

        //Store the loop ceiling
        var CEIL = Math.floor(pHex.length / skipRate);

        //Loop through components
        for (var i = 0; i < CEIL; i++) {
            //Get the component
            var compString = pHex.substring(i * skipRate, i * skipRate + skipRate);

            //Format single characters
            if (compString.length === 1) compString += compString;

            //Convert to number value
            var compNum = parseInt(compString, 16);

            //Set the value
            switch (i) {
                case 0: //r
                    this.r = compNum;
                    break;
                case 1: //g
                    this.g = compNum;
                    break;
                case 2: //b
                    this.b = compNum;
                    break;
                case 3: //a
                    this.a = compNum / 255;
                    break;
            }
        }

        //Return itself
        return this;
    },

    /*
        Color : rgb - Converts the containined Color object into an RGB string (No alpha)
        28/07/2016

        @return string - Returns the RGB color as a string (Return format "rgb(rrr, ggg, bbb)")

        Example:

        Set context draw color
        canvasContext.fillStyle = myColor.rgb;
    */
    get rgb() {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    },

    /*
        Color : rgba - Converts the containined Color object into an RGBA string
        28/07/2016

        @return string - Returns the RGBA color as a string (Return format "rgba(rrr, ggg, bbb, a.aaa)")

        Example:

        //Set context draw color
        canvasContext.fillStyle = myColor.rgba;
    */
    get rgba() {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////                                                                                                            ////
    /////                                                   Main Functions                                           ////
    /////                                                                                                            ////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
        Color : set - Set the values of the current Color object to that of the passed in color object
        28/07/2016

        @param[in] pCol - The Color object to copy the values of

        @return this - Returns itself once the function has ended

        Example:

        //Copy the color of another object
        myColor.set(myOtherColor);
    */
    set: function(pCol) {
        //Copy the values
        this.r = pCol.r;
        this.g = pCol.g;
        this.b = pCol.b;
        this.a = pCol.a;

        //Return itself
        return this;
    },

    /*
        Color : setRGBA - Set the values of the Color object to the specified R, G, B and A channel values
        28/07/2016

        @param[in] pR - The 0-255 integral number for the red channel (Default 0)
        @param[in] pG - The 0-255 integral number for the green channel (Default 0)
        @param[in] pB - The 0-255 integral number for the blue channel (Default 0)
        @param[in] pA - The 0-1 scale for the alpha channel (Default 1)

        @return this - Returns itself once the function has ended

        Example:

        //Set the color object to green
        myColor.setRGBA(0, 255, 0, 1);
    */
    setRGBA: function(pR, pG, pB, pA) {
        //Set values based on the parameter
        this.r = (typeof pR === "number" ? pR : 0);
        this.g = (typeof pG === "number" ? pG : 0);
        this.b = (typeof pB === "number" ? pB : 0);
        this.a = (typeof pA === "number" ? pA : 1);

        //Return itself
        return this;
    },

    /*
        Color : randomize - Randomize the color value containined by this Color object
        28/07/2016

        @param[in] pAlpha - A bool flag indicating if a random alpha value should be generated

        @return this - Returns itself once the function has ended

        Example:

        //Get a random color
        myColor.randomize(true);
    */
    randomize: function(pAlpha) {
        //Set the random color
        this.hex = "#" + Math.floor(Math.random() * 16777215).toString(16);

        //Assign the alpha value
        this.a = (typeof pAlpha === "boolean" && pAlpha ? Math.random() : 1);

        //Return itself
        return this;
    },

    /*
        Color : lerp - Linearly interpolate color values between the current Color 
                       object and an end point
        09/08/2016

        @param[in] pEnd - The end point of the interpolation (pT of 1 returns this)
        @param[in] pT - The scale with to interpolate between the two Color objects (Between 0 - 1)

        @return Color - Returns the interpolated values as a new Color object

        Example:

        //Blend red and green over time
        var blended = red.lerp(green, (Math.sin(Date.now() * 0.001) + 1) / 2);
    */
    lerp: function(pEnd, pT) {
        return new Color(Math.round(this.r + (pEnd.r - this.r) * pT),
            Math.round(this.g + (pEnd.g - this.g) * pT),
            Math.round(this.b + (pEnd.b - this.b) * pT),
            this.a + (pEnd.a - this.a) * pT);
    },
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                            ////
/////                                                  General Functions                                         ////
/////                                                                                                            ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
    colorLerp - Returns a color object which has been linearly interpolated between a pStart 
                and pEnd point by pT
    28/07/2016

    @param[in] pStart - The starting point of the interpolation (pT of 0 returns this)
    @param[in] pEnd - The end point of the interpolation (pT of 1 returns this)
    @param[in] pT - The scale with which to interpolate between the two Color objects (Between 0 - 1)

    @return Color - Returns the interpolated values as a new Color object

    Example:

    //Blend red and green over time
    var blended = colorLerp(red, green, (Math.sin(Date.now() * 0.001) + 1) / 2);
*/
function colorLerp(pStart, pEnd, pT) {
    return new Color(Math.round(pStart.r + (pEnd.r - pStart.r) * pT),
        Math.round(pStart.g + (pEnd.g - pStart.g) * pT),
        Math.round(pStart.b + (pEnd.b - pStart.b) * pT),
        pStart.a + (pEnd.a - pStart.a) * pT);
};

/*
    randomColor : Returns a random color as a hex code
    28/07/2016

    @return string - Returns a string with the hex color value (Format "#RRGGBB")

    Example:

    //Set context draw color
    canvasContext.fillStyle = randomColor();
*/
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
};