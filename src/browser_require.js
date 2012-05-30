
function mock_require(module){
    var regex = /([a-z]+)\.js$/;
    var m = regex.exec(module);
    return eval(m[1]);
}

if(typeof require == 'undefined'){
    var require = mock_require;
}