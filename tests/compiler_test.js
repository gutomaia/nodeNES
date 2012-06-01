var assert = require('assert');

var compiler = require('../src/compiler.js');

var zeropage = {type:'T_ADDRESS', value:'$00'};
var address10 = {type:'T_ADDRESS', value:'$1234'};
var separator = {type:'T_SEPARATOR', value:','};

exports.setUp = function(callback){
    callback();
};

/*
exports.test_t_zeropage = function(test){
    test.assertTrue(t_zeropage([test.zeropage],0));
;
    def test_t_address(test):;
    test.assertTrue(t_address([test.address10],0));
;
    def test_t_separator(test):;
    test.assertTrue(t_separator([test.separator],0));
;
*/

exports.test_comment = function(test){
    var code = ";this is a comment;\n";
    var tokens = compiler.lexical(code);
    test.equal(1, tokens.length);
    test.equal('T_ENDLINE', tokens[0].type);
    test.done();
};

exports.test_compile_more_than_on_instruction = function(test){
    var code = "SEC     ;clear the carry;\n";
    code += "LDA $20     ;get the low byte of the first number;\n";
    var tokens = compiler.lexical(code);
    test.equal(5, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ENDLINE', tokens[1].type);
    test.equal('T_INSTRUCTION', tokens[2].type);
    test.equal('T_ADDRESS', tokens[3].type);
    test.equal('T_ENDLINE', tokens[4].type);
    var ast = compiler.syntax(tokens);
    test.equal(2, ast.length);
    test.done();
};