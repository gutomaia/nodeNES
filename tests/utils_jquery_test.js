var assert = require('assert');
var fs = require('fs');
var sinon = require('sinon');
var sprite = require('../lib/sprite.js');
var utils = require('../lib/utils.js');

exports.test_open_file_with_jquery = function(test){
    var jQuery = {};
    jQuery.ajax = sinon.spy();
    var sprites = utils.open_file_with_jquery('mario.chr', jQuery);
    test.ok(jQuery.ajax.calledOnce);
    test.done();
};

exports.test_load_sprites_with_mocked_jquery = function(test){
    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    global.jQuery = {};
    sinon.stub(utils, 'open_file_with_jquery');
    utils.open_file_with_jquery.withArgs('mario.chr').returns(chr);
    var sprites = sprite.load_sprites('mario.chr');
    global.jQuery = undefined;
    test.ok(utils.open_file_with_jquery.calledOnce);
    test.done();
};

exports.test_load_sprites_with_fake_jquery = function(test){

    var XMLHttpResponse = function (){
        this.overrideMimeType = 'text/pain';
        this.responseText = "something";
    };

    var $ = function (){
        this.ajaxSettings = {};
        this.ajaxSettings.xhr = new XMLHttpResponse();
    };

    $.ajax = function (data){
        data.xhr();
        this.xhr.responseText = fs.readFileSync(__dirname + '/../static/example/scrolling/' + data.url, 'binary');
        data.complete($.xhr, 200);
    };

    global.jQuery = new $();
    global.$ = global.jQuery;
    var sprites = sprite.load_sprites('mario.chr');
    global.jQuery = undefined;
    global.$ = undefined;

    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');
    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }

    test.deepEqual(bin, sprites);
    test.done();
};
