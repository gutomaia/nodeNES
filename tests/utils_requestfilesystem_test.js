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

FileNode.prototype.toURL = function(){
    return 'filesystem:http://localhost:8888/temporary/' + this.filename;
};

function Writer (filename){
    this.filename = filename;
}

Writer.prototype.onwriteend = function(){};

Writer.prototype.onerror = function(){};

Writer.prototype.write = function (blob, options){
    try {
        fs.writeFileSync(this.filename, blob.toString(), 'binary');
        this.onwriteend();
    } catch (e){
        this.onerror(e);
    }
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
    var is_written = false;
    var filename = this.filename;
    var url = "filesystem:http://localhost:8888/temporary//tmp/hello.tmp";

    utils.on_write_end = function(f, u){
        is_written = true;
        test.equal(filename, f);
        test.equal(url, u);
    };

    utils.write_file(filename, 'world');

    test.ok(is_written);
    test.ok(fs.existsSync(filename));
    var hl = fs.readFileSync(filename, 'binary');
    test.equal('world', hl);
    test.done();
};

exports.test_write_file_with_write_error = function(test){
    var have_erros = false;

    utils.on_error = function (e){
        have_erros = true;
    };

    var st = sinon.stub(fs, 'writeFileSync');
    st.onFirstCall().throws("Error");

    utils.write_file(this.filename, 'error');

    test.ok(have_erros);
    test.done();
};

exports.test_on_get_file_call_error_callback = function(test){
    var have_erros = false;

    utils.on_error = function (e){
        have_erros = true;
    };

    var before = FileNode.prototype.createWriter;
    FileNode.prototype.createWriter = function (){throw "error";};
    utils.write_file(this.filename, 'error');
    FileNode.prototype.createWriter = before;

    test.ok(have_erros);
    test.done();
};