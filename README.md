[![Build Status](https://travis-ci.org/aseemk/json5.png)](https://travis-ci.org/aseemk/json5)


# JSON5 – Modern JSON

JSON is an excellent data format, but we think it can be better.

**JSON5 is a proposed extension to JSON** that aims to make it easier for
*humans to write and maintain* by hand. It does this by adding some minimal
syntax features directly from ECMAScript 5.

JSON5 remains a **strict subset of JavaScript**, adds **no new data types**,
and **works with all existing JSON content**.

JSON5 is *not* an official successor to JSON, and JSON5 content may *not*
work with existing JSON parsers. For this reason, JSON5 files use a new .json5
extension. *(TODO: new MIME type needed too.)*

The code here is a **reference JavaScript implementation** for both Node.js
and all browsers. It's based directly off of Douglas Crockford's own [JSON
implementation][json_parse.js], and it's both robust and secure.


## Why

JSON isn't the friendliest to *write*. Keys need to be quoted, objects and
arrays can't have trailing commas, and comments aren't allowed — even though
none of these are the case with regular JavaScript today.

That was fine when JSON's goal was to be a great data format, but JSON's usage
has expanded beyond *machines*. JSON is now used for writing [configs][ex1],
[manifests][ex2], even [tests][ex3] — all by *humans*.

[ex1]: http://plovr.com/docs.html
[ex2]: http://npmjs.org/doc/json.html
[ex3]: http://code.google.com/p/fuzztester/wiki/JSONFileFormat

There are other formats that are human-friendlier, like YAML, but changing
from JSON to a completely different format is undesirable in many cases.
JSON5’s aim is to remain close to JSON and JavaScript.


## Features of `JSON.parse()`

The following is the exact list of additions to JSON's syntax introduced by
JSON5. **All of these are optional**, and **all of these come from ES5**.

### Objects

- Object keys can be unquoted if they're valid [identifiers][mdn_variables].
  Yes, even reserved keywords (like `default`) are valid unquoted keys in ES5
  [[§11.1.5](http://es5.github.com/#x11.1.5), [§7.6](http://es5.github.com/#x7.6)].

  *(TODO: Unicode characters and escape sequences aren’t yet supported in this
  implementation.)*

- Objects can have trailing commas.

[mdn_variables]: https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables

### Arrays

- Arrays can have trailing commas.

### Strings

- Strings can be single-quoted.

- Strings can be split across multiple lines; just prefix each newline with a
  backslash. [ES5 [§7.8.4](http://es5.github.com/#x7.8.4)]

### Numbers

- Numbers can be hexadecimal (base 16). (But note that neither signed
  hexadecimals nor hexadecimal floats are allowed by ES5.)

- Numbers can begin or end with a (leading or trailing) decimal point.

- Numbers can include `Infinity` and `-Infinity`.

- Numbers can begin with an explicit plus sign.

### Comments

- Both inline (single-line) and block (multi-line) comments are allowed.

## Parse Example

The following is a contrived example, but it illustrates most of the features:

```js
{
    foo: 'bar',
    while: true,

    this: 'is a \
multi-line string',

    // this is an inline comment
    here: 'is another', // inline comment

    /* this is a block comment
       that continues on another line */

    hex: 0xDEADbeef,
    half: .5,
    delta: +10,
    to: Infinity,   // and beyond!

    finally: 'a trailing comma',
    oh: [
        "we shouldn't forget",
        'arrays can have',
        'trailing commas too',
    ],
}
```

This implementation's own [package.json5](package.json5) is more realistic:

```js
// This file is written in JSON5 syntax, naturally, but npm needs a regular
// JSON file, so compile via `npm run build`. Be sure to keep both in sync!

{
    name: 'json5',
    version: '0.2.0',
    description: 'JSON for the ES5 era.',
    keywords: ['json', 'es5'],
    author: 'Aseem Kishore <aseem.kishore@gmail.com>',
    contributors: [
        'Max Nanasy <max.nanasy@gmail.com>',
    ],
    main: 'lib/json5.js',
    bin: 'lib/cli.js',
    dependencies: {},
    devDependencies: {
        mocha: '~1.0.3',
    },
    scripts: {
        build: './lib/cli.js -c package.json5',
        test: 'mocha --ui exports --reporter spec',
    },
    homepage: 'http://json5.org/',
    repository: {
        type: 'git',
        url: 'https://github.com/aseemk/json5.git',
    },
}
```

## Features of `JSON.stringify()`

As of v0.3.0. JSON5 supports the `stringify` method, which is analogous to 
[`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).
The only difference is that `JSON5.stringify()` will avoid quoting keys where appropriate.
`stringify` takes 3 parameters, but only two are currently supported:

1. **value:** the JavaScript value to convert to a JSON string.
2. **replacer:** a transformer to run on each value (either a function or an array, as with [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Using_native_JSON#The_replacer_parameter))
3. **space:** Causes the resulting string to be pretty-printed.

## Stringify example

Using JSON5, you can stringify JS objects like this:

```js
JSON5.stringify({first: 8, 'second key': 9});
// => '{first:8,"second key":9}'

JSON5.stringify({first: 8, 'second key': 9}, function(key, value) {return typeof value === 'object' ? value : 'replaced';});
// => '{first:"replaced","second key":"replaced"}'

JSON5.stringify({first: 8, 'second key': 9}, ['first']);
// => '{first:8}'

JSON5.stringify({first: 8, 'second key': 9}, null, ' ');
// => '{\n first: 8,\n "second key": 9\n}'

JSON5.stringify({first: 8, toJSON:function(){ return {'second key': 9}; }}, null, ' ');
// => '{\n "second key": 9\n}'
```
When using JSON, all keys are quoted:

```js
JSON.stringify({first: 8, 'second key': 9});
// => '{"first":8,"second key":9}'

JSON.stringify({first: 8, 'second key': 9}, function(key, value) {return typeof value === 'object' ? value : 'replaced';});
// => '{"first":"replaced","second key":"replaced"}'

JSON.stringify({first: 8, 'second key': 9}, ['first']);
// => '{"first":8}'

JSON.stringify({first: 8, 'second key': 9}, null, ' ');
// => '{\n "first": 8,\n "second key": 9\n}'

JSON.stringify({first: 8, toJSON:function(){ return {'second key': 9}; }}, null, ' ');
// => '{\n "second key": 9\n}'
```

## Community

Join the [Google Group](http://groups.google.com/group/json5) if you're
interested in JSON5 news, updates, and general discussion.
Don't worry, it's very low-traffic.

The [GitHub wiki](https://github.com/aseemk/json5/wiki) is a good place to track
JSON5 support and usage. Contribute freely there!

[GitHub Issues](https://github.com/aseemk/json5/issues) is the place to
formally propose feature requests and report bugs. Questions and general
feedback are better directed at the Google Group.


## Usage

This JavaScript implementation of JSON5 simply provides a `JSON5` object just
like the ES5 `JSON` object.

To use from Node:

```
npm install json5
```

```js
var JSON5 = require('json5');
```

To use in the browser (adds the `JSON5` object to the global namespace):

```
<script src="json5.js"></script>
```

Then in both cases:

```js
var obj = JSON5.parse('{unquoted:"key",trailing:"comma",}');
var str = JSON5.stringify(obj);
```

`JSON5.stringify()` is currently aliased to the native `JSON.stringify()` in
order for the output to be fully compatible with all JSON parsers today.

### Extras

If you're running this on Node, you can also register a JSON5 `require()` hook
to let you `require()` `.json5` files just like you can `.json` files:

```js
require('json5/lib/require');
require('./path/to/foo');   // tries foo.json5 after foo.js, foo.json, etc.
require('./path/to/bar.json5');
```

This module also provides a `json5` executable (requires Node) for converting
JSON5 files to JSON:

```
$ json5 -c path/to/foo.json5    # generates path/to/foo.json
```


## Development

```
git clone git://github.com/aseemk/json5.git
cd json5
npm install
npm test
```

As the `package.json5` file states, be sure to run `npm run build` on changes
to `package.json5`, since npm requires `package.json`.

Feel free to [file issues](https://github.com/aseemk/json5/issues) and submit
[pull requests](https://github.com/aseemk/json5/pulls) — contributions are
welcome. If you do submit a pull request, please be sure to add or update the
tests, and ensure that `npm test` continues to pass.


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

[Andrew Eisenberg](https://github.com/aeisenberg) has contributed the `stringify` method.
