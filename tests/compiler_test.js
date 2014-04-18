var assert = require('assert');

var compiler = require('../lib/compiler.js');


exports.test_comment = function(test){
    var code = ";this is a comment;\n";
    var tokens = compiler.lexical(code);
    test.equal(1, tokens.length);
    test.equal('T_ENDLINE', tokens[0].type);
    test.done();
};

exports.test_marker = function(test){
    var code = "BPL WAITVBLANK";
    var tokens = compiler.lexical(code);
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_MARKER', tokens[1].type);
    test.done();
};

exports.test_binary_number = function(test){
    var tokens = compiler.lexical('LDA #%10000000');
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_BINARY_NUMBER', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMMEDIATE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xa9, 0x80]);
    test.done();
};

exports.test_string = function(test){
    var code = '.incbin "player.chr"';
    var tokens = compiler.lexical(code);
    test.equal(2, tokens.length);
    test.equal('T_DIRECTIVE', tokens[0].type);
    test.equal('T_STRING', tokens[1].type);
    test.done();
};

exports.test_double_instruction_as_marker = function(test){
    var code = 'RTIRTI: RTI';
    var tokens = compiler.lexical(code);
    test.equal(2, tokens.length);
    test.equal('T_LABEL', tokens[0].type);
    test.equal('T_INSTRUCTION', tokens[1].type);
    test.done();
};

exports.test_lowercase_instructions = function(test){
    var code = 'lda $20\nrti';
    var tokens = compiler.lexical(code);
    test.equal(4, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_ENDLINE', tokens[2].type);
    test.equal('T_INSTRUCTION', tokens[3].type);
    test.done();
};

exports.test_lowercase_relative_instructions = function(test){
    var source = 'vblankwait1: bit $2002\n';
    source += '\tbpl vblankwait1';
    var tokens = compiler.lexical(source);
    test.equal(6, tokens.length);
    test.equal('T_LABEL', tokens[0].type);
    test.equal('T_INSTRUCTION', tokens[1].type);
    test.equal('T_ADDRESS', tokens[2].type);
    test.equal('T_ENDLINE', tokens[3].type);
    test.equal('T_INSTRUCTION', tokens[4].type);
    test.equal('T_MARKER', tokens[5].type);
    var ast = compiler.syntax(tokens);
    test.equal(2 , ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    test.equal('S_RELATIVE', ast[1].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x2c, 0x02, 0x20, 0x10, 0xfb]); //TODO: check later
    test.done();
};


exports.test_address_with_one_digit = function (test){
    var code = 'sprites: .db $80, 112, $0, $80';
    var tokens = compiler.lexical(code);
    test.equal(9, tokens.length);
    test.equal('T_LABEL', tokens[0].type);
    test.equal('T_DIRECTIVE', tokens[1].type);
    test.equal('T_ADDRESS', tokens[2].type);
    test.equal('T_SEPARATOR', tokens[3].type);
    test.equal('T_DECIMAL_ARGUMENT', tokens[4].type);
    test.equal('T_SEPARATOR', tokens[5].type);
    test.equal('T_ADDRESS', tokens[6].type);
    test.equal('T_SEPARATOR', tokens[7].type);
    test.equal('T_ADDRESS', tokens[8].type);

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
    test.equal('S_IMPLIED', ast[0].type);
    //TODO: test.equal('SEC', ast[0].instruction.value);
    test.equal('S_ZEROPAGE', ast[1].type);
    //TODO: test.equal('LDA', ast[1].instruction.value);
    test.done();
};


//NesASM compatible
exports.test_low_modifier = function(test){
    var code = "ADC #LOW($E030)";
    var tokens = compiler.lexical(code);
    test.equal(5, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_MODIFIER', tokens[1].type);
    test.equal('T_OPEN', tokens[2].type);
    test.equal('T_ADDRESS', tokens[3].type);
    test.equal('T_CLOSE', tokens[4].type);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast);
    test.deepEqual(opcodes, [0x69, 0x30]);
    test.done();
};

//NesASM compatible
exports.test_high_modifier = function(test){
    var code = "ADC #HIGH($E030)";
    var tokens = compiler.lexical(code);
    test.equal(5, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_MODIFIER', tokens[1].type);
    test.equal('T_OPEN', tokens[2].type);
    test.equal('T_ADDRESS', tokens[3].type);
    test.equal('T_CLOSE', tokens[4].type);
    var ast = compiler.syntax(tokens);
    var opcodes = compiler.semantic(ast);
    test.deepEqual(opcodes, [0x69, 0xe0]);
    test.done();
};


//NesASM indyY address mode compatible

exports.test_lda_indy = function(test){
    var tokens = compiler.lexical('LDA [$20],Y');
    test.equal(6 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_OPEN_SQUARE_BRACKETS', tokens[1].type);
    test.equal('T_ADDRESS', tokens[2].type);
    test.equal('T_CLOSE_SQUARE_BRACKETS', tokens[3].type);
    test.equal('T_SEPARATOR', tokens[4].type);
    test.equal('T_REGISTER', tokens[5].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_INDIRECT_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xb1, 0x20]);
    test.done();
};

exports.test_invalid_token = function(test){
    try {
        var tokens = compiler.lexical('.invalid #TOKEN');
        test.fail();
    }catch(e){
        test.equal("Lexical Error" , e.name);
        test.equal("Lexical Error Message" , e.message);
        test.equal(1 , e.erros.length);
        test.equal("Invalid Token" , e.erros[0].name);
        test.equal(1 , e.erros[0].line);
        test.equal(10 , e.erros[0].column);
        test.equal("#TOKEN" , e.erros[0].value);
        test.equal("Token #TOKEN at line 1 column 10 is invalid" , e.erros[0].message);
    }
    test.done();
};

exports.test_invalid_directive = function (test){
    try {
        var tokens = compiler.lexical('.invalid 171');
        test.equal(2 , tokens.length);
        test.equal('T_DIRECTIVE', tokens[0].type);
        test.equal('T_DECIMAL_ARGUMENT', tokens[1].type);
        var ast = compiler.syntax(tokens);
        test.equal(1 , ast.length);
        test.equal('S_DIRECTIVE', ast[0].type);
        var code = compiler.semantic(ast);
        test.fail();
    } catch (e){
        test.equal("Semantic Error" , e.name);
        test.equal("Semantic Error Message" , e.message);
        test.equal(1 , e.erros.length);
        test.equal("Unknow Directive" , e.erros[0].type);
    }
    test.done();
};

/*
TODO: fix later syntax test
exports.test_invalid_syntax = function (test){
    try {
        var tokens = compiler.lexical('php php');
        var ast = compiler.syntax(tokens);
        test.fail();
    }catch(e){
        test.equal('Syntax Error' , e.name);
        test.equal('There were found 1 erros:\n' , e.message);
        test.equal(1 , e.erros.length);
        test.equal('Syntax Error' , e.erros[0].type);
    }
    test.done();
};
*/

exports.test_nes_invalid_token = function(test){
    try {
        compiler.nes_compiler('#INVALIDTOKEN');
        test.fail();
    }catch(e){
        test.equal(1 , e.length);
        test.equal("Invalid Token" , e[0].name);
        test.equal(1 , e[0].line);
        test.equal(1 , e[0].column);
        test.equal("#INVALIDTOKEN" , e[0].value);
        test.equal("Token #INVALIDTOKEN at line 1 column 1 is invalid" , e[0].message);
    }
    test.done();
};
