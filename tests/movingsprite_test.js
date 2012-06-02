var assert = require('assert');
var fs = require('fs');
var sys = require('util');

var compiler = require('../src/compiler.js');

var lines = fs.readFileSync(__dirname + '/../fixtures/movingsprite/movingsprite.asm', 'utf8').split("\n");
lines.length = 12;
var code = lines.join("\n");

var bin = fs.readFileSync(__dirname + '/../fixtures/movingsprite/movingsprite.nes', 'binary');

exports.test_asm_compiler = function(test){
    var tokens = compiler.lexical(code);
    var ast = compiler.syntax(tokens);
    //test.equal(61, ast.length);

    //.inesprg 1
    test.equal('S_DIRECTIVE', ast[0].type);
    //test.equal('T_DIRECTIVE', ast[0].directive.type);
    //test.equal('.inesprg', ast[0].directive.value);

    //.ineschr 1
    test.equal('S_DIRECTIVE', ast[1].type);
    //test.equal('T_DIRECTIVE', ast[1]['directive'].type);
    //test.equal('.ineschr', ast[1]['directive'].value);

    //.inesmap 0
    test.equal('S_DIRECTIVE', ast[2].type);
    //test.equal('T_DIRECTIVE', ast[2]['directive'].type);
    //test.equal('.inesmap', ast[2]['directive'].value);

    //.inesmir 1
    test.equal('S_DIRECTIVE', ast[3].type);
    //test.equal('T_DIRECTIVE', ast[3]['directive'].type);
    //test.equal('.inesmir', ast[3]['directive'].value);

    //.bank 0
    test.equal('S_DIRECTIVE', ast[4].type);
    //test.equal('T_DIRECTIVE', ast[4]['directive'].type);
    //test.equal('.bank', ast[4]['directive'].value);
/*
    //.org $C000
    test.equal('S_DIRECTIVE', ast[5].type);
    test.equal('T_DIRECTIVE', ast[5]['directive'].type);
    test.equal('.org', ast[5]['directive'].value);

    // WAITVBLANK: BIT $2002;
    test.equal('S_ABSOLUTE', ast[6].type);
    test.equal(['WAITVBLANK'], ast[6]['labels']);
    test.equal('T_INSTRUCTION', ast[6]['instruction'].type);
    test.equal('BIT', ast[6]['instruction'].value);

    // BPL WAITVBLANK;
    test.equal('S_RELATIVE', ast[7].type);
    test.assertFalse('labels' in ast[7]);
    test.equal('T_INSTRUCTION', ast[7]['instruction'].type);
    test.equal('BPL', ast[7]['instruction'].value);
    // RTS;
    test.equal('S_IMPLIED', ast[8].type);
    test.assertFalse('labels' in ast[8]);
    test.equal('T_INSTRUCTION', ast[8]['instruction'].type);
    //#test.equal('RTS', ast[8]['instruction'].value);
*/

    opcodes = compiler.semantic(ast, true);
    compiled = '';
    for (var o in opcodes){
        compiled += String.fromCharCode(opcodes[o]);
    }
    test.equal(bin.substring(0, compiled.length), compiled);
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