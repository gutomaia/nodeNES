if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([], function() {

    var am = [];

    am.S_IMPLIED = {size: 1, short: 'sngl'};
    am.S_IMMEDIATE = {size: 2, short: 'imm'};
    am.S_IMMEDIATE_WITH_MODIFIER = {size: 2, short: 'imm'};
    am.S_ACCUMULATOR = {size: 1, short: 'acc'};
    am.S_ZEROPAGE = {size: 2, short: 'zp'};
    am.S_ZEROPAGE_X = {size: 2, short: 'zpx'};
    am.S_ZEROPAGE_Y = {size: 2, short: 'zpy'};
    am.S_ABSOLUTE = {size: 3, short: 'abs'};
    am.S_ABSOLUTE_X = {size: 3, short: 'absx'};
    am.S_ABSOLUTE_Y = {size: 3, short: 'absy'};
    am.S_INDIRECT_X = {size: 2, short: 'indx'};
    am.S_INDIRECT_Y = {size: 2, short: 'indy'};
    am.S_RELATIVE = {size: 2, short: 'rel'};

    var o = [];
    o.ADC = {imm: 0x69, zp: 0x65, zpx: 0x75, abs: 0x6d, absx: 0x7d, absy: 0x79, indx: 0x61, indy: 0x71};
    o.AND = {imm: 0x29, zp: 0x25, zpx: 0x35, abs: 0x2d, absx: 0x3d, absy: 0x39, indx: 0x21, indy: 0x31};
    o.ASL = {acc: 0x0a, zp: 0x06, zpx: 0x16, abs: 0x0e, absx: 0x1e};
    o.BCC = {rel: 0x90};
    o.BCS = {rel: 0xb0};
    o.BEQ = {rel: 0xf0};
    o.BIT = {zp: 0x24, abs: 0x2c};
    o.BMI = {rel: 0x30};
    o.BNE = {rel: 0xd0};
    o.BPL = {rel: 0x10};
    o.BVC = {rel: 0x50};
    o.BVS = {rel: 0x70};
    o.CLC = {sngl: 0x18};
    o.CLD = {sngl: 0xd8};
    o.CLI = {sngl: 0x58};
    o.CLV = {sngl: 0xb8};
    o.CMP = {imm: 0xc9, zp: 0xc5, zpx: 0xd5, abs: 0xcd, absx: 0xdd, absy: 0xd9, indx: 0xc1, indy: 0xd1};
    o.CPX = {imm: 0xe0, zp: 0xe4, abs: 0xec};
    o.CPY = {imm: 0xc0, zp: 0xc4, abs: 0xcc};
    o.DEC = {zp: 0xc6, zpx: 0xd6, abs: 0xce, absx: 0xde};
    o.DEX = {sngl: 0xca};
    o.DEY = {sngl: 0x88};
    o.EOR = {imm: 0x49, zp: 0x45, zpx: 0x55, abs: 0x4d, absx: 0x5d, absy: 0x59, indx: 0x41, indy: 0x51};
    o.INC = {zp: 0xe6, zpx: 0xf6, abs: 0xee, absx: 0xfe};
    o.INX = {sngl: 0xe8};
    o.INY = {sngl: 0xc8};
    o.JMP = {abs: 0x4c};
    o.JSR = {abs: 0x20};
    o.LDA = {imm: 0xa9, zp: 0xa5, zpx: 0xb5, abs: 0xad, absx: 0xbd, absy: 0xb9, indx: 0xa1, indy: 0xb1};
    o.LDX = {imm: 0xa2, zp: 0xa6, zpy: 0xb6, abs: 0xae, absy: 0xbe};
    o.LDY = {imm: 0xa0, zp: 0xa4, zpx: 0xb4, abs: 0xac, absx: 0xbc};
    o.LSR = {acc: 0x4a, zp: 0x46, zpx: 0x56, abs: 0x4e, absx: 0x5e};
    o.NOP = {sngl: 0xea};
    o.ORA = {imm: 0x09, zp: 0x05, zpx: 0x15, abs: 0x0d, absx: 0x1d, absy: 0x19, indx: 0x01, indy: 0x11};
    o.PHA = {sngl: 0x48};
    o.PHP = {sngl: 0x08};
    o.PLA = {sngl: 0x68};
    o.PLP = {sngl: 0x28};
    o.ROL = {acc: 0x2a, zp: 0x26, zpx: 0x36, abs: 0x2e, absx: 0x3e};
    o.ROR = {acc: 0x6a, zp: 0x66, zpx: 0x76, abs: 0x6e, absx: 0x7e};
    o.RTI = {sngl: 0x40};
    o.RTS = {sngl: 0x60};
    o.SBC = {imm: 0xe9, zp: 0xe5, zpx: 0xf5, abs: 0xed, absx: 0xfd, absy: 0xf9, indx: 0xe1, indy: 0xf1};
    o.SEC = {sngl: 0x38};
    o.SED = {sngl: 0xf8};
    o.SEI = {sngl: 0x78};
    o.STA = {zp: 0x85, zpx: 0x95, abs: 0x8d, absx: 0x9d, absy: 0x99, indx: 0x81, indy: 0x91};
    o.STX = {zp: 0x86, zpy: 0x96, abs: 0x8e};
    o.STY = {zp: 0x84, zpx: 0x94, abs: 0x8c};
    o.TAX = {sngl: 0xaa};
    o.TAY = {sngl: 0xa8};
    o.TSX = {sngl: 0xba};
    o.TXA = {sngl: 0x8a};
    o.TXS = {sngl: 0x9a};
    o.TYA = {sngl: 0x98};

    var Cpu6502 = function () {
        this.address_mode_def = am;
        this.opcodes = o;
    };
    return new Cpu6502();
});
