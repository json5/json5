// tests stringify()

/*global require console exports */

// set to true to show performance stats
var DEBUG = false;

var assert = require('assert');
var JSON5 = require('../lib/json5');

// Test JSON5.stringify() by comparing its output for each case with 
// native JSON.stringify().  The only differences will be in how object keys are 
// handled.

exports.stringify = {};
exports.stringify.simple = function test() {
	assertStringify(null);
	assertStringify(9);
	assertStringify('');
	assertStringify("''");
	assertStringify('999');
	assertStringify('9aa');
	assertStringify('aaa');
	assertStringify('aa a');
	assertStringify(undefined);
	assertStringify(true);
	assertStringify(false);
	assertStringify({});
	assertStringify([]);
	assertStringify(function() {});
};

exports.stringify.arrays = function test() {
	assertStringify([""]);
	assertStringify([1, 2]);
	assertStringify([undefined]);
	assertStringify([1, 'fasds']);
	assertStringify([1, 'fasds', ['fdsafsd'], null]);
	assertStringify([1, 'fasds', ['fdsafsd'], null, function(aaa) { return 1; }, false ]);
	assertStringify([1, 'fasds', ['fdsafsd'], undefined, function(aaa) { return 1; }, false ]);
};

exports.stringify.objects = function test() {
	assertStringify({a:1, b:2});
	assertStringify({"":1, b:2});
	assertStringify({9:1, b:2});
	assertStringify({"9aaa":1, b:2});
	assertStringify({aaaa:1, bbbb:2});
	assertStringify({a$a_aa:1, bbbb:2});
	assertStringify({"a$a_aa":1, 'bbbb':2});
	assertStringify({"a$a_aa":[1], 'bbbb':{a:2}});
	assertStringify({"this is a crazy long key":1, 'bbbb':2});
	assertStringify({"a$22222_aa":[1], 'bbbb':{aaaa:2, name:function(a,n,fh,h) { return 'nuthin'; } , foo: undefined}});
	assertStringify({"a$222222_aa":[1], 'bbbb':{aaaa:2, name:'other', foo: undefined}});
	assertStringify({"a$222222_aa":[1, {}, undefined, function() { }, { jjj: function() { } }], 'bbbb':{aaaa:2, name:'other', foo: undefined}});
	
	// using same obj multiple times
	var innerObj = {a: 9, b:6};
	assertStringify({a : innerObj, b: innerObj, c: [innerObj, innerObj, innerObj]});
};

// we expect errors from all of these tests.  The errors should match
exports.stringify.circular = function test() {
	var obj = { };
	obj.obj = obj;
	assertStringify(obj);
	
	var obj2 = {inner1: {inner2: {}}};
	obj2.inner1.inner2.obj = obj2;
	assertStringify(obj2);

	var obj3 = {inner1: {inner2: []}};
	obj3.inner1.inner2[0] = obj3;
	assertStringify(obj3);
};
exports.stringify.formatting = function test() {

};

function stringifyJSON5(obj, space) {
	var start, res, end;
	try {
		start = new Date();
		res = JSON5.stringify(obj, null, space);
		end = new Date();
	} catch (e) {
		res = e.message;
		end = new Date();
	}
	if (DEBUG) {
		console.log('JSON5.stringify time: ' + (end-start));
	}
	return res;
}

function stringifyJSON(obj, space) {
	var start, res, end;
	
	try {
		start = new Date();
		res = JSON.stringify(obj, null, space);
		end = new Date();
	
		// now remove all quotes from keys where appropriate
		// first recursively find all key names
		var keys = [];
		function findKeys(innerObj) {
			if (typeof innerObj === 'object') {
				if (innerObj === null) {
					return;
				} else if (Array.isArray(innerObj)) {
					for (var i = 0; i < innerObj.length; i++) {
						findKeys(innerObj[i]);
					}
				} else {
					for (var prop in innerObj) {
						if (innerObj.hasOwnProperty(prop)) {
							if (JSON5.isWord(prop) &&
								typeof innerObj[prop] !== 'function' &&
								typeof innerObj[prop] !== 'undefined') {
								keys.push(prop);
								findKeys(innerObj[prop]);
							}
						}
					}
				}
			}
		}
		findKeys(obj);
		
		// now replace each key in the result
		var last = 0;
		for (var i = 0; i < keys.length; i++) {
		
			// not perfect since we can match on parts of the previous value that 
			// matches the key, but we can design our test around that.
			last = res.indexOf('"' + keys[i] + '"', last);
			if (last === -1) {
				// problem with test framework
				console.log("Couldn't find: " + keys[i]);
			}
			res = res.substring(0, last) + 
				res.substring(last+1, last + keys[i].length+1) + 
				res.substring(last + keys[i].length + 2, res.length);
			last += keys[i].length;
		}
	} catch (e) {
		res = e.message;
		end = new Date();
	}
	if (DEBUG) {
		console.log('JSON.stringify time: ' + (end-start));
	}
	return res;
}

function assertStringify(obj, space) {
	var j5 = stringifyJSON5(obj, space);
	var j = stringifyJSON(obj, space);
	assert.equal(j5, j);
}