#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodeunit = require('./node_modules/nodeunit/lib/nodeunit'),
    utils = require('./node_modules/nodeunit/lib/utils'),
    fs = require('fs'),
    path = require('path'),
    growl = require('growl'),
    AssertionError = require('assert').AssertionError;

/**
 * Reporter info string
 */

exports.info = "Reporter for TDD and Dojos";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

exports.run = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/node_modules/nodeunit/bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var start = new Date().getTime();

    var opts = {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleDone: function (name, assertions) {
            if (assertions.failures()) {
                console.log('');
                process.stdout.write(name + ': ');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError && a.message) {
                            console.log('Assertion in test ' + a.testname + ': ' + a.message);
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }

        },
        testStart: function () {
        },
        testDone: function (name, assertions) {
            if (!assertions.failures()) {
                process.stdout.write('.');
            }
            else {
                process.stdout.write('F');
                assertions.forEach(function (assertion) {
                    assertion.testname = name;
                });
            }
        },
        done: function (assertions) {
            var end = new Date().getTime();
            var duration = end - start;
            var msg;
            if (assertions.failures()) {
                msg = '\nFAILURES: ' + assertions.failures() + '/' + assertions.length + ' assertions failed (' + assertions.duration + 'ms)';
            } else {
                msg = '\nOK: ' + assertions.length + ' assertions (' + assertions.duration + 'ms)';
            }
            console.log(msg);
            growl(msg, {title:"nodeNES"});

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        }
    };

    if (files && files.length) {
        var paths = files.map(function (p) {
            return path.join(process.cwd(), p);
        });
        nodeunit.runFiles(paths, opts);
    } else {
        nodeunit.runModules(files,opts);
    }
};

try {
    nodeunit.reporters.tdd = exports;
    var reporter = nodeunit.reporters.tdd;
}
catch(e) {
    console.log("Cannot find nodeunit module.");
    process.exit();
}

process.chdir(__dirname);
reporter.run(['tests']);


