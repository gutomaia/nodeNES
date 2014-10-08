// Karma configuration
// Generated on Wed May 07 2014 23:36:30 GMT-0300 (BRT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['nodeunit'],


    // list of files / patterns to load in the browser
    files: [
      "external/jquery.js",
      "external/underscore.js",
      "external/require.js",

      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'tests_browser/*.js', included: false},
      //{pattern: 'tests/*.js', included: false}
      'tests/browser/require.config.js',
      'tests/browser/instruction_suite.js'
    ],


    // list of files to exclude
    exclude: [
      'lib/init.js',
      '**/*.swp',
      'tests_browser/cartridge_test.js',
      'tests_browser/compiler_test.js',
      'tests_browser/directive_test.js',
      'tests_browser/hex_assert_test.js',
      'tests_browser/lexical_errors_test.js',
      'tests_browser/movingsprite_test.js',
      'tests_browser/pyne2014_test.js',
      'tests_browser/pythonbrasil8_test.js',
      'tests_browser/scrolling_test.js',
      'tests_browser/speclatalk_test.js',
      'tests_browser/sprite_test.js',
      'tests_browser/utils_jquery_test.js',
      'tests_browser/utils_requestfilesystem_test.js',
      'tests_browser/ui_canvas_test.js',
      'tests_browser/ui_events_test.js',
      'tests_browser/ui_test.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
