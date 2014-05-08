var assert = require('nodeunit').assert;
require('colors');

var HexaAssertionError = function(message) {
	var err = new Error(message);

	err.name = 'HexaAssertionError';
	this.name = err.name;

	this.stack = err.stack;

	this.toString = function() {
		return this.name + ': ' + this.message;
	};
};

HexaAssertionError.prototype = Error.prototype;
HexaAssertionError.prototype.name = 'HexaAssertionError';

var equals = function(expected, actual) {
	try {
		assert.deepEqual(expected, actual);
	} catch (e) {
		var line = 0;
		var	lines = [];
		var cursor = 0;
		var out = '';

		while (cursor < expected.length || cursor < actual.length) {
			for (var a = 0; a < 16; a++) {
				if (cursor < expected.length && cursor < actual.length) {
					if (expected[cursor] !== actual[cursor] && lines.indexOf(line) === -1) {
						lines.push(line);
					}
				}
				cursor += 1;
			}
			line += 1;
		}	

		var exp = '';
		var act = '';
		for (line in lines) {
			exp = '\tExpected: ' + ('000' + line).slice(-5) + ': ';
			act = '\tActual  : ' + ('000' + line).slice(-5) + ': ';
			for (var b = 0; b < 16; b++) {
				cursor = (line * 16) + b;

				if (cursor < expected.length && cursor < actual.length) {
					if (expected[cursor] !== actual[cursor]) {
						exp += ('0' + expected[cursor]).toString(16).substr(-2).toUpperCase().green;
						act += ('0' + actual[cursor]).toString(16).substr(-2).toUpperCase().red;
					} else {
						exp += ('0' + expected[cursor]).toString(16).substr(-2).toUpperCase();
						act += ('0' + actual[cursor]).toString(16).substr(-2).toUpperCase();
					}
				}

				if (((b+1) % 2) === 0) {
                    exp += ' ';
                    act += ' ';
                }
				
			}
			out += '\n' + exp + '- ' + (line + 1);
			out += '\n' + act + '- ' + (line + 1);
		}
        throw new HexaAssertionError(out);
	}
	return true;
};

exports.equals = equals;
