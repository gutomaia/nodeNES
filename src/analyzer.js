(function(exports){

    exports.analyse = function(code, tokenTypes){
        var tokens = [];
        var ttype = null;
        var line = 1;
        var column = 1;
        var erros = [];
        while (code.length > 0 && code != '0'){ //TODO UNKNOW BUG
            var found = false;
            for (var t in tokenTypes){
                if (code.match(tokenTypes[t].regex)){
                    found = true;
                    var m = tokenTypes[t].regex.exec(code);
                    if (tokenTypes[t].store){
                        token = {
                            "type":tokenTypes[t].type,
                            "value":m[0],
                            "line":line,
                            "column":column
                        };
                        tokens.push(token);
                    }
                    if (m[0] == "\n"){
                        line++;
                        column = 1;
                    } else {
                        column += m[0].length;
                    }
                    code = code.substring(m[0].length);
                    break;
                }
            }
            if (!found){
                var invalid = code.match(/^\S+/);
                var err = {
                    type:"INVALID TOKEN:",
                    line: line,
                    column: column,
                    //position: position,
                    value: invalid[0]
                };
                column += invalid[0].length;
                code = code.substring(invalid[0].length);
                //console.log("Unknow Token code: " + code);
                erros.push(err);
            }
        }
        if (erros.length > 0){
            throw {erros:erros, tokens:tokens};
        } else {
            return tokens;
        }
    };
})(typeof exports === 'undefined'? this['analyzer']={}: exports);