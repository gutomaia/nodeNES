var assert = require('assert');

var compiler = require('./compiler.js');

exports.test_cpy_imm = function(test){
    var tokens = compiler.lexical('CPY #10');
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xc0, 0x10]);
    test.done();
};

exports.test_cpy_zp = function(test){
    var tokens = compiler.lexical('CPY $00');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xc4, 0x00]);
    test.done();
};

exports.test_cpy_abs = function(test){
    var tokens = compiler.lexical('CPY $1234');
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xcc, 0x34, 0x12]);
    test.done();
};