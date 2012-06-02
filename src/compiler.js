(function(exports){

    var analyzer = require('./analyzer.js');
    var c6502 = require('./c6502.js');
    var cartridge = require('./cartridge.js');
    var directives = require('./directives.js');

    var asm65_tokens = [
        {type:"T_INSTRUCTION", regex:/^(ADC|AND|ASL|BCC|BCS|BEQ|BIT|BMI|BNE|BPL|BRK|BVC|BVS|CLC|CLD|CLI|CLV|CMP|CPX|CPY|DEC|DEX|DEY|EOR|INC|INX|INY|JMP|JSR|LDA|LDX|LDY|LSR|NOP|ORA|PHA|PHP|PLA|PLP|ROL|ROR|RTI|RTS|SBC|SEC|SED|SEI|STA|STX|STY|TAX|TAY|TSX|TXA|TXS|TYA)/, store:true},
        {type:"T_ADDRESS", regex:/^\$([\dA-F]{2,4})/, store:true},
        {type:"T_HEX_NUMBER", regex:/^\#\$?([\dA-F]{2})/, store:true},
        {type:'T_BINARY_NUMBER', regex:/\#%([01]{8})/, store:true}, 
        {type:'T_STRING', regex:/^"[^"]*"/, store:true},
        {type:'T_SEPARATOR', regex:/^,/, store:true},
        {type:'T_REGISTER', regex:/^(X|x|Y|y)/, store:true},
        {type:'T_OPEN', regex:/^\(/, store:true},
        {type:'T_CLOSE', regex:/^\)/, store:true},
        {type:'T_LABEL', regex:/^([a-zA-Z][a-zA-Z\d]*)\:/, store:true},
        {type:'T_MARKER', regex:/^[a-zA-Z][a-zA-Z\d]*/, store:true},
        {type:'T_DIRECTIVE', regex:/^\.[a-z]+/, store:true},
        {type:'T_NUM', regex:/^[\d]+/, store:true}, //TODO change to DECIMAL ARGUMENT
        {type:'T_ENDLINE', regex:/^\n/, store:true},
        {type:"T_WHITESPACE", regex:/^[ \t\r]+/, store:false},
        {type:'T_COMMENT', regex:/^;[^\n]*/, store:false}
    ];

    exports.lexical = function(code){
        return analyzer.analyse(code, asm65_tokens);
    };

    function look_ahead(tokens, index, type, value){
        if (index > tokens.length - 1){
            return 0;
        }
        var token = tokens[index];
        if (token.type == type){
            if (value === undefined || token.value == value){
                return 1;
            }
        }
        return 0;
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
                    return 1;
                }
            }
        }
        return 0;
    }

    function t_address_or_t_marker(tokens, index){
        return t_address(tokens, index);
    }

    function t_address(tokens, index){
        return look_ahead(tokens, index, 'T_ADDRESS');
    }

    function t_zeropage(tokens, index){
        if (t_address(tokens,index) && tokens[index].value.length == 3){
            return 1;
        }
        return 0;
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

    function t_endline(tokens, index){
        return look_ahead(tokens, index, 'T_ENDLINE', '\n');
    }

    function t_directive(tokens, index){
        return look_ahead(tokens, index, 'T_DIRECTIVE');
    }

    function t_num(tokens, index){
        return look_ahead(tokens, index, 'T_NUM');
    }

    var asm65_bnf = [
        {type:"S_RELATIVE", "bnf":[t_relative, t_address_or_t_marker]},
        {type:"S_IMMEDIATE", "bnf":[t_instruction, t_number]},
        {type:"S_ZEROPAGE_X", "bnf":[t_instruction, t_zeropage, t_separator, t_register_x]},
        {type:"S_ZEROPAGE_Y", "bnf":[t_instruction, t_zeropage, t_separator, t_register_y]},
        {type:"S_ZEROPAGE", "bnf":[t_instruction, t_zeropage]},
        {type:"S_ABSOLUTE_X", "bnf":[t_instruction, t_address_or_t_marker, t_separator, t_register_x]},
        {type:"S_ABSOLUTE_Y", "bnf":[t_instruction, t_address_or_t_marker, t_separator, t_register_y]},
        {type:"S_ABSOLUTE", "bnf":[t_instruction, t_address_or_t_marker]},
        {type:"S_INDIRECT_X", "bnf":[t_instruction, t_open, t_address_or_t_marker, t_separator, t_register_x, t_close]},
        {type:"S_INDIRECT_Y", "bnf":[t_instruction, t_open, t_address_or_t_marker, t_close, t_separator, t_register_y]},
        {type:"S_IMPLIED", "bnf":[t_instruction]}
    ];

    exports.syntax = function(tokens){
        var ast = [];
        var x = 0;
        var debug = 0;
        var labels = [];
        var code = [];
        while (x < tokens.length){
            if (t_directive(tokens,x) && t_num(tokens, x+1)){
                leaf = {};
                leaf.type = 'S_DIRECTIVE';
                leaf.directive = tokens[x];
                leaf.args = tokens[x+1];
                ast.push(leaf);
                x += 2;
            } else if (t_endline(tokens,x)){
                x++;
            } else {
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
                        var size = 0;
                        var walk = 0;
                        for (var b in asm65_bnf[bnf].bnf) {
                            size += asm65_bnf[bnf].bnf[b](tokens, x+walk);
                            walk++;
                        }
                        leaf.children = tokens.slice(x, x+size);
                        leaf.type = asm65_bnf[bnf].type;
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
        }
        return ast;
    };

    function get_value(token){
        if (token.type == 'T_ADDRESS'){
            m = asm65_tokens[1].regex.exec(token.value);
            return parseInt(m[1], 16);
        }else if (token.type == 'T_HEX_NUMBER'){
            m = asm65_tokens[2].regex.exec(token.value);
            return parseInt(m[1], 16);
        }
    }

    exports.semantic = function(ast, iNES){
        var cart = new cartridge.Cartridge();
        var labels = {};
        for (var l in ast) {
            var leaf = ast[l];
            if (leaf.type == 'S_DIRECTIVE'){

            }else {
                var instruction;
                switch(leaf.type){
                    case 'S_IMPLIED':
                        instruction = leaf.children[0].value;
                        address = false;
                        break;
                    case 'S_RELATIVE':
                    case 'S_IMMEDIATE':
                    case 'S_ZEROPAGE':
                    case 'S_ABSOLUTE':
                    case 'S_ZEROPAGE_X':
                    case 'S_ZEROPAGE_Y': 
                    case 'S_ABSOLUTE_X':
                    case 'S_ABSOLUTE_Y':
                        instruction = leaf.children[0].value;
                        address = get_value(leaf.children[1], labels);
                        break;
                    case 'S_INDIRECT_X':
                    case 'S_INDIRECT_Y':
                        instruction = leaf.children[0].value;
                        address = get_value(leaf.children[2], labels);
                        break;
                }
                var address_mode = c6502.address_mode_def[leaf.type].short;
                var opcode = c6502.opcodes[instruction][address_mode];
                if (address_mode != 'sngl'){
        /*            if ('rel' == address_mode:
                            address = 126 + (address - cart.pc)
                            if address == 128:
                                address = 0
                            elif address < 128:
                                address = address | 0b10000000
                            elif address > 128:
                                address = address & 0b01111111
        */
                        if (c6502.address_mode_def[leaf.type].size == 2){
                            cart.append_code([opcode, address]);
                        } else {
                            arg1 = (address & 0x00ff);
                            arg2 = (address & 0xff00) >> 8;
                            cart.append_code([opcode, arg1, arg2]);
                        }
                    } else {
                        cart.append_code([opcode]);
                    }
                }
        }
        if (iNES){
            return cart.get_ines_code();
        } else {
            return cart.get_code();
        }
    };
})(typeof exports === 'undefined'? this['compiler']={}: exports);
