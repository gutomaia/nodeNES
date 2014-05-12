var fs = require('fs');
var sprite = require('../lib/sprite.js');
var utils = require('../lib/utils');

exports.setUp = function (callback) {
    utils.path = __dirname + '/../static/example/scrolling/';
    callback();
};

exports.test_load_sprites = function (test) {
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }
    var sprites = sprite.load_sprites('mario.chr');
    test.deepEqual(bin, sprites);
    test.done();
};

exports.test_decode_first_sprite = function (test) {
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }
    var channelA = bin.slice(0, 8);
    var channelB = bin.slice(8, 16);

    var s1 = sprite.decode_sprite(channelA, channelB);

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

exports.test_decode_second_sprite = function (test) {
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }
    var channelA = bin.slice(16, 24);
    var channelB = bin.slice(24, 32);

    var s1 = sprite.decode_sprite(channelA, channelB);

    var mario =
    [
        [1,1,1,0,0,0,0,0],
        [1,1,2,0,0,0,0,0],
        [1,2,2,0,0,0,0,0],
        [1,1,1,1,1,1,0,0],
        [3,2,2,2,0,0,0,0],
        [3,3,2,2,2,2,0,0],
        [2,2,2,2,2,2,2,0],
        [2,2,3,2,2,2,2,0]
    ];

    test.deepEqual(mario, s1);
    test.done();
};


exports.test_get_first_sprite = function (test) {
    var sprites = sprite.load_sprites('mario.chr', 'binary');
    var s1 = sprite.get_sprite(0, sprites);

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

exports.test_get_second_sprite = function (test) {
    var sprites = sprite.load_sprites('mario.chr', 'binary');
    var s2 = sprite.get_sprite(1, sprites);

    var mario =
    [
        [1,1,1,0,0,0,0,0],
        [1,1,2,0,0,0,0,0],
        [1,2,2,0,0,0,0,0],
        [1,1,1,1,1,1,0,0],
        [3,2,2,2,0,0,0,0],
        [3,3,2,2,2,2,0,0],
        [2,2,2,2,2,2,2,0],
        [2,2,3,2,2,2,2,0]
    ];

    test.deepEqual(mario, s2);
    test.done();
};

exports.test_encode_first_sprite = function (test) {
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
    var encoded = sprite.encode_sprite(mario);

    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }

    var expected = bin.slice(0, 16);

    test.equal(expected.length, encoded.length);

    test.deepEqual(expected, encoded);
    test.done();
};

exports.test_put_first_sprite = function(test){
    var sprites = sprite.load_sprites('mario.chr', 'binary');
    var expected =
    [
        [0,1,2,3,0,1,2,3],
        [1,0,1,2,3,0,1,2],
        [2,1,0,1,2,3,0,1],
        [3,2,1,0,1,2,3,0],
        [0,3,2,1,0,1,2,3],
        [1,0,3,2,1,0,1,2],
        [2,1,0,3,2,1,0,1],
        [3,2,1,0,3,2,1,0]
    ];
    sprites = sprite.put_sprite(0, sprites, expected);
    var s1 = sprite.get_sprite(0, sprites);
    test.deepEqual(expected, s1);
    test.done();

};

exports.test_put_second_sprite = function(test){
    var sprites = sprite.load_sprites('mario.chr', 'binary');
    var expected =
    [
        [0,1,2,3,0,1,2,3],
        [1,0,1,2,3,0,1,2],
        [2,1,0,1,2,3,0,1],
        [3,2,1,0,1,2,3,0],
        [0,3,2,1,0,1,2,3],
        [1,0,3,2,1,0,1,2],
        [2,1,0,3,2,1,0,1],
        [3,2,1,0,3,2,1,0]
    ];
    sprites = sprite.put_sprite(1, sprites, expected);
    var s2 = sprite.get_sprite(1, sprites);
    test.deepEqual(expected, s2);
    test.done();

};
