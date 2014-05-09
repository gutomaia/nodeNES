var fs = require('fs');

var sys = require('util');

var compiler = require('../lib/compiler.js');

var utils = require('../lib/utils.js');

var code = fs.readFileSync(__dirname + '/../static/example/pythonbrasil8/pythonbrasil8.asm', 'utf8');

var bin = fs.readFileSync(__dirname + '/../fixtures/pythonbrasil8/pythonbrasil8.nes', 'binary');

exports.test_nes_compiler = function(test){
    utils.path = 'static/example/pythonbrasil8/';
    var rom = compiler.nes_compiler(code);
    test.deepEqual(bin, rom);
    test.done();
};