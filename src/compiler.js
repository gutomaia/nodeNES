(function(exports){

    var analyzer = require('./analyzer.js');
    var c6502 = require('./c6502.js');

    var asm65_tokens = [
        {type:"T_INSTRUCTION", regex:/^(ADC|AND|ASL|BCC|BCS|BEQ|BIT|BMI|BNE|BPL|BRK|BVC|BVS|CLC|CLD|CLI|CLV|CMP|CPX|CPY|DEC|DEX|DEY|EOR|INC|INX|INY|JMP|JSR|LDA|LDX|LDY|LSR|NOP|ORA|PHA|PHP|PLA|PLP|ROL|ROR|RTI|RTS|SBC|SEC|SED|SEI|STA|STX|STY|TAX|TAY|TSX|TXA|TXS|TYA)/, store:true},
        {type:"T_ADDRESS", regex:/^\$([\dA-F]{2,4})/, store:true},
        {type:"T_HEX_NUMBER", regex:/^\#\$?([\dA-F]{2})/, store:true},
        {type:'T_SEPARATOR', regex:/^,/, store:true},
        {type:'T_REGISTER', regex:/^(X|x|Y|y)/, store:true},
        {type:'T_OPEN', regex:/^\(/, store:true},
        {type:'T_CLOSE', regex:/^\)/, store:true},
        {type:"T_WHITESPACE", regex:/^[ \t\r]+/, store:false}
    ];

    /*
        dict(type='T_BINARY_NUMBER', regex=r'\#%([01]{8})', store=True), #TODO: change to BINARY_NUMBER
        dict(type='T_STRING', regex=r'^"[^"]*"', store=True),
        dict(type='T_SEPARATOR', regex=r'^,', store=True),
        dict(type='T_REGISTER', regex=r'^(X|x|Y|y)', store=True),
        dict(type='T_OPEN', regex=r'^\(', store=True),
        dict(type='T_CLOSE', regex=r'^\)', store=True),
        dict(type='T_LABEL', regex=r'^([a-zA-Z][a-zA-Z\d]*)\:', store=True),
        dict(type='T_MARKER', regex=r'^[a-zA-Z][a-zA-Z\d]*', store=True),
        dict(type='T_DIRECTIVE', regex=r'^\.[a-z]+', store=True),
        dict(type='T_NUM', regex=r'^[\d]+', store=True), #TODO change to DECIMAL ARGUMENT
        dict(type='T_ENDLINE', regex=r'^\n', store=True),
        dict(type='T_WHITESPACE', regex=r'^[ \t\r]+', store=False),
        dict(type='T_COMMENT', regex=r'^;[^\n]*', store=False)
    */

    exports.lexical = function(code){
        return analyzer.analyse(code, asm65_tokens);
    };

    function look_ahead(tokens, index, type, value){
        if (index > tokens.length - 1){
            return false;
        }
        var token = tokens[index];
        if (token.type == type){
            if (value === undefined || token.value == value){
                return true;
            }
        }
        return false;
    }

    function t_instruction(tokens, index){
        return look_ahead(tokens, index, 'T_INSTRUCTION');
    }

    function t_number(tokens, index){
        return look_ahead(tokens, index, 'T_HEX_NUMBER');
    }

    function t_relative(tokens, index){
        if (t_instruction(tokens, index)){
            var valid = [ 'BCC', 'BCS', 'BEQ', 'BNE', 'BMI', 'BPL', 'BVC', 'BVS'];
            for (var v in valid){
                if(tokens[index].value == valid[v]){
                    return true;
                }
            }
        }
        return false;
    }

    function t_address_or_t_marker(tokens, index){
        return t_address(tokens, index);
    }

    function t_address(tokens, index){
        return look_ahead(tokens, index, 'T_ADDRESS');
    }

    function t_zeropage(tokens, index){
        if (t_address(tokens,index) && tokens[index].value.length == 3){
            return true;
        }
        return false;
    }

    function t_separator(tokens, index){
        return look_ahead(tokens, index, 'T_SEPARATOR', ',');
    }

    function t_register_x(tokens, index){
        return look_ahead(tokens, index, 'T_REGISTER', 'X');
    }

    function t_register_y(tokens, index){
        return look_ahead(tokens, index, 'T_REGISTER', 'Y');
    }

    function t_open(tokens, index){
        return look_ahead(tokens, index, 'T_OPEN', '(');
    }

    function t_close(tokens, index){
        return look_ahead(tokens, index, 'T_CLOSE', ')');
    }

    var asm65_bnf = [
        {type:"S_RELATIVE", "short":"rel", "bnf":[t_relative, t_address_or_t_marker]},
        {type:"S_IMMEDIATE", "short":"imm", "bnf":[t_instruction, t_number]},
        {type:"S_ZEROPAGE_X", "short":"zpx", "bnf":[t_instruction, t_zeropage, t_separator, t_register_x]},
        {type:"S_ZEROPAGE_Y", "short":"zpy", "bnf":[t_instruction, t_zeropage, t_separator, t_register_y]},
        {type:"S_ZEROPAGE", "short":"zp", "bnf":[t_instruction, t_zeropage]},
        {type:"S_ABSOLUTE_X", "short":"absx", "bnf":[t_instruction, t_address_or_t_marker, t_separator, t_register_x]},
        {type:"S_ABSOLUTE_Y", "short":"absy", "bnf":[t_instruction, t_address_or_t_marker, t_separator, t_register_y]},
        {type:"S_ABSOLUTE", "short":"abs", "bnf":[t_instruction, t_address_or_t_marker]},
        {type:"S_INDIRECT_X", "short":"indx", "bnf":[t_instruction, t_open, t_address_or_t_marker, t_separator, t_register_x, t_close]},
        {type:"S_INDIRECT_Y", "short":"indy", "bnf":[t_instruction, t_open, t_address_or_t_marker, t_close, t_separator, t_register_y]},
        {type:"S_IMPLIED", "short":"sngl", "bnf":[t_instruction]}
    ];
    /*
        #TODO dict(type='S_DIRECTIVE', short='sngl', bnf=[t_directive, [OR, t_num, t_address]]),
    */

    exports.syntax = function(tokens){
        var ast = [];
        var x = 0;
        var debug = 0;
        var labels = [];
        var code = [];
        while (x < tokens.length){
            for (var bnf in asm65_bnf){
                var leaf = {};
                var look_ahead = 0;
                var move = false;
                for (var i in asm65_bnf[bnf].bnf){
                    move = asm65_bnf[bnf].bnf[i](tokens, x + look_ahead);
                    if (!move){
                        break;
                    }
                    look_ahead++;
                }
                if (move){
                    leaf.instruction = tokens[x];
                    leaf.type = asm65_bnf[bnf].type;
                    leaf.short = asm65_bnf[bnf].short;
                    if (leaf.short == 'sngl'){
                        //Do nothing
                    } else if (leaf.short == 'indx' || leaf.short == 'indy') {
                        leaf.arg = tokens[x+2];
                    } else {
                        leaf.arg = tokens[x+1];
                    }
                    ast.push(leaf);
                    x += look_ahead;
                    break;
                }
                debug++;
                if (debug > 1000){
                    throw "Something";
                }
            }
        }
        return ast;
    };

    function get_int_value(token){
        if (token.type == 'T_ADDRESS'){
            m = asm65_tokens[1].regex.exec(token.value);
            //console.log(m);
            return parseInt(m[1], 16);
        }else if (token.type == 'T_HEX_NUMBER'){
            m = asm65_tokens[2].regex.exec(token.value);
            return parseInt(m[1], 16);
        }
    }

    exports.semantic = function(ast){
        var leaf = ast[0];
        var instruction = leaf.instruction.value;
        var address_mode = leaf.short;
        var opcode = c6502.opcodes[instruction][address_mode];
        var code = [];
        if (address_mode != 'sngl'){
            address = get_int_value(leaf.arg);
/*            if ('rel' == address_mode:
                    address = 126 + (address - cart.pc)
                    if address == 128:
                        address = 0
                    elif address < 128:
                        address = address | 0b10000000
                    elif address > 128:
                        address = address & 0b01111111
*/
                if (c6502.address_mode_def[address_mode].size == 2){
                    code.push(opcode);
                    code.push(address);
                } else {
                    arg1 = (address & 0x00ff);
                    arg2 = (address & 0xff00) >> 8;
                    code.push(opcode);
                    code.push(arg1);
                    code.push(arg2);
                }
            } else {
                cart.append_code([opcode]);
            }
        return code;
    };
})(typeof exports === 'undefined'? this['compiler']={}: exports);
