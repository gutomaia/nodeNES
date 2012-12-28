var assert = require('assert');
var Buffer = require('buffer').Buffer;

var sys = require('util');

var jsdom = require("jsdom");
var jQuery = require('jquery');

var document = null;
var window = null;
var $ = null;

var TabManager = require('../lib/ide/tabs.js');

var mock_ide = {
};

exports.setUp = function (callback) {
    document = jsdom.jsdom('<html><body><ul class="nav nav-tabs" id="tabs"></ul></body></html>');
    window = document.createWindow();
    $ = jQuery.create(window);
    callback();
};

exports.tearDown = function(callback){
    document = window = $ = null;
    callback();
};

exports.test_new_tab = function(test){
    var tm = new TabManager(mock_ide, $, document);
    test.ok(tm.createTab('test.asm'));
    test.done();
};

exports.test_new_tab_with_example_background = function(test){
    var tm = new TabManager(mock_ide, $, document);
    test.equal(tm.tabs.length, 0);
    test.ok(tm.createTab('/example/background3/background3.asm'));
    test.equal(tm.tabs.length, 1);
    test.equal(tm.tabs[0].firstChild.innerHTML, 'background3.asm');
    href = '#' + tm.tabs[0].firstChild.href.split('#')[1];
    test.equal(href, '#tab/example/background3/background3.asm');
    //test.equal(document.innerHTML, 'a');
    test.equal($('#tabs li.active').length, 1);
    test.done();
};

exports.test_create_two_tabs = function(test) {
    var tm = new TabManager(mock_ide, $, document);
    test.equal(tm.tabs.length, 0);
    test.ok(tm.createTab('/example/movingsprite/movingsprite.asm'));
    test.ok(tm.createTab('/example/movingsprite/player.chr'));
    test.equal(tm.tabs.length, 2);
    test.done();
};

exports.test_next_tab = function(test) {
    var tm = new TabManager(mock_ide, $, document);
    test.equal(tm.tabs.length, 0);
    test.ok(tm.createTab('/example/movingsprite/movingsprite.asm'));
    test.equal(tm.tabs.length, 1);
    test.ok(tm.createTab('/example/movingsprite/player.chr'));
    test.equal(tm.tabs.length, 2);
    test.done();
};