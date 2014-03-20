var assert = require('assert');

var compiler = require('./compiler.js');

exports.test_cmp_imm = function(test){
    var tokens = compiler.lexical('CMP #10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xc9, 0x10]);
    test.done();
};

exports.test_cmp_zp = function(test){
    var tokens = compiler.lexical('CMP $00');
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xc5, 0x00]);
    test.done();
};

exports.test_cmp_zpx = function(test){
    var tokens = compiler.lexical('CMP $10,X');
    test.equal(4, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ZEROPAGE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xd5, 0x10]);
    test.done();
};

exports.test_cmp_abs = function(test){
    var tokens = compiler.lexical('CMP $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1]['value']);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xcd, 0x34, 0x12]);
    test.done();
};

exports.test_cmp_absx = function(test){
    var tokens = compiler.lexical('CMP $1234,X');
    test.equal(4, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1]['value']);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ABSOLUTE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xdd, 0x34, 0x12]);
    test.done();
};

exports.test_cmp_absy = function(test){
    var tokens = compiler.lexical('CMP $1234,Y');
    test.equal(4, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xd9, 0x34, 0x12]);
    test.done();
};

exports.test_cmp_indx = function(test){
    var tokens = compiler.lexical('CMP ($20,X)');
    test.equal(6, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_OPEN', tokens[1].type);
    test.equal('T_ADDRESS', tokens[2].type);
    test.equal('$20', tokens[2].value);
    test.equal('T_SEPARATOR', tokens[3].type);
    test.equal('T_REGISTER', tokens[4].type);
    test.equal('T_CLOSE', tokens[5].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_INDIRECT_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xc1, 0x20]);
    test.done();
};
exports.test_cmp_indy = function(test){
    var tokens = compiler.lexical('CMP ($20),Y');
    test.equal(6, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_OPEN', tokens[1].type);
    test.equal('T_ADDRESS', tokens[2].type);
    test.equal('T_CLOSE', tokens[3].type);
    test.equal('T_SEPARATOR', tokens[4].type);
    test.equal('T_REGISTER', tokens[5].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_INDIRECT_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xd1, 0x20]);
    test.done();
};