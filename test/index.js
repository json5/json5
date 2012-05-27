var assert = require('assert');
var FS = require('fs');
var JSON5 = require('..');
var Path = require('path');

// Load the readme example JSON and compare it using JSON5 and eval().
// It should eval() fine, and the values from both should be the same.

var path = Path.resolve(__dirname, 'example.json5');
var str = FS.readFileSync(path, 'utf8');

var objExp = eval('(' + str + ')');
var objAct = JSON5.parse(str);

assert.deepEqual(objAct, objExp);
console.log('Test passed!');
