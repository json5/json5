// cases.js
// Tests each test case. See readme.txt for details.

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
var files = {};

function createTest(fileName, type) {
    'use strict';

    var filePath = Path.join(dirPathBase + type, fileName);
    var str = FS.readFileSync(filePath, 'utf8');

    function parseJSON5() {
        return JSON5.parse(str);
    }

    function parseType() {
        switch (type) {
            case 'json':
                return JSON.parse(str);
            case 'es5':
                return eval('(\n' + str + '\n)');
        }
    }

    exports[fileName] = function test() {
        var objExp, valid = false;

        try {
            objExp = parseType();
            valid = true;
        } catch (err) {}

        if (valid) {
            assert.deepEqual(parseJSON5(), objExp);
        } else {
            assert.throws(parseJSON5);
        }
    };
}

TYPES.forEach(function (type) {
    FS.readdirSync(dirPathBase + type).forEach(function (file) {
        createTest(file, type);
    });
});
