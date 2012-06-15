(function(exports){

var palette = [
    0x788084, 0x0000fc, 0x0000c4, 0x4028c4,
    0x94008c, 0xac0028, 0xac1000, 0x8c1800,
    0x503000, 0x007800, 0x006800, 0x005800,
    0x004058, 0x000000, 0x000000, 0x000008,

    0xbcc0c4, 0x0078fc, 0x0088fc, 0x6848fc,
    0xdc00d4, 0xe40060, 0xfc3800, 0xe46918,
    0xac8000, 0x00b800, 0x00a800, 0x00a848,
    0x008894, 0x2c2c2c, 0x000000, 0x000000,

    0xfcf8fc, 0x38c0fc, 0x6888fc, 0x9c78fc,
    0xfc78fc, 0xfc589c, 0xfc7858, 0xfca048,
    0xfcb800, 0xbcf818, 0x58d858, 0x58f89c,
    0x00e8e4, 0x606060, 0x000000, 0x000000,

    0xfcf8fc, 0xa4e8fc, 0xbcb8fc, 0xdcb8fc,
    0xfcb8fc, 0xf4c0e0, 0xf4d0b4, 0xfce0b4,
    0xfcd884, 0xdcf878, 0xb8f878, 0xb0f0d8,
    0x00f8fc, 0xc8c0c0, 0x000000, 0x000000
];

exports.get_color = function(index){
    return palette[index];
};

exports.load_sprites = function(file){
    var chr;
    if (typeof jQuery !== 'undefined'){
        jQuery.ajax({
            url: file,
            xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    if (typeof xhr.overrideMimeType !== 'undefined') {
                        xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    }
                    self.xhr = xhr;
                    return xhr;
                },
            complete: function(xhr, status) {
                    chr = xhr.responseText;
                },
            async: false
        });          
    } else {
        var fs = require('fs');
        chr = fs.readFileSync(file, 'binary');
    }
    var sprites = [];
    for (var i = 0; i < chr.length ; i++){
        sprites.push(chr.charCodeAt(i) & 0xFF);
    }
    return sprites;
};

exports.get_sprite = function(index, sprites){
    var iA = index * 16;
    var iB = iA + 8;
    var iC = iB + 8;
    var channelA = sprites.slice(iA, iB);
    var channelB = sprites.slice(iB, iC);
    return exports.decode_sprite(channelA, channelB);
};

exports.decode_sprite = function(channelA, channelB){
    var sprite = [];
    for (var y=0; y <8; y++){
        var a = channelA[y];
        var b = channelB[y];
        var line = [];
        for (var x=0; x <8; x++){
            var bit = Math.pow(2,7-x);
            var pixel = -1;
            if (!(a & bit) && !(b & bit)){
                pixel = 0;
            } else if ((a & bit) && !(b & bit)){
                pixel = 1;
            } else if (!(a & bit) && (b & bit)){
                pixel = 2;
            } else if ((a & bit) && (b & bit)){
                pixel = 3;
            }
            line.push(pixel);
        }
        sprite.push(line);
    }
    return sprite;
};

exports.put_sprite = function (index, sprites, spr){
    var start = index * 16;
    var encoded = exports.encode_sprite(spr);
    for (var i=start; i < 16; i++){
        sprites[i] = encoded[i];
    }
    return sprites;
};

exports.encode_sprite = function(spr){
    var channelA = [];
    var channelB = [];
    for (var y=0; y <8; y++){
        var a = 0;
        var b = 0;
        for (var x=0; x < 8; x++){
            var pixel = spr[y][x];
            var bit = Math.pow(2,7-x);
            switch(pixel){
                case 1:
                    a = a | bit;
                    break;
                case 2:
                    b = b | bit;
                    break;
                case 3:
                    a = a | bit;
                    b = b | bit;
                    break;
            }
        }
        channelA.push(a);
        channelB.push(b);
    }
    return channelA.concat(channelB);
};

})(typeof exports === 'undefined'? this['sprite']={}: exports);
