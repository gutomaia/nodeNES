var assert = require('assert');
var fs = require('fs');
var sinon = require('sinon');
var sprite = require('../lib/sprite.js');


exports.test_open_file_with_jquery = function(test){
    var jQuery = {};
    jQuery.ajax = sinon.spy();
    var sprites = sprite.open_file_with_jquery('mario.chr', jQuery);
    test.ok(jQuery.ajax.calledOnce);
    test.done();
};

exports.test_load_sprites_with_mocked_jquery = function(test){
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    global.jQuery = {};
    sinon.stub(sprite, 'open_file_with_jquery');
    sprite.open_file_with_jquery.withArgs('mario.chr').returns(chr);
    var sprites = sprite.load_sprites('mario.chr');
    test.ok(sprite.open_file_with_jquery.calledOnce);
    global.jQuery = undefined;
    test.done();
};
