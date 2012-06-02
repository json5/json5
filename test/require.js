// require.js
// Tests JSON5's require() hook.
//
// Important: expects the following test cases to be present:
// - /cases-json/npm-package.json
// - /cases-es5/npm-package.json5

var assert = require('assert');

exports['require hook'] = function () {
    require('../require');

    var json = require('./cases-json/npm-package');
    var json5 = require('./cases-es5/npm-package');

    assert.deepEqual(json5, json);
};
