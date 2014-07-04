/*
	snkenjoi at gmail dot com
*/

function simplePNG() {
	var crc_table = [];
	var header = "\x89PNG\x0d\x0a\x1a\x0a";
	var prefix = "data:image/png;base64,";
	var width, height, pixels;
	var cc = [0,0,0]; // cursor colour
	
	// make crc table
	var c,n,k;
	for (n = 0; n < 256; n++) {
		c = n;
		for (k = 0; k < 8; k++) {
			if ((c & 1) == 1) c = 0xedb88320 ^ (c >>> 1);
			else c = c >>> 1;
		}
		crc_table[n] = c;
	}
	
	var byte_data = function(dec,bytes) {
		for (var out='';bytes>0;bytes--) out+=String.fromCharCode((dec>>((bytes-1)*8)) & 255);
		return out;
	}
	
	var crc32 = function(str) {
		var c = 0xFFFFFFFF;
		for (var i = 0; i < str.length; i++) {
			c = crc_table[(c ^ str.charCodeAt(i)) & 255] ^ (c >>> 8);
		}
		return byte_data(c ^ 0xFFFFFFFF,4);
	}
	
	var adler32 = function(str) {
		var base = 65521;
		var a = 1;
		var b = 0;
		for (i = 0;i < str.length;i++) {
			a = (a + str.charCodeAt(i)) % base;
			b = (b + a) % base;
		}
		return byte_data((b << 16) | a,4);
	}
	
	var data_header = function(a) {
		var out = byte_data(0x081D01,3); // ???
		b = ~a & 0xffff;
		out += byte_data(a & 0xff,1);
		out += byte_data((a & 0xff00) >> 8,1);
		out += byte_data(b & 0xff,1);
		out += byte_data((b & 0xff00) >> 8,1);
		return out;
	}
	
	var IHDR = function(w,h,depth,colour,comp,filter,iface) {
		var out = "IHDR"; // chunk type
		out += byte_data(w,4)+byte_data(h,4)+byte_data(depth,1)+byte_data(colour,1)+byte_data(comp,1)+byte_data(filter,1)+byte_data(iface,1); // data
		out += crc32(out);
		out = byte_data(13,4) + out; // length of data bytes
		return out;
	}
	
	var IDAT = function(data) {
		var name = "IDAT";
		return byte_data(data.length,4)+name+data+crc32(name+data);
	}
	
	var IEND = function() {
		return byte_data(0,4)+"IEND"+crc32("IEND");
	}
	
	this.init = function(x,y,r,g,b) {
		width=x;
		height=y;
		r = r==null?255:r;
		g = g==null?255:g;
		b = b==null?255:b;
		pixels = new Array(width*height);
		for (var i=0;i<pixels.length;i++) pixels[i] = [r,g,b];
	}
	
	this.getPixels = function() {
		return pixels;
	}
	
	this.setPixels = function(a) {
		pixels = a;
	}
	
	this.setPixel = function(x,y,r,g,b) {
		pixels[x+(y*width)] = [r==null?cc[0]:r,g==null?cc[1]:g,b==null?cc[2]:b];
	}
	
	this.setColour = function(r,g,b) {
		cc = [r,g,b];
	}
	
	this.fill = function(r,g,b) {
		for (var i=0;i<pixels.length;i++) pixels[i] = [r==null?cc[0]:r,g==null?cc[1]:g,b==null?cc[2]:b];
	}
	
	this.output = function(raw) {
		var out = header+IHDR(width,height,8,2,0,0,0);
		var data = '';
		for (i=0;i<pixels.length;i++) {
			if(!(i%width)) { data += byte_data(0x00,1); } // filter
			data += byte_data(pixels[i][0],1); // r
			data += byte_data(pixels[i][1],1); // g
			data += byte_data(pixels[i][2],1); // b
		}
		
		var head = data_header(data.length);
		var adler = adler32(data);
		data = head + data + adler;
		
		while (data.length >= 0x2000) { // split datastream into multiple chunnks
			out += IDAT(data.substr(0,0x2000)); 
			data = data.substr(0x2000);
		}
		
		out += IDAT(data); 
		out += IEND();
		return raw?out:prefix+btoa(out);
	}
}