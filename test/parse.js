// parse.js
// Tests parse(). See readme.txt for details.

var assert = require('assert');
var FS = require('fs');
var JSON5 = require('..');
var Path = require('path');

// Test JSON5.parse() by comparing its output for each case with either the
// native JSON.parse() or ES5 strict-mode eval(). See readme.txt for details.
// For eval(), remember to wrap the input in parentheses before eval()'ing,
// since {...} is ambiguous in JavaScript. Also ensure the parentheses are on
// lines of their own, to support inline comments.

// TODO More test cases, and ones that test specific features and edge cases.
// Mozilla's test cases are a great inspiration and reference here:
// http://mxr.mozilla.org/mozilla-central/source/js/src/tests/ecma_5/JSON/

var TYPES = ['json', 'es5'];

var dirPathBase = Path.resolve(__dirname, 'cases-');

function createTest(fileName, type) {
    var ext = Path.extname(fileName);
    var filePath = Path.join(dirPathBase + type, fileName);
    var str = FS.readFileSync(filePath, 'utf8');

    function parseJSON5() {
        return JSON5.parse(str);
    }

    function parseJSON() {
        return JSON.parse(str);
    }

    function parseES5() {
        return eval('"use strict"; (\n' + str + '\n)');
    }

    exports[type][fileName] = function test() {
        switch (ext) {
            case '.json':
                assert.deepEqual(parseJSON5(), parseJSON());
                break;
            case '.json5':
                assert.throws(parseJSON);       // test validation
                assert.deepEqual(parseJSON5(), parseES5());
                break;
            case '.js':
                assert.throws(parseJSON);       // test validation
                assert.doesNotThrow(parseES5);  // test validation
                assert.throws(parseJSON5);
                break;
            case '.txt':
                assert.throws(parseES5);        // test validation
                assert.throws(parseJSON5);
                break;
        }
    };
}

TYPES.forEach(function (type) {
    exports[type] = {};
    FS.readdirSync(dirPathBase + type).forEach(function (file) {
        createTest(file, type);
    });
});
