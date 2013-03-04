var assert = require('assert');

var compiler = require('../lib/compiler.js');
/*
INFO: according to http://www.masswerk.at/6502/6502_instruction_set.html
there is no immediate address mode. That opcode is for accumulator address
mode.

exports.test_rol_imm = function(test){
    var tokens = compiler.lexical('ROL #10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x2a, 0x10]);
    test.done();
};
*/

exports.test_rol_acc = function(test){
    var tokens = compiler.lexical('ROL A');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ACCUMULATOR', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ACCUMULATOR', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x2a]);
    test.done();
};


exports.test_rol_zp = function(test){
    var tokens = compiler.lexical('ROL $00');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x26, 0x00]);
    test.done();
};

exports.test_rol_zpx = function(test){
    var tokens = compiler.lexical('ROL $10,X');
    test.equal(4 , tokens.length);
    var token = tokens[0];
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x36, 0x10]);
    test.done();
};

exports.test_rol_abs = function(test){
    var tokens = compiler.lexical('ROL $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x2e, 0x34, 0x12]);
    test.done();
};

exports.test_rol_absx = function(test){
    var tokens = compiler.lexical('ROL $1234,X');
    test.equal(4 , tokens.length);
    var token = tokens[0];
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x3e, 0x34, 0x12]);
    test.done();
};