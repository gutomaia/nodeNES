var compiler = require('../lib/compiler.js');

exports.test_stx_zp = function (test) {
    var tokens = compiler.lexical('STX $00');
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ZEROPAGE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x86, 0x00]);
    test.done();
};

exports.test_stx_zpy = function (test) {
    var tokens = compiler.lexical('STX $10,Y');
    test.equal(4, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('T_SEPARATOR', tokens[2].type);
    test.equal('T_REGISTER', tokens[3].type);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ZEROPAGE_Y', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x96, 0x10]);
    test.done();
};

exports.test_stx_abs = function (test) {
    var tokens = compiler.lexical('STX $1234');
    test.equal(2, tokens.length);
    test.equal('T_INSTRUCTION', tokens[0].type);
    test.equal('T_ADDRESS', tokens[1].type);
    test.equal('$1234', tokens[1].value);
    var ast = compiler.syntax(tokens);
    test.equal(1, ast.length);
    test.equal('S_ABSOLUTE', ast[0].type);
    var code = compiler.semantic(ast);
    test.deepEqual(code, [0x8e, 0x34, 0x12]);
    test.done();
};
