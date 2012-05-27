var assert = require('assert');
var FS = require('fs');
var JSON5 = require('..');
var Path = require('path');

// Test JSON5.parse() with each test case under /cases by comparing its output
// with eval(). If the input is valid, it should eval() fine since JSON5 is a
// pure subset of ES5, and the JSON5.parse() output should match eval()'s. If
// the input *isn't* valid, eval() will throw an error, and JSON5.parse()
// should too. Remember to wrap the input in parentheses before eval()'ing,
// since {...} is ambiguous in JavaScript.

// TODO More test cases, and ones that test specific features and edge cases.
// Mozilla's test cases are a great inspiration and reference here:
// http://mxr.mozilla.org/mozilla-central/source/js/src/tests/ecma_5/JSON/

var dirPath = Path.resolve(__dirname, 'cases');
var files = FS.readdirSync(dirPath);

function createTest(fileName) {
    var filePath = Path.join(dirPath, fileName);
    var str = FS.readFileSync(filePath, 'utf8');

    function parse() {
        return JSON5.parse(str);
    }

    exports[fileName] = function test() {
        var objAct, objExp;

        try {
            objExp = eval('(' + str + ')');
        } catch (err) {}

        if (objExp) {
            assert.deepEqual(parse(), objExp);
        } else {
            assert.throws(parse);
        }
    };
}

for (var i = 0; i < files.length; i++) {
    createTest(files[i]);
}
