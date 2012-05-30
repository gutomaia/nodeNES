(function(exports){

    exports.analyse = function(code, tokenTypes){
        var tokens = [];
        var ttype = null;
        var line = 1;
        var column = 1;
        while (code.length > 0){
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
                    code = code.substring(m[0].length);
                    break;
                }
            }
            if (!found){
                console.log("Unknow Token code: " + code);
                e = "Unknow Token Code: " + code;
                throw e;
            }
        }
        return tokens;
    };
})(typeof exports === 'undefined'? this['analyzer']={}: exports);