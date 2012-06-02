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

/*
def d_org(arg, cart):
    cart.set_org(arg)

def d_db(arg, cart):
    l = []
    for token in arg:
        if token['type'] == 'T_ADDRESS':
            l.append(int(token['value'][1:], 16))
    cart.append_code(l)

def d_dw(arg, cart):
    arg1 = (arg & 0x00ff)
    arg2 = (arg & 0xff00) >> 8
    cart.append_code([arg1, arg2])



def d_incbin(arg, cart):
    f = open('fixtures/movingsprite/'+arg, 'rw')
    content = f.read()
    for c in content:
        cart.append_code([ord(c)])
    #raise Exception()
*/

exports.directive_list = {};
exports.directive_list['.inesprg'] = d_inesprg;
exports.directive_list['.ineschr'] = d_ineschr;
exports.directive_list['.inesmap'] = d_inesmap;
exports.directive_list['.inesmir'] = d_inesmir;
exports.directive_list['.bank'] = d_bank;
//exports.directive_list['.org'] = d_org;
//exports.directive_list['.db'] = d_db;
//exports.directive_list['.dw'] = d_dw;
//exports.directive_list['.incbin'] = d_incbin;

})(typeof exports === 'undefined'? this['compiler']={}: exports);
