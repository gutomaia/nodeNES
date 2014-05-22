var assert = require('assert');

var webdriver = require('selenium-webdriver');

exports.setUp = function(callback){
    this.driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
    this.driver.get('http://localhost:8888');
    callback();
};

exports.tearDown = function(callback){
    this.driver.quit().then(callback);
};


exports.test_navigation_test = function(test){
    var driver = this.driver;
    driver.wait(function() {
      return driver.getTitle().then(function(title) {
        return title === 'nodeNES';
      });
    }, 1000).then(function(bool){
        driver.getTitle().then(function(title) {
            test.equal(title, 'nodeNES');
            test.done();
        });
    });
};


exports.test_menu_display_nice = function(test){
    var driver = this.driver;

    driver.wait(function() {
        //TODO: should be for invisible
        return driver.findElement({tagName:'ul', className:'dropdown-menu'}).isDisplayed();
    }, 1000).then(
        function(){
            var examples = driver.findElement({tagName:'a', className:'dropdown-toggle'});
            test.ok(examples.isDisplayed());
            var menu = driver.findElement({tagName:'ul', className:'dropdown-menu'});
            //test.ok(!menu.isDisplayed());
            test.done();
    });
};

exports.test_menu_working = function(test){
    var driver = this.driver;

    driver.wait(function() {
        //TODO: should be for invisible
        return driver.findElement({tagName:'a', className:'dropdown-toggle'}).isDisplayed();
    }, 1000).then(
        function(){
            var examples = driver.findElement({tagName:'a', className:'dropdown-toggle'});
            examples.click();
            test.done();
    });
};