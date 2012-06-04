
function mock_require(module){
    var regex = /([a-z\d]+)\.js$/;
    var m = regex.exec(module);
    if (m){
        return eval(m[1]);
    } else {
        console.log(module);
    }
}

if(typeof require == 'undefined'){
    var require = mock_require;
}