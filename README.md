#simplePNG.js

Example: http://jsfiddle.net/M8R68/

#Methods

Parameters in italics are optional

* _object_.init(width,height_,r,g,b_) - Initilises the PNG object and sets a background colour
* _object_.getPixels() - Returns array of pixel RGB data
* _object_.setPixels(array) - Sets RGB pixel data
* _object_.setPixel(x,y_,r,g,b_) - Sets colour of pixel at x,y
* _object_.fill(_r,g,b_) - Fills image with single colour
* _object_.setColour(r,g,b) - Sets cursor colour for fill and setPixel
* _object_.output(_raw_) - Returns base64 encoded PNG data URI, or raw PNG data
