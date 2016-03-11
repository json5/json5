// count-newlines.js
// Tests JSON5's line counting algorithm's support for the basic varieties of newline that we support - 
// LF, CR+LF and CR

"use strict";

var assert = require('assert');
var JSON5 = require('..');

// Each of these cases should give rise to a parse error with the same coordinates
var cases = {
    LF:   "{\u000a    10thing",
    CRLF: "{\u000d\u000a    10thing",
    CR:   "{\u000d    10thing"
};

var spec = {
    lineNumber: 2,
    columnNumber: 5
};

exports['count-newlines'] = {};

Object.keys(cases).forEach(function (key) {
    var str = cases[key];
    exports['count-newlines'][key] = function () {
        var err;
        try {
            JSON5.parse(str);
        } catch (e) {
            err = e;
        }
        assert(err, 'Expected JSON5 parsing to fail.');
        assert.equal(err.lineNumber, spec.lineNumber);
        assert.equal(err.columnNumber, spec.columnNumber);
    };
});
