# JSON5 – Modern JSON

JSON isn't the friendliest to write and maintain by hand. Keys need to be
quoted; objects and arrays can't have trailing commas; comments aren't
supported — even though none of these is the case with regular JavaScript
today.

Restricting JSON to such a strict subset of "JavaScript object notation" made
sense for making it a great data-exchange format, but JSON's usage has
expanded [beyond][ex1] [machine-to-machine][ex2] [communication][ex3].

[ex1]: http://plovr.com/docs.html
[ex2]: http://npmjs.org/doc/json.html
[ex3]: http://code.google.com/p/fuzztester/wiki/JSONFileFormat

**JSON5 is a proposed extension to JSON** that brings ES5 enhancements to its
syntax. It remains a **strict subset of JavaScript**, adds **no new data
types**, and is a **strict superset of existing JSON**.

JSON5 is not an official successor to JSON, and existing JSON parsers may not
understand these new features. It's thus recommended that files use a new
extension like `.json5` to be explicit. *[TODO: New MIME type too?]*

This module provides a JavaScript implementation that works on all modern JS
engines (even IE6). Its parser is based directly off of Douglas Crockford's
eval-free [json_parse.js][], making it both secure and robust. Give it a try!

## Features

These are the new features of JSON5's syntax. All of these are optional, and
all of these are part of ES5 JavaScript.

- Object keys don't need to be quoted if they're valid [identifiers](
  https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables). Yes, even reserved keywords are valid unquoted keys in ES5 [[§11.1.5](http://es5.github.com/#x11.1.5), [§7.6](http://es5.github.com/#x7.6)].
  *[TODO: Unicode characters and escape sequences aren't yet supported in this implementation.]*

- Strings can be single-quoted.

- Strings can be split across multiple lines; just prefix each newline with a
  backslash. [ES5 [§7.8.4](http://es5.github.com/#x7.8.4)]

- Objects and arrays can have trailing commas.

- Both inline (single-line) and block (multi-line) comments are allowed.

- Numbers can be hexadecimal (base 16), and they can also begin with a leading
  decimal (e.g. `.5`).

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
       that continues on another line */

    hex: 0xDEADbeef,
    half: .5,
       
    finally: 'a trailing comma',
    oh: [
        "we shouldn't forget",
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

If you're running Node, you can also register a JSON5 `require()` hook to let
you `require()` `.json5` files just like you can `.json` files:

```js
require('json5/lib/require');
require('./path/to/foo');   // tries foo.json5 after foo.js, foo.json, etc.
require('./path/to/bar.json5');
```

This module also provides a `json5` executable (requires Node) for converting
JSON5 files to sibling JSON files:

```
$ json5 -c path/to/foo.json5    # generates path/to/foo.json
```

## Development

```
git clone git://github.com/aseemk/json5.git
cd json5
make
make test
```

If your system doesn't have Make, this should work in place of `make [test]`:

```
./lib/cli.js -c package.json5
npm install
npm test
```

Make is used to auto-generate the package.json file that npm requires from our
package.json5 file. Just re-run `make` (or `./lib/cli.js -c package.json5`) on
changes to package.json5.

Feel free to [file issues](https://github.com/aseemk/json5/issues) and submit
[pull requests](https://github.com/aseemk/json5/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `make test` (or `npm test`) continues to pass.

## License

MIT License. © 2012 Aseem Kishore, and [others](
https://github.com/aseemk/json5/contributors).

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

[Max Nanasy](https://github.com/MaxNanasy) has been an early and prolific
supporter, contributing multiple patches and ideas. Thanks Max!
