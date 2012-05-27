// json5.js
// Modern JSON. See README.md for details.

// TODO Support a reviver argument like the native JSON.parse().
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/JSON/parse
exports.parse = function (str) {
    // TODO Actually implement! XXX FIXME For now, stubbing via eval().
    // Works since JSON5 is a subset of ES5.
    // Remember to wrap in parentheses since {...} can be ambiguous.
    return eval('(' + str + ')');
};

exports.stringify = function (obj, replacer, space) {
    // Since regular JSON is a strict subset of JSON5, we'll always output as
    // regular JSON to foster better interoperability. TODO Should we not?
    return JSON.stringify.apply(JSON, arguments);
};
