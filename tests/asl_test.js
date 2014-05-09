var compiler = require('../lib/compiler.js');
/*
INFO: according to http://www.masswerk.at/6502/6502_instruction_set.html
there is no immediate address mode. That opcode is for accumulator address
mode.

exports.test_asl_imm = function(test){
    var tokens = compiler.lexical('ASL #10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_HEX_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x0a, 0x10]);
    test.done();
};
*/

exports.test_asl_acc = function(test){
    var tokens = compiler.lexical('ASL A');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ACCUMULATOR', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ACCUMULATOR', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x0a]);
    test.done();
};


exports.test_asl_zp = function(test){
    var tokens = compiler.lexical('ASL $00');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x06, 0x00]);
    test.done();
};

exports.test_asl_zpx = function(test){
    var tokens = compiler.lexical('ASL $10,X');
    test.equal(4 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ZEROPAGE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x16, 0x10]);
    test.done();
};

exports.test_asl_abs = function(test){
    var tokens = compiler.lexical('ASL $1234');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x0e, 0x34, 0x12]);
    test.done();
};

exports.test_asl_absx = function(test){
    var tokens = compiler.lexical('ASL $1234,X');
    test.equal(4, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_ABSOLUTE_X', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x1e, 0x34, 0x12]);
    test.done();
};