if (typeof define !== 'function') { var define = require('amdefine')(module);}

define([], function() {

function Cartridge() {
    this.banks = [];
    this.bank_id = 0;
    this.pc = 0;
    this.inesprg = 1;
    this.ineschr = 1;
    this.inesmap = 1;
    this.inesmir = 1;
    this.rs = 0;
}

Cartridge.prototype.nes_id = function (){
    //NES 
    return [0x4e, 0x45, 0x53, 0x1a];
};

Cartridge.prototype.nes_get_header = function (){
    var id = this.nes_id();
    var unused = [0,0,0,0,0,0,0,0];
    var header = [];
    header = header.concat(id);
    header.push(this.inesprg);
    header.push(this.ineschr);
    header.push(this.inesmir);
    header.push(this.inesmap);
    header = header.concat(unused);
    return header;
};

Cartridge.prototype.set_iNES_prg = function (inesprg){
    this.inesprg = inesprg;
};

Cartridge.prototype.set_iNES_chr = function (ineschr){
    this.ineschr = ineschr;
};

Cartridge.prototype.set_iNES_map = function (inesmap){
    this.inesmap = inesmap;
};

Cartridge.prototype.set_iNES_mir = function (inesmir){
    this.inesmir = inesmir;
};

Cartridge.prototype.set_bank_id = function (id){
    if (this.banks[id] === undefined){
        this.banks[id] = {code:[], start:null, size:(1024*8)};
        this.bank_id = id;
    }
};

Cartridge.prototype.set_org = function (org){
    if (this.banks[this.bank_id] === undefined){
        this.set_bank_id(this.bank_id);
    }
    if (this.banks[this.bank_id].start === null){
        this.banks[this.bank_id].start = org;
        this.pc = org;
    } else {
        while (this.pc < org){
            this.append_code([0xff]);
        }
        this.pc = org;
    }
};

Cartridge.prototype.set_rs = function (org){
    this.rs = org;
};

Cartridge.prototype.append_code = function (code){
    if (this.banks[this.bank_id] === undefined){
        this.set_bank_id(this.bank_id);
    }
    for (var c in code){
        //assert c <= 0xff
        this.banks[this.bank_id].code.push(code[c]);
        this.pc++;
    }
};

Cartridge.prototype.get_code = function (){
    if (this.banks[this.bank_id] === undefined){
        this.set_bank_id(this.bank_id);
    }
    return this.banks[this.bank_id].code;
};

Cartridge.prototype.get_ines_code = function(){
    if (this.banks[this.bank_id] === undefined){
        this.set_bank_id(this.bank_id);
    }
    var bin = [];
    var nes_header = this.nes_get_header();
    bin = bin.concat(nes_header);
    for (var b in this.banks){
        for (var j = this.banks[b].code.length; j < this.banks[b].size; j++){
            this.banks[b].code.push(0xff);
        }
        bin = bin.concat(this.banks[b].code);
    }
    return bin;
};

function cartridge (){
        this.Cartridge = Cartridge;
}
return new cartridge();

});
