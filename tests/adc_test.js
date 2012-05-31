var assert = require('assert');

var compiler = require('../src/compiler.js');

exports.test_adc_imm = function(test){
    var tokens = compiler.lexical('ADC #10');
    test.equal(2, tokens.length);
    test.equal("T_INSTRUCTION", tokens[0].type);
    test.equal("ADC", tokens[0].value);
    test.equal("T_HEX_NUMBER", tokens[1].type);
    test.equal("#10", tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x69, 0x10]);
    test.done();
};

exports.test_adc_zp = function(test){
    var tokens = compiler.lexical('ADC $10');
    test.equal(2, tokens.length);
    test.equal("T_INSTRUCTION", tokens[0].type);
    test.equal("ADC", tokens[0].value);
    test.equal("T_ADDRESS", tokens[1].type);
    test.equal("$10", tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x65, 0x10]);
    test.done();
};

exports.test_adc_zpx = function(test){
    var tokens = compiler.lexical('ADC $10,X');
    test.equal(4 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0]['type']);
    test.equal("ADC", tokens[0].value);
    test.equal("T_ADDRESS", tokens[1].type);
    test.equal("$10", tokens[1].value);
    test.equal("T_SEPARATOR", tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE_X', ast[0]['type']);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x75, 0x10]);
    test.done();
};

exports.test_adc_abs = function(test){
    var tokens = compiler.lexical('ADC $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x6d, 0x34, 0x12]);
    test.done();
};

exports.test_adc_absx = function(test){
    var tokens = compiler.lexical('ADC $1234,X');
    test.equal(4 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equals('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x7d, 0x34, 0x12]);
    test.done();
};

exports.test_absy = function(test){
    var tokens = compiler.lexical('ADC $1234,Y');
    test.equal(4 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x79, 0x34, 0x12]);
    test.done();
};

exports.test_adc_indx = function(test){
    var tokens = compiler.lexical('ADC ($20,X)');
    test.equal(6 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_OPEN', tokens[1].type);
    test.equal('T_ADDRESS', tokens[2].type);
    test.equal('$20', tokens[2].value);
    test.equal('T_SEPARATOR', tokens[3].type);
    test.equal('T_REGISTER', tokens[4].type);
    test.equal('T_CLOSE', tokens[5].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_INDIRECT_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x61, 0x20]);
    test.done();
};

exports.test_adc_indy = function(test){
    var tokens = compiler.lexical('ADC ($20),Y');
    test.equal(6 , tokens.length);
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
    test.deepEqual(code, [0x71, 0x20]);
    test.done();
};