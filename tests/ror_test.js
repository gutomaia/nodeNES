var assert = require('assert');

var compiler = require('../lib/compiler.js');

/*
INFO: according to http://www.masswerk.at/6502/6502_instruction_set.html
there is no immediate address mode. That opcode is for accumulator address
mode.

exports.test_ror_imm = function(test){
    var tokens = compiler.lexical('ROR #10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x6a, 0x10]);
    test.done();
};
*/

exports.test_ror_acc = function(test){
    var tokens = compiler.lexical('ROR A');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ACCUMULATOR', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ACCUMULATOR', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x6a]);
    test.done();
};


exports.test_ror_zp = function(test){
    var tokens = compiler.lexical('ROR $00');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x66, 0x00]);
    test.done();
};

exports.test_ror_zpx = function(test){
    var tokens = compiler.lexical('ROR $10,X');
    test.equal(4 , tokens.length);
    token = tokens[0];
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x76, 0x10]);
    test.done();
};

exports.test_ror_abs = function(test){
    var tokens = compiler.lexical('ROR $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x6e, 0x34, 0x12]);
    test.done();
};

exports.test_ror_absx = function(test){
    var tokens = compiler.lexical('ROR $1234,X');
    test.equal(4 , tokens.length);
    token = tokens[0];
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x7e, 0x34, 0x12]);
    test.done();
};