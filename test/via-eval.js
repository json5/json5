var assert = require('assert');
var FS = require('fs');
var JSON5 = require('..');
var Path = require('path');

// Test JSON5.parse() with each test case under /cases by comparing its output
// with eval(). It should eval() fine since JSON5 is a pure subset of ES5.
// Remember to wrap in parentheses before eval()'ing since {...} is ambiguous.

// TODO More test cases, and ones that test specific features and edge cases.
// Mozilla's test cases are a great inspiration and reference here:
// http://mxr.mozilla.org/mozilla-central/source/js/src/tests/ecma_5/JSON/

var dirPath = Path.resolve(__dirname, 'cases');
var files = FS.readdirSync(dirPath);

function createTest(fileName) {
    var filePath = Path.join(dirPath, fileName);
    var str = FS.readFileSync(filePath, 'utf8');

    exports[fileName] = function () {
        var objExp = eval('(' + str + ')');
        var objAct = JSON5.parse(str);

        assert.deepEqual(objAct, objExp);
    };
}

for (var i = 0; i < files.length; i++) {
    createTest(files[i]);
}
