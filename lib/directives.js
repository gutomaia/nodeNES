if (typeof define !== 'function') { var define = require('amdefine')(module);}

define([], function() {

function d_inesprg(arg, cart){
    cart.set_iNES_prg(arg);
}

function d_ineschr(arg, cart){
    cart.set_iNES_chr(arg);
}

function d_inesmap(arg, cart){
    cart.set_iNES_map(arg);
}

function d_inesmir(arg, cart){
    cart.set_iNES_mir(arg);
}

function d_bank(arg, cart){
    cart.set_bank_id(arg);
}

function d_org(arg, cart){
    cart.set_org(arg);
}


function d_db(arg, cart){
    var l = [];
    for (var t in arg){
        if (arg[t].type == 'T_ADDRESS'){
            l.push(parseInt(arg[t].value.substring(1, arg[t].value.length), 16));
        } else if (arg[t].type == 'T_BINARY_NUMBER'){
            l.push(parseInt(arg[t].value.substring(1, arg[t].value.length), 2));
        }   
    }
    cart.append_code(l);
}

function d_dw(arg, cart) {
    var arg1 = (arg & 0x00ff);
    var arg2 = (arg & 0xff00) >> 8;
    cart.append_code([arg1, arg2]);
}


function d_incbin(arg, cart){
    var compiler = require('./compiler.js');
    var bin = [];
    var data = compiler.open_file(arg);
    for (var i = 0; i < data.length ; i++){
        bin.push(data.charCodeAt(i) & 0xFF);
    }
    cart.append_code(bin);
}

function d_rsset(arg, cart){

}

function d_rs(arg, cart){

}

var directives = function(){
    this.directive_list = {};
    this.directive_list['.inesprg'] = d_inesprg;
    this.directive_list['.ineschr'] = d_ineschr;
    this.directive_list['.inesmap'] = d_inesmap;
    this.directive_list['.inesmir'] = d_inesmir;
    this.directive_list['.bank'] = d_bank;
    this.directive_list['.org'] = d_org;
    this.directive_list['.db'] = d_db;
    this.directive_list['.dw'] = d_dw;
    this.directive_list['.incbin'] = d_incbin;
    this.directive_list['.rsset'] = d_rsset;
    this.directive_list['.rs'] = d_rs;    
};

return new directives();
});
