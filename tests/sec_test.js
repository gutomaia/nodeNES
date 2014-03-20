var assert = require('assert');

var compiler = require('./compiler.js');

exports.test_sec_sngl = function(test){
    var tokens = compiler.lexical('SEC');
    test.equal(1 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_IMPLIED', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x38]);
    test.done();
};