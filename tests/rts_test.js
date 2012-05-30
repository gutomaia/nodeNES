var assert = require('assert');

var compiler = require('../src/compiler.js');

exports.test_rts_sngl = function(test){
    var tokens = compiler.lexical('RTS');
    test.equal(1, tokens.length);
    test.equal("T_INSTRUCTION", tokens[0].type);
    test.equal("RTS", tokens[0].value);
    test.done();
};
/*
# -*- coding: utf-8 -*-

import unittest

from pynes.compiler import lexical, syntax, semantic

class RtsTest(unittest.TestCase):

    def test_rts_sngl(self):
        tokens = lexical('RTS')
        self.assertEquals(1 , len(tokens))
        self.assertEquals('T_INSTRUCTION', tokens[0]['type'])
        ast = syntax(tokens)
        self.assertEquals(1 , len(ast))
        self.assertEquals('S_IMPLIED', ast[0]['type'])
        code = semantic(ast)
        self.assertEquals(code, [0x60])
*/