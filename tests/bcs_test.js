var compiler = require('../lib/compiler.js');

exports.test_bcs_rel = function(test){
    var tokens = compiler.lexical('BCS $10');
    test.equal(2 , tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1 , ast.length);
    test.equal('S_RELATIVE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0xb0, 0x0e]);
    test.done();
};