var assert = require('assert');

var sinon = require('sinon');

var sprite = require('../lib/sprite.js');

exports.test_load_sprites_with_mocked_jquery = function(test){
    var jQuery = {};
    jQuery.ajax = sinon.spy();
    var sprites = sprite.open_file_with_jquery('mario.chr', jQuery);
    test.ok(jQuery.ajax.calledOnce);
    test.done();
};
