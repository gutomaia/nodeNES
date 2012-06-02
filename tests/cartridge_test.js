var assert = require('assert');

var cartridge = require('../src/cartridge.js');

exports.setUp = function(callback){
    this.cart = new cartridge.Cartridge();
    callback();
};

exports.tearDown = function(callback){
    this.cart = null;
    callback();
};

exports.test_inesprg_1 = function(test){
    this.cart.set_iNES_prg(1);
    test.equal(1, this.cart.inesprg);
    test.done();
};

exports.test_inesprg_2 = function(test){
    this.cart.set_iNES_prg(2);
    test.equal(2, this.cart.inesprg);
    test.done();
};

exports.test_ineschr = function(test){
    this.cart.set_iNES_chr(1);
    test.equal(1, this.cart.ineschr);
    test.done();
};

exports.test_inesmap = function(test){
    this.cart.set_iNES_map(1);
    test.equal(1, this.cart.inesmap);
    test.done();
};

exports.test_bank_1 = function(test){
    this.cart.set_bank_id(0);
    test.equal(1, this.cart.banks.length);
    test.done();
};

exports.test_bank_1 = function(test){
    this.cart.set_bank_id(0);
    this.cart.set_bank_id(1);
    test.equal(2, this.cart.banks.length);
    test.done();
};

exports.test_org_c000 = function(test){
    this.cart.set_bank_id(0);
    this.cart.set_org(0xc000);
    test.equal(0xc000, this.cart.banks[0].start);
    test.done();
};

exports.test_append_code = function(test){
    var code =  [0x4e, 0x45, 0x53, 0x1a];
    this.cart.append_code(code);
    test.equal(4, this.cart.pc);
    test.deepEqual(code, this.cart.get_code());
    test.done();
};

exports.test_using_org_to_jump = function(test){
    this.cart.set_bank_id(0);
    this.cart.set_org(0xc000);
    var code = [0x4e, 0x45, 0x53, 0x1a];
    this.cart.append_code(code);
    this.cart.set_org(0xc000 + 8);
    this.cart.append_code(code);
    test.deepEqual([0x4e, 0x45, 0x53, 0x1a, 0xff, 0xff, 0xff, 0xff, 0x4e, 0x45, 0x53, 0x1a], this.cart.get_code());
    test.done();
};