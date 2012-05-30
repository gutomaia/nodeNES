var assert = require('assert');

var compiler = require('../src/compiler.js');

exports.test_bcc_rel = function(test){
    var tokens = compiler.lexical('BCC $10');
    test.equal(2, tokens.length);
    test.equal("T_INSTRUCTION", tokens[0].type);
    test.equal("BCC", tokens[0].value);
    test.equal("T_ADDRESS", tokens[1].type);
    test.equal("$10", tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_RELATIVE', ast[0].type);
    //code = semantic(ast)
    //self.assertEquals(code, [0x90, 0x0e])
    test.done();
};