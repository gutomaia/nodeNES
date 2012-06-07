var assert = require('assert');
var fs = require('fs');
var sprite = require('../src/sprite.js');

exports.test_first_sprite = function(test){
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }
    var channelA = bin.slice(0, 8);
    var channelB = bin.slice(8, 16);

    var s1 = sprite.get_sprite(channelA, channelB);

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

    test.deepEqual(mario, s1);
    test.done();
};