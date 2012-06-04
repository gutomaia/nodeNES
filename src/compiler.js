(function(exports){

    var analyzer = require('./analyzer.js');
    var c6502 = require('./c6502.js');
    var cartridge = require('./cartridge.js');
    var directives = require('./directives.js');

    var asm65_tokens = [
        {type:"T_INSTRUCTION", regex:/^(ADC|AND|ASL|BCC|BCS|BEQ|BIT|BMI|BNE|BPL|BRK|BVC|BVS|CLC|CLD|CLI|CLV|CMP|CPX|CPY|DEC|DEX|DEY|EOR|INC|INX|INY|JMP|JSR|LDA|LDX|LDY|LSR|NOP|ORA|PHA|PHP|PLA|PLP|ROL|ROR|RTI|RTS|SBC|SEC|SED|SEI|STA|STX|STY|TAX|TAY|TSX|TXA|TXS|TYA)/, store:true},
        {type:"T_ADDRESS", regex:/^\$([\dA-F]{2,4})/, store:true},
        {type:"T_HEX_NUMBER", regex:/^\#\$?([\dA-F]{2})/, store:true},
        {type:'T_BINARY_NUMBER', regex:/^\#%([01]{8})/, store:true}, 
        {type:'T_STRING', regex:/^"[^"]*"/, store:true},
        {type:'T_SEPARATOR', regex:/^,/, store:true},
        {type:'T_REGISTER', regex:/^(X|x|Y|y)/, store:true},
        {type:'T_OPEN', regex:/^\(/, store:true},
        {type:'T_CLOSE', regex:/^\)/, store:true},
        {type:'T_LABEL', regex:/^([a-zA-Z][a-zA-Z\d]*)\:/, store:true},
        {type:'T_MARKER', regex:/^[a-zA-Z][a-zA-Z\d]*/, store:true},
        {type:'T_DIRECTIVE', regex:/^\.[a-z]+/, store:true},
        {type:'T_DECIMAL_ARGUMENT', regex:/^[\d]+/, store:true}, //TODO change to DECIMAL ARGUMENT
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
            if (value === undefined || token.value.toUpperCase() == value.toUpperCase()){
                return 1;
            }
        }
        return 0;
    }

    function t_instruction(tokens, index){
        return look_ahead(tokens, index, 'T_INSTRUCTION');
    }

    function t_hex_number(tokens, index){
        return look_ahead(tokens, index, 'T_HEX_NUMBER');
    }

    function t_binary_number(tokens, index){
        return look_ahead(tokens, index, 'T_BINARY_NUMBER');
    }

    function t_number(tokens, index){
        return OR([t_hex_number, t_binary_number], tokens, index);
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

    function t_label(tokens, index){
        return look_ahead(tokens, index, 'T_LABEL');
    }

    function t_marker(tokens, index){
        return look_ahead(tokens, index, 'T_MARKER');
    }

    function t_address_or_t_marker(tokens, index){
        return OR([t_address, t_marker], tokens, index);
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

    function OR(args, tokens, index){
        for (var t in args){
            if (args[t](tokens, index)){
                return args[t](tokens, index);
            }
        }
        return 0;
    }

    function t_directive(tokens, index){
        return look_ahead(tokens, index, 'T_DIRECTIVE');
    }

    function t_directive_argument(tokens, index){
        return OR([t_list, t_address, t_marker, t_decimal_argument, t_string], tokens, index);
    }

    function t_decimal_argument(tokens, index){
        return look_ahead(tokens, index, 'T_DECIMAL_ARGUMENT');
    }

    function t_string(tokens, index){
        return look_ahead(tokens, index, 'T_STRING');
    }

    function t_list(tokens, index){
        if (t_address(tokens, index) && t_separator(tokens, index+1)){
            var islist = 1;
            var arg = 0;
            while (islist){
                islist = islist & t_separator(tokens, index + (arg * 2) + 1);
                islist = islist & t_address(tokens, index + (arg * 2) + 2);
                if (t_endline(tokens, index + (arg * 2) + 3) || index + (arg * 2) + 3 == tokens.length){
                    break;
                }
                arg++;
            }
            if (islist){
                return ((arg+1) * 2) +1;
            }
        }
        return 0;
    }

    var asm65_bnf = [
        {type:"S_DIRECTIVE", bnf:[t_directive, t_directive_argument]},
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
            if (t_label(tokens,x)){
                labels.push(get_value(tokens[x]));
                x++;
            }else if (t_endline(tokens,x)){
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
                        if (labels.length > 0){
                            leaf.labels = labels;
                            labels = [];
                        }
                        var size = 0;
                        var walk = 0;
                        for (var b in asm65_bnf[bnf].bnf) {
                            size += asm65_bnf[bnf].bnf[b](tokens, x+walk);
                            walk++;
                        }
                        leaf.children = tokens.slice(x, x+size);
                        leaf.type = asm65_bnf[bnf].type;
                        ast.push(leaf);
                        x += size;
                        break;
                    }
                    debug++;
                    if (debug > 1000){
                        console.log("DEBUG ERROR--");
                        console.log(x);
                        console.log(ast[ast.length-1]);
                        console.log(tokens[x]);
                        throw "DEBUG ERROR";
                    }
                }
            }
        }
        return ast;
    };

    function get_value(token, labels){
        if (token.type == 'T_ADDRESS'){
            m = asm65_tokens[1].regex.exec(token.value);
            return parseInt(m[1], 16);
        }else if (token.type == 'T_HEX_NUMBER'){
            m = asm65_tokens[2].regex.exec(token.value);
            return parseInt(m[1], 16);
        }else if (token.type == 'T_BINARY_NUMBER'){
            m = asm65_tokens[3].regex.exec(token.value);
            return parseInt(m[1], 2);
        }else if (token.type == 'T_DECIMAL_ARGUMENT'){
            return parseInt(token['value'],10);
        }else if (token.type == 'T_LABEL'){
            m = asm65_tokens[9].regex.exec(token.value);
            return m[1];
        }else if (token.type == 'T_MARKER'){
            return labels[token.value];
        } else if (token.type == 'T_STRING'){
            return token.value.substr(1, token.value.length - 2);
        } else {
            console.log("Could not get that value");
            console.log(token);
            throw "Could not get that value";
        }
    }

    exports.semantic = function(ast, iNES){
        var cart = new cartridge.Cartridge();
        var labels = {};
        var leaf;
        //find all labels o the symbol table
        var address = 0;
        for (var la in ast){
            leaf = ast[la];
            if (leaf.type == 'S_DIRECTIVE'){
                var _directive = leaf.children[0].value;
                if ('.org' == _directive){
                    address = parseInt(leaf.children[1].value.substr(1),16);
                }
            }
            if (leaf.labels !== undefined){
                labels[leaf.labels[0]] = address;
            }
            if (leaf.type != 'S_DIRECTIVE'){
                size = c6502.address_mode_def[leaf.type].size;
                address += size;
            }
        }
        labels.palette = 0xE000; //#TODO stealing on test
        labels.sprites = 0xE000 + 32; //#TODO stealing on test

        //Translate opcodes
        for (var l in ast) {
            leaf = ast[l];
            if (leaf.type == 'S_DIRECTIVE'){
                var directive = leaf.children[0].value;
                var argument;
                if (leaf.children.length == 2){
                    argument = get_value(leaf.children[1], labels);
                } else {
                    argument = leaf.children.slice(1, leaf.children.length);
                }
                directives.directive_list[directive](argument, cart);
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
                    if ('rel' == address_mode){
                        address = 126 + (address - cart.pc);
                        if (address == 128){
                            address = 0;
                        } else if (address < 128){
                            address = address | 128;
                        } else if (address > 128){
                            address = address & 127;
                        }
                    }
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
