if (typeof requirejs !== 'function') { var requirejs = require('requirejs'); }

var test_files = [];
var TEST_REGEXP = /(\w{3}_test)\.js$/;

Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
        //console.log(file);
        test_files.push(file);
    }
});

requirejs.config({
    baseUrl: '/base',
    deps: test_files,
    callback: window.__karma__.start
});