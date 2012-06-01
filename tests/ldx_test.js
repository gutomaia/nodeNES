var assert = require('assert');

var compiler = require('../src/compiler.js');

exports.test_ldx_imm = function(test){
    var tokens = compiler.lexical('LDX #10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xa2, 0x10]);
    test.done();
};
exports.test_ldx_zp = function(test){
    var tokens = compiler.lexical('LDX $00');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xa6, 0x00]);
    test.done();
};
exports.test_ldx_zpy = function(test){
    var tokens = compiler.lexical('LDX $10,Y');
    test.equal(4 , tokens.length);
    token = tokens[0];
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xb6, 0x10]);
    test.done();
};

exports.test_ldx_abs = function(test){
    var tokens = compiler.lexical('LDX $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xae, 0x34, 0x12]);
    test.done();
};

exports.test_ldx_absy = function(test){
    var tokens = compiler.lexical('LDX $1234,Y');
    test.equal(4 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xbe, 0x34, 0x12]);
    test.done();
};