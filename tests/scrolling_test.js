var assert = require('assert');
var fs = require('fs');
var sys = require('util');

var compiler = require('../lib/compiler.js');
var utils = require('../lib/utils.js');


exports.test_get_labels = function(test){
    var code = fs.readFileSync(__dirname + '/../static/example/scrolling/scrolling5.asm', 'utf8');
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    var labels = compiler.get_labels(ast);
    test.equal(0xe000, labels.palette, 'invalid pallete');
    test.equal(0xe000 + 32, labels.sprites);
    test.equal(0xe030, labels.columnData);
    test.equal(0xf030, labels.attribData);
    test.done();
};

exports.test_asm_compiler_scrolling_1 = function(test){
    utils.path = 'static/example/scrolling/';
    var code = fs.readFileSync(__dirname + '/../static/example/scrolling/scrolling1.asm', 'utf8');
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast, true);
    var data = String.fromCharCode.apply(undefined, opcodes);
    var expected = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling1.nes', 'binary');

    test.equal(expected, data);

    test.done();
};

exports.test_asm_compiler_scrolling_2 = function(test){
    //utils.path = 'static/example/scrolling/';
    var code = fs.readFileSync(__dirname + '/../static/example/scrolling/scrolling2.asm', 'utf8');
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast, true);
    var data = String.fromCharCode.apply(undefined, opcodes);
    var expected = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling2.nes', 'binary');

    test.equal(expected, data);

    test.done();
};

exports.test_asm_compiler_scrolling_3 = function(test){
    //utils.path = 'static/example/scrolling/';
    var code = fs.readFileSync(__dirname + '/../static/example/scrolling/scrolling3.asm', 'utf8');
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast, true);
    var data = String.fromCharCode.apply(undefined, opcodes);
    var expected = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling3.nes', 'binary');

    test.equal(expected, data);

    test.done();
};

exports.test_asm_compiler_scrolling_4 = function(test){
    //utils.path = 'static/example/scrolling/';
    var code = fs.readFileSync(__dirname + '/../static/example/scrolling/scrolling4.asm', 'utf8');
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast, true);
    var data = String.fromCharCode.apply(undefined, opcodes);
    var expected = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling4.nes', 'binary');

    test.equal(expected, data);

    test.done();
};

exports.test_asm_compiler_scrolling_5 = function(test){
    utils.path = 'static/example/scrolling/';
    var code = fs.readFileSync(__dirname + '/../static/example/scrolling/scrolling5.asm', 'utf8');
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast, true);
    var data = String.fromCharCode.apply(undefined, opcodes);
    var expected = fs.readFileSync(__dirname + '/../fixtures/scrolling/scrolling5.nes', 'binary');

    test.equal(expected, data);

    test.done();
};
