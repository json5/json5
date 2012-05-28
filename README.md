# JSON5 – Modern JSON

JSON is strict. Keys need to be quoted; strings can only be double-quoted;
objects and arrays can't have trailing commas; and comments aren't allowed.

Using such a strict subset of "JavaScript object notation" was likely for the
best at the time, but with modern ECMAScript 5 engines like V8 in Chrome and
Node, these limitations are cumbersome.

JSON5 does for JSON what ES5 did for ES3. It also is to regular ES5 what JSON
was to ES3 — a pure subset.

This module provides a replacement for ES5's native `JSON.parse()` method that
understands these additions. The parser is based directly off of Douglas
Crockford's `eval()`-free [json_parse.js][], which means it's both safe and
robust. Give it a try!

## Features

- Object keys don't need to be quoted if they contain no special characters.
  Yes, even reserved keywords are valid unquoted keys in ES5.
  *[TODO: Unicode characters and escape sequences aren't yet supported in
  unquoted keys.]*

- Strings can be single-quoted.

- Strings can be multi-line; just prefix the newline with a backslash.

- Objects and arrays can have trailing commas.

- Both inline (single-line) and block (multi-line) comments are allowed.

- *[IDEA: Allow octal and hexadecimal numbers.]*

## Example

```js
{
    foo: 'bar',
    while: true,
    
    this: 'is a\
 multi-line string',
 
    // this is an inline comment
    here: 'is another', // inline comment
    
    /* this is a block comment
       it continues on another line */
       
    finally: 'a trailing comma',
    oh: [
        'we shouldn\'t forget',
        'arrays can have',
        'trailing commas too',
    ],
}
```

## Installation

Via npm on Node:

```
npm install json5
```

```js
var JSON5 = require('json5');
```

Or in the browser (adds the `JSON5` object to the global namespace):

```html
<script src="json5.js"></script>
```

## Usage

```js
var obj = JSON5.parse('{unquoted:"key",trailing:"comma",}');
var str = JSON5.stringify(obj);
console.log(obj);
console.log(str);
```

`JSON5.stringify()` is currently aliased to the native `JSON.stringify()` in
order for the output to be fully compatible with all JSON parsers today.

## Development

```
git clone git://github.com/aseemk/json5.git
cd json5
npm link
npm test
```

Feel free to [file issues](https://github.com/aseemk/json5/issues) and submit
[pull requests](https://github.com/aseemk/json5/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

## License

MIT License. © 2012 Aseem Kishore.

## Credits

[Michael Bolin](http://bolinfest.com/) independently arrived at and published
some of these same ideas with awesome explanations and detail.
Recommended reading:
[Suggested Improvements to JSON](http://bolinfest.com/essays/json.html)

[Douglas Crockford](http://www.crockford.com/) of course designed and built
JSON, but his state machine diagrams on the [JSON website](http://json.org/),
as cheesy as it may sound, gave me motivation and confidence that building a
new parser to implement these ideas this was within my reach!
This code is also modeled directly off of Doug's open-source [json_parse.js][]
parser. I'm super grateful for that clean and well-documented code.

[json_parse.js]: https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js
