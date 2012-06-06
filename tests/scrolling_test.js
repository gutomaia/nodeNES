var assert = require('assert');
var fs = require('fs');
var Buffer = require('buffer').Buffer;

var sys = require('util');

var compiler = require('../src/compiler.js');

var lines = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling5.asm', 'utf8').split('\n');
lines.length = 276;

var code = lines.join('\n');

var bin = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling5.nes', 'binary');

exports.test_asm_compiler = function(test){
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    opcodes = compiler.semantic(ast, true);
    fs.open(__dirname + '/../fixtures/scrolling/test_scrolling.nes', 'w', function(status, fd) {
        var buffer = new Buffer(opcodes);
        fs.writeSync(fd, buffer, 0, opcodes.length, 0);
    });
    test.done();
};