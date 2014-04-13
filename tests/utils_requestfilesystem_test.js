var assert = require('assert');
var fs = require('fs');
var sinon = require('sinon');
var utils = require('../lib/utils.js');

var BlobImpl = function (byteArray, options){
    this.byteArray = byteArray;
};

BlobImpl.prototype.toString = function (){
    var str = '';
    for (var ba in this.byteArray){
        str += String.fromCharCode.apply(null, this.byteArray[ba]);
    }
    return str;
};

var FileNode = function(){};

FileNode.prototype.getFile = function (filename, options, callback, errorCallback){
    this.filename = filename;
    this.options = options;
    try {
        callback(this);
    } catch (e){
        errorCallback(e);
    }
};

function Writer (filename){
    this.filename = filename;
}

Writer.prototype.onwriteend = function(){};

Writer.prototype.onerror = function(){};

Writer.prototype.write = function (blob, options){
    fs.writeFileSync(this.filename, blob.toString(), 'binary');
};

FileNode.prototype.createWriter = function (callback){
    callback(new Writer(this.filename, this.options));
};


var FileSystem = function(){
    this.root = new FileNode();
};

var Window = function(){};

Window.prototype.webkitRequestFileSystem = function (type, size, oninit, onerror, handler){
    oninit(new FileSystem());
};

exports.setUp = function (callback) {
    this.filename = '/tmp/hello.tmp';
    if (fs.existsSync(this.filename)){
        fs.unlinkSync(this.filename);
    }
    this.w = new Window();
    global.Blob = BlobImpl;
    global.TEMPORARY = 0;
    global.window = this.w;

    callback();
};

exports.tearDown = function(callback){
    global.Blob = undefined;
    global.TEMPORARY = undefined;
    global.window = undefined;

    callback();
};

exports.test_open_file_with_request_file_system = function(test){
    utils.write_nesfile(this.filename, 'world');
    test.ok(fs.existsSync(this.filename));
    var hl = fs.readFileSync(this.filename, 'binary');
    test.equal('world', hl);
    test.done();
};