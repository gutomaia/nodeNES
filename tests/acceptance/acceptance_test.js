var assert = require('assert');

var webdriver = require('selenium-webdriver');


exports.test_navigation_test = function(test){
    var driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();

    driver.get('http://localhost:8888');
    //driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
    //driver.findElement(webdriver.By.name('btnG')).click();
    driver.wait(function() {
      return driver.getTitle().then(function(title) {
        return title === 'nodeNES';
      });
    }, 1000);

    driver.quit();
    test.done();
};