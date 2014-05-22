var compiler = require('../lib/compiler.js');

exports.test_rti_sngl = function (test) {
    var tokens = compiler.lexical('RTI');
    test.equal(1, tokens.length);
    test.equal("T_INSTRUCTION", tokens[0].type);
    test.equal("RTI", tokens[0].value);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_IMPLIED', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x40]);
    test.done();
};