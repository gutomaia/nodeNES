var fs = require('fs');

var sys = require('util');

var compiler = require('../lib/compiler.js');
var utils = require('../lib/utils.js');

function get_code(file) {
    return fs.readFileSync(__dirname + '/../static/example/spec-la-talk/' + file, 'utf8');
}

function get_bin(file) {
    return fs.readFileSync(__dirname + '/../fixtures/spec-la-talk/' + file, 'binary');
}

exports.test_nes_compiler1 = function (test) {
    utils.path = 'static/example/spec-la-talk/';
    var code = get_code('spec-la.s');
    var bin = get_bin('spec-la.nes');
    try {
        var rom = compiler.nes_compiler(code);
    } catch (e) {
        console.log(e);
        test.fail('could not compile spec-la-talk');
    }
    //TODO:
    //test.equal(bin, rom);
    test.done();
};

exports.test_nes_compiler1 = function (test) {
    utils.path = 'static/example/spec-la-talk/';
    var code = get_code('spec-la-2.s');
    var bin = get_bin('spec-la-2.nes');
    try {
        var rom = compiler.nes_compiler(code);
    } catch (e) {
        console.log(e);
        test.fail('could not compile spec-la-talk');
    }
    //TODO:
    //test.equal(bin, rom);
    test.done();
};
