// parse.js
// Tests parse(). See readme.txt for details.

"use strict";

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

var dirsPath = Path.resolve(__dirname, 'parse-cases');
var dirs = FS.readdirSync(dirsPath);

var readErrorSpec = function (filePath) {
    var specName = Path.basename(filePath, '.txt') + '.errorSpec';
    var specPath = Path.join(Path.dirname(filePath), specName);
    var specTxt;
    try {
        specTxt = FS.readFileSync(specPath); // note that existsSync has been deprecated
    } catch (e) {}
    if (specTxt) {
        try {
            return JSON5.parse(specTxt);
        } catch (err) {
            err.message = 'Error reading error specification file ' + specName + ': ' + err.message;
            throw err;
        }
    }
};

var testParseJSON5 = function (filePath, str) {
    var errorSpec = readErrorSpec(filePath);
    var err;
    try {
        JSON5.parse(str);
    } catch (e) {
        err = e;
    }
    assert(err, 'Expected JSON5 parsing to fail.');
    if (errorSpec) {
        describe("Error fixture " + filePath, function () {
        Object.keys(errorSpec).forEach(function (key) {
            if (key === 'message') {
                it('Expected error message\n' + err.message + '\nto start with ' + errorSpec.message, function () {
                    assert(err.message.indexOf(errorSpec.message) === 0);
                });
            } else {
                it('Expected parse error field ' + key + ' to hold value ' + errorSpec[key], function () {
                    assert.equal(err[key], errorSpec[key]);
                });
            }
        })
        });
    }
};

function createTest(fileName, dir) {
    var ext = Path.extname(fileName);
    var filePath = Path.join(dirsPath, dir, fileName);
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

    exports[dir][fileName] = function test() {
        switch (ext) {
            case '.json':
                assert.deepEqual(parseJSON5(), parseJSON(),
                    'Expected parsed JSON5 to equal parsed JSON.');
                break;
            case '.json5':
                assert.throws(parseJSON,        // test validation
                    'Test case bug: expected JSON parsing to fail.');
                // Need special case for NaN as NaN != NaN
                if ( fileName === 'nan.json5' ) {
                  assert.equal( isNaN( parseJSON5() ), isNaN( parseES5() ),
                    'Expected parsed JSON5 to equal parsed ES5.');
                }
                else {
                  assert.deepEqual( parseJSON5(), parseES5(),
                    'Expected parsed JSON5 to equal parsed ES5.');
                }
                break;
            case '.js':
                assert.throws(parseJSON,        // test validation
                    'Test case bug: expected JSON parsing to fail.');
                assert.doesNotThrow(parseES5,   // test validation
                    'Test case bug: expected ES5 parsing not to fail.');
                assert.throws(parseJSON5,
                    'Expected JSON5 parsing to fail.');
                break;
            case '.txt':
                assert.throws(parseES5,         // test validation
                    'Test case bug: expected ES5 parsing to fail.');
                testParseJSON5(filePath, str);
                break;
        }
    };
}

dirs.forEach(function (dir) {
    // create a test suite for this group of tests:
    exports[dir] = {};

    // skip the TODO directory -- these tests are expected to fail:
    if (dir === 'todo') {
        return;
    }

    // otherwise create a test for each file in this group:
    FS.readdirSync(Path.join(dirsPath, dir)).forEach(function (file) {
        createTest(file, dir);
    });
});
