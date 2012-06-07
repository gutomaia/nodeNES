(function(exports){

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

})(typeof exports === 'undefined'? this['sprite']={}: exports);
