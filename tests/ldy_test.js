var assert = require('assert');

var compiler = require('../src/compiler.js');

exports.test_ldy_imm = function(test){
    var tokens = compiler.lexical('LDY #10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xa0, 0x10]);
    test.done();
};
exports.test_ldy_zp = function(test){
    var tokens = compiler.lexical('LDY $00');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xa4, 0x00]);
    test.done();
};
exports.test_ldy_zpx = function(test){
    var tokens = compiler.lexical('LDY $10,X');
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
    test.deepEqual(code, [0xb4, 0x10]);
    test.done();
};
exports.test_ldy_abs = function(test){
    var tokens = compiler.lexical('LDY $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xac, 0x34, 0x12]);
    test.done();
};
exports.test_ldy_absx = function(test){
    var tokens = compiler.lexical('LDY $1234,X');
    test.equal(4 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xbc, 0x34, 0x12]);
    test.done();
};