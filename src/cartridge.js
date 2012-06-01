(function(exports){

function Cartridge() {
    this.banks = [];
    this.bank_id = 0;
    this.pc = 0;
    this.inespgr = 1;
    this.ineschr = 1;
    this.inesmap = 1;
    this.inesmir = 1;
}

Cartridge.prototype.nes_id = function (){
    //NES 
    return [0x4e, 0x45, 0x53, 0x1a];
};

Cartridge.prototype.nes_get_header = function (){
    /*
    id = self.nes_id();
    unused = [0,0,0,0,0,0,0,0]
    header = []
    header.extend(id)
    header.append(self.inespgr)
    header.append(self.ineschr)
    header.append(self.inesmir)
    header.append(self.inesmap)
    header.extend(unused)
    return header*/
    return 0;
};

Cartridge.prototype.set_iNES_pgr = function (inespgr){
    this.inespgr = inespgr;
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
        while(this.pc < org){
            this.append_code([0xff]);
        }
        this.pc = org;
    }
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

/*
    def get_ines_code(self):
        if self.bank_id not in self.banks:
            self.set_bank_id(self.bank_id)
        bin = []
        nes_header = self.nes_get_header()
        bin.extend(nes_header)
        for i in self.banks:
            for j in range(len(self.banks[i]['code']), self.banks[i]['size']):
                self.banks[i]['code'].append(0xff)
            bin.extend(self.banks[i]['code'])
        return bin
*/
exports.Cartridge = Cartridge;

})(typeof exports === 'undefined'? this['cartridge']={}: exports);
