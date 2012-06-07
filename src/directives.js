(function(exports){



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
    var data;
    var compiler = require('./compiler.js');
    var path = compiler.path;
    if (typeof jQuery !== 'undefined'){
        jQuery.ajax({
            url: path + arg,
            xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    if (typeof xhr.overrideMimeType !== 'undefined') {
                        xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    }
                    self.xhr = xhr;
                    return xhr;
                },
            complete: function(xhr, status) {
                    data = xhr.responseText;
                },
            async: false
        });          
    } else {
        var fs = require('fs');
        data = fs.readFileSync('static/' + path + arg, 'binary');
    }       
    var bin = [];
    for (var i = 0; i < data.length ; i++){
        bin.push(data.charCodeAt(i) & 0xFF);
    }
    cart.append_code(bin);
}

function d_rsset(arg, cart){

}

function d_rs(arg, cart){

}

exports.directive_list = {};
exports.directive_list['.inesprg'] = d_inesprg;
exports.directive_list['.ineschr'] = d_ineschr;
exports.directive_list['.inesmap'] = d_inesmap;
exports.directive_list['.inesmir'] = d_inesmir;
exports.directive_list['.bank'] = d_bank;
exports.directive_list['.org'] = d_org;
exports.directive_list['.db'] = d_db;
exports.directive_list['.dw'] = d_dw;
exports.directive_list['.incbin'] = d_incbin;
exports.directive_list['.rsset'] = d_rsset;
exports.directive_list['.rs'] = d_rs;

})(typeof exports === 'undefined'? this['directives']={}: exports);
