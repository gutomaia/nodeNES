var assert = require('assert');
var fs = require('fs');
var Buffer = require('buffer').Buffer;

var sys = require('util');

var compiler = require('../src/compiler.js');

var code = fs.readFileSync(__dirname + '/../static/example/movingsprite/movingsprite.asm', 'utf8');

var bin = fs.readFileSync(__dirname + '/../fixtures/movingsprite/movingsprite.nes', 'binary');

exports.test_asm_compiler = function(test){
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    //test.equal(61, ast.length);

    //.inesprg 1
    test.equal('S_DIRECTIVE', ast[0].type);
    test.equal('T_DIRECTIVE', ast[0].children[0].type);
    test.equal('.inesprg', ast[0].children[0].value);
    test.equal(5, ast[0].children[0].line);
    test.equal(3, ast[0].children[0].column);

    //.ineschr 1
    test.equal('S_DIRECTIVE', ast[1].type);
    test.equal('T_DIRECTIVE', ast[1].children[0].type);
    test.equal('.ineschr', ast[1].children[0].value);
    test.equal(6, ast[1].children[0].line);
    test.equal(3, ast[1].children[0].column);

    //.inesmap 0
    test.equal('S_DIRECTIVE', ast[2].type);
    test.equal('T_DIRECTIVE', ast[2].children[0].type);
    test.equal('.inesmap', ast[2].children[0].value);
    test.equal(7, ast[2].children[0].line);
    test.equal(3, ast[2].children[0].column);

    //.inesmir 1
    test.equal('S_DIRECTIVE', ast[3].type);
    test.equal('T_DIRECTIVE', ast[3].children[0].type);
    test.equal('.inesmir', ast[3].children[0].value);
    test.equal(8, ast[3].children[0].line);
    test.equal(3, ast[3].children[0].column);

    //.bank 0
    test.equal('S_DIRECTIVE', ast[4].type);
    test.equal('T_DIRECTIVE', ast[4].children[0].type);
    test.equal('.bank', ast[4].children[0].value);
    test.equal(11, ast[4].children[0].line);
    test.equal(3, ast[4].children[0].column);

    //.org $C000
    test.equal('S_DIRECTIVE', ast[5].type);
    test.equal('T_DIRECTIVE', ast[5].children[0].type);
    test.equal('.org', ast[5].children[0].value);
    test.equal(12, ast[5].children[0].line);
    test.equal(3, ast[5].children[0].column);

    // WAITVBLANK: BIT $2002;
    test.equal('S_ABSOLUTE', ast[6].type);
    test.deepEqual(['WAITVBLANK'], ast[6]['labels']);
    test.equal('T_INSTRUCTION', ast[6].children[0].type);
    test.equal('BIT', ast[6].children[0].value);
    test.equal(15, ast[6].children[0].line);
    test.equal(3, ast[6].children[0].column);

    // BPL WAITVBLANK;
    test.equal('S_RELATIVE', ast[7].type);
    //test.assertFalse('labels' in ast[7]);
    test.equal('T_INSTRUCTION', ast[7].children[0].type);
    test.equal('BPL', ast[7].children[0].value);
    test.equal(16, ast[7].children[0].line);
    test.equal(3, ast[7].children[0].column);

    // RTS;
    test.equal('S_IMPLIED', ast[8].type);
    //test.assertFalse('labels' in ast[8]);
    test.equal('T_INSTRUCTION', ast[8].children[0].type);
    test.equal('RTS', ast[8].children[0].value);
    test.equal(17, ast[8].children[0].line);
    test.equal(3, ast[8].children[0].column);

    opcodes = compiler.semantic(ast, true);

    var data = String.fromCharCode.apply(undefined, opcodes);

    test.equal(bin, data);

    /*
    fs.open(__dirname + '/../fixtures/movingsprite/test_movingsprite.nes', 'w', function(status, fd) {
        var buffer = new Buffer(opcodes);
        fs.writeSync(fd, buffer, 0, opcodes.length, 0);
    });
    */
    test.done();
};

/*
    def test_fragment(test):;
    fragment = ''';
      LDA #$00;
      STA $2003;
      LDA #$02;
      STA $4014;
      ''';
    var tokens = compiler.lexical(fragment);
    var ast = compiler.syntax(tokens);
    opcodes = compiler.semantic(ast);
    bin = ''.join([chr(opcode) for opcode in opcodes]);
    f = open('fixtures/nesasm/scrolling/scrolling5.nes', 'rb');
    content = f.read();
    f.close();
    test.assertTrue(bin in content);
*/