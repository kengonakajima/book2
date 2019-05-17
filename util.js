uint8array2utf8string=function(u8array) {
    var result = "";
    var i = 0;
    var c = c1 = c2 = 0;
    // Perform byte-order check.
    if( u8array.length >= 3 ) {
        if( ( u8array[0] & 0xef) == 0xef
            && (u8array[1] & 0xbb) == 0xbb
            && (u8array[2] & 0xbf) == 0xbf ) {
            // Hmm byte stream has a BOM at the start, we'll skip this.
            i= 3;
        }
    }
    while( i < u8array.length ) {
        c = u8array[i]&0xff;
        if( c < 128 ) {
            result += String.fromCharCode(c);
            i++;
        } else if( (c > 191) && (c < 224) ) {
            if( i+1 >= u8array.length ) {
                throw "Un-expected encoding error, UTF-8 stream truncated, or incorrect-A";
            }
            c2 = u8array[i+1] & 0xff;
            result += String.fromCharCode( ((c&31)<<6) | (c2&63) );
            i+=2;
        } else {
            if( i+2 >= u8array.length  || i+1 >= u8array.length ) {
                throw "Un-expected encoding error, UTF-8 stream truncated, or incorrect-B. i:" + i + " l:" + u8array.length;
            }
            c2 = u8array[i+1] & 0xff;
            c3 = u8array[i+2] & 0xff;
            result += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
            i+=3;
        }
    }
    return result;
}
utf8string2uint8array=function(s) {
    s = s.replace(/\r\n/g,"\n");
    var utftext = [];
    for (var n = 0; n < s.length; n++) {
        var c = s.charCodeAt(n);
        if (c < 128) {
            utftext[utftext.length]= c;
        } else if((c > 127) && (c < 2048)) {
            utftext[utftext.length]= (c >> 6) | 192;
            utftext[utftext.length]= (c & 63) | 128;
        } else {
            utftext[utftext.length]= (c >> 12) | 224;
            utftext[utftext.length]= ((c >> 6) & 63) | 128;
            utftext[utftext.length]= (c & 63) | 128;
        }
    }
    var u8a = new Uint8Array(utftext.length);
    for(var i=0;i<utftext.length;i++) {
        u8a[i] = utftext[i];
    }
    return u8a;
}

nodeBufferToArrayBuffer=function(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) view[i] = buf[i];
    return ab;
}
