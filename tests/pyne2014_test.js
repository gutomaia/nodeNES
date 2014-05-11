var fs = require('fs');

var sys = require('util');

var compiler = require('../lib/compiler.js');

var utils = require('../lib/utils.js');

var code = fs.readFileSync(__dirname + '/../static/example/pyne2014/pyne2014.asm', 'utf8');

var bin = fs.readFileSync(__dirname + '/../fixtures/pyne2014/pyne2014.nes', 'binary');

exports.test_nes_compiler = function (test) {
    utils.path = 'static/example/pyne2014/';
    var rom = compiler.nes_compiler(code);
    test.deepEqual(bin, rom);
    test.done();
};
