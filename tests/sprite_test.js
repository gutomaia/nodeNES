var assert = require('assert');
var fs = require('fs');
var Buffer = require('buffer').Buffer;

var sys = require('util');

var compiler = require('../src/sprite.js');

exports.test_first_sprite = function(test){
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }
    var channelA = bin.slice(0, 8);
    var channelB = bin.slice(8, 16);

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

    var mario =
    [
        [0,0,0,0,0,0,1,1],
        [0,0,0,0,1,1,1,1],
        [0,0,0,1,1,1,1,1],
        [0,0,0,1,1,1,1,1],
        [0,0,0,3,3,3,2,2],
        [0,0,3,2,2,3,2,2],
        [0,0,3,2,2,3,3,2],
        [0,3,3,2,2,3,3,2]
    ];

    test.deepEqual(mario, sprite);
    test.done();
};