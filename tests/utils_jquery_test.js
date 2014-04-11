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

/*
TODO: Fix this
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
*/


exports.test_load_sprites_with_fake_jquery = function(test){

    var XMLHttpResponse = function (){
        this.mimeType = 'text/pain';
        this.responseText = "something else";
    };

    XMLHttpResponse.prototype.overrideMimeType = function (mimeType){
        this.mimeType = mimeType;
    };

    var $ = function (){
        this.ajaxSettings = {};
        this.ajaxSettings.xhr = function() {return new XMLHttpResponse();};
        this.xhr = this.ajaxSettings.xhr();
    };

    $.prototype.ajax = function (data){
        global.self = this;
        data.xhr();
        this.xhr.responseText = fs.readFileSync(__dirname + '/../static/example/scrolling/' + data.url, 'binary');
        data.complete(this.xhr, 200);
        global.self = undefined;
    };

    var jq = new $();

    global.jQuery = jq;
    global.$ = global.jQuery;

    var sprites = sprite.load_sprites('mario.chr');

    global.jQuery = undefined;
    global.$ = undefined;

    test.equal(jq.xhr.mimeType, 'text/plain; charset=x-user-defined');

    var chr = fs.readFileSync(__dirname + '/../static/example/scrolling/mario.chr', 'binary');

    test.equal(jq.xhr.responseText, chr);

    var bin = [];
    for (var i = 0; i < chr.length ; i++){
        bin.push(chr.charCodeAt(i) & 0xFF);
    }

    test.deepEqual(bin, sprites);
    test.done();
};

exports.test_write_file = function(test){
    var filename = '/tmp/hello.tmp';
    utils.write_file(filename, 'world');
    var text = fs.readFileSync('/tmp/hello.tmp', 'binary');
    test.equal('world', text);
    test.done();
};
