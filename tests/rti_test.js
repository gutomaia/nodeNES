var compiler = require('../lib/compiler.js');

exports.test_rti_sngl = function (test) {
    var tokens = compiler.lexical('RTI');
    test.equal(1, tokens.length);
    test.equal("T_INSTRUCTION", tokens[0].type);
    test.equal("RTI", tokens[0].value);
    //TODO: test opcode
    test.done();
};