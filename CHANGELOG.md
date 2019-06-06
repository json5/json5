# Changelog

All notable changes to this project will be documented in this file.

The format is based on a simplified version of
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### BREAKING CHANGES

- Node.js v14 and later is supported. Support for older versions of Node.js has
  been dropped.
- The CLI has been removed from this library.
- The browser bundles in `dist` have been renamed from `index.js` and
  `index.min.js` to `json5.umd.js` and `json5.umd.min.js`.
- The browser bundles in `dist` no longer contain any polyfills since modern
  browsers support ES6.
- The ES modules bundles in `dist` have been removed until a better solution is
  found.
- `lib/register.js` and `lib/require.js` have been removed since they rely on
  deprecated Node.js APIs. Instead of using `require` to load a `.json5` file,
  read it into a string and parse it.
- Warnings for when `U+2028` and `U+2029` characters are parsed in strings have
  been removed since libraries should not log to console.

### Features

- A wider range of unquoted property names are supported due to upgrading from
  Unicode 10 to 14.
- `package.json5` is included in the npm package.

### Fixes

- Properties with the name `__proto__` are added to objects and arrays. ([#199])

## v2.2.1 - 2022-03-21

### Fixes

- The dependence on minimist has been removed to patch CVE-2021-44906. ([#266])

## v2.2.0 - 2021-01-31

### Features

- Accurate and documented TypeScript declarations are included. There is no need
  to install `@types/json5`. ([#236], [#244])

## v2.1.3 - 2020-04-04

### Fixes

- An out of memory bug when parsing numbers has been fixed. ([#228], [#229])

## v2.1.2 - 2020-03-16

### Fixes

- `minimist` as been upgraded to `v1.2.5`. ([#222])

## v2.1.1 - 2019-10-02

### Features

- `package.json` and `package.json5` include a `module` property so bundlers
  like webpack, rollup and parcel can take advantage of the ES Module build.
  ([#208])

### Fixes

- `stringify` outputs `\0` as `\\x00` when followed by a digit. ([#210])
- Spelling mistakes have been fixed. ([#196])

## v2.1.0 - 2018-09-28

### Features

- The `index.mjs` and `index.min.mjs` browser builds in the `dist` directory
  support ES6 modules. ([#187])

## v2.0.1 - 2018-08-18

### Fixes

- The browser builds in the `dist` directory support ES5. ([#182])

## v2.0.0 - 2018-08-16

### BREAKING CHANGES

- JSON5 officially supports Node.js v6 and later. Support for Node.js v4 has
  been dropped. Since Node.js v6 supports ES5 features, the code has been
  rewritten in native ES5, and the dependence on Babel has been eliminated.

### Features

- Support for Unicode 10 has been added.
- The test framework has been migrated from Mocha to Tap.
- The browser build at `dist/index.js` is no longer minified by default. A
  minified version is available at `dist/index.min.js`. ([#181])

### Fixes

- The warning has been made clearer when line and paragraph separators are used
  in strings.
- `package.json5` has been restored, and it is automatically generated and
  committed when the version is bumped. A new `build-package` NPM script has
  been added to facilitate this.

## v1.0.1 - 2018-03-17

### Features

- `package.json5` has been removed until an easier way to keep it in sync with
  `package.json` is found.

### Fixes

- `parse` throws on unclosed objects and arrays.

## v1.0.0 - 2018-03-11

### BREAKING CHANGES

- JSON5 officially supports Node.js v4 and later. Support for Node.js v0.10 and
  v0.12 have been dropped.

### Features

- Unicode property names and Unicode escapes in property names are supported.
  ([#1])
- `stringify` outputs trailing commas in objects and arrays when a `space`
  option is provided. ([#66])
- JSON5 allows line and paragraph separator characters (U+2028 and U+2029) in
  strings in order to be compatible with JSON. However, ES5 does not allow these
  characters in strings, so JSON5 gives a warning when they are parsed and
  escapes them when they are stringified. ([#70])
- `stringify` accepts an options object as its second argument. The supported
  options are `replacer`, `space`, and a new `quote` option that specifies the
  quote character used in strings. ([#71])
- The CLI supports STDIN and STDOUT and adds `--out-file`, `--space`, and
  `--validate` options. See `json5 --help` for more information. ([#72], [#84],
  and [#108])
- In addition to the white space characters space `\t`, `\v`, `\f`, `\n`, `\r`,
  and `\xA0`, the additional white space characters `\u2028`, `\u2029`, and all
  other characters in the Space Separator Unicode category are allowed.
- In addition to the character escapes `\'`, `\"`, `\\`, `\b`, `\f`, `\n`, `\r`,
  and `\t`, the additional character escapes `\v` and `\0`, hexadecimal escapes
  like `\x0F`, and unnecessary escapes like `\a` are allowed in string values
  and string property names.
- `stringify` outputs strings with single quotes by default but intelligently
  uses double quotes if there are more single quotes than double quotes inside
  the string. (i.e. `stringify('Stay here.')` outputs `'Stay here.'` while
  `stringify('Let\'s go.')` outputs `"Let's go."`)
- When a character is not allowed in a string, `stringify` outputs a character
  escape like `\t` when available, a hexadecimal escape like `\x0F` when the
  Unicode code point is less than 256, or a Unicode character escape like
  `\u01FF`, in that order.
- `stringify` checks for a `toJSON5` method on objects and, if it exists,
  stringifies its return value instead of the object. `toJSON5` overrides
  `toJSON` if they both exist.
- To `require` or `import` JSON5 files, use `require('json5/lib/register')` or
  `import 'json5/lib/register'`. Previous versions used `json5/lib/require`,
  which still exists for backward compatibility but is deprecated and will give
  a warning.
- To use JSON5 in browsers, use the file at `dist/index.js` or
  `https://unpkg.com/json5@^1.0.0`.

### Fixes

- `stringify` properly outputs `Infinity` and `NaN`. ([#67])
- `isWord` no longer becomes a property of `JSON5` after calling `stringify`.
  ([#68] and [#89])
- `stringify` no longer throws when an object does not have a `prototype`.
  ([#154])
- `stringify` properly handles the `key` argument of `toJSON(key)` methods.
  `toJSON5(key)` follows this pattern.
- `stringify` accepts `Number` and `String` objects as its `space` argument.
- In addition to a function, `stringify` also accepts an array of keys to
  include in the output as its `replacer` argument. Numbers, `Number` objects,
  and `String` objects will be converted to a string if they are given as array
  values.

## v0.5.1 - 2016-11-27

### Fixes

- Indents no longer appear in empty arrays when stringified. ([#134])

## v0.5.0 - 2016-03-17

### BREAKING CHANGES

- JSON5 officially supports Node.js v4 LTS and v5. Support for Node.js v0.6 and
  v0.8 have been dropped, while support for v0.10 and v0.12 remain.

### Features

- `parse` and the CLI provide line and column numbers when displaying error
  messages. ([#101]; awesome work by [@amb26].)

### Fixes

- YUI Compressor no longer fails when compressing json5.js. ([#97])

## v0.4.0 - 2014-11-01

Note that v0.3.0 was tagged, but never published to npm, so this v0.4.0
changelog entry includes v0.3.0 features.

### Features

- `JSON5.stringify()` now exists! This method is analogous to the native
  `JSON.stringify()`; it just avoids quoting keys where possible. See the
  [usage documentation](README.md) for more. ([#32]; huge thanks and props
  [@aeisenberg]!)
- `NaN` and `-NaN` are allowed number literals. ([#30]; thanks [@rowanhill].)
- Duplicate object keys are allowed; the last value is used. This is the same
  behavior as JSON. ([#57]; thanks [@jordanbtucker].)

### Fixes

- `parse` properly handles various whitespace and newline cases, e.g. escaped CR
  and CRLF newlines in strings and the same whitespace as JSON (stricter than
  ES5). ([#58], [#60], and [#63]; thanks [@jordanbtucker].)
- Negative hexadecimal numbers (e.g. `-0xC8`) are allowed again. (They were
  disallowed in v0.2.0; see below.) It turns out they _are_ valid in ES5, so
  JSON5 supports them now too. ([#36]; thanks [@jordanbtucker]!)

## v0.2.0 - 2013-01-27

### BREAKING CHANGES

- Negative hexadecimal numbers (e.g. `-0xC8`) are rejected. While V8 (e.g.
  Chrome and Node) supported them, it turns out they're invalid in ES5. This has
  been [fixed in V8][v8-hex-fix] (and by extension, Chrome and Node), so JSON5
  officially rejects them, too. ([#36])

### Features

- `Infinity` and `-Infinity` are allowed number literals. ([#30]; thanks
  [@pepkin88].)
- Plus signs (`+`) in front of numbers are allowed, since it can be helpful in
  some contexts to explicitly mark numbers as positive. (E.g. when a property
  represents changes or deltas.)

### Fixes

- Trailing decimal points in decimal numbers are allowed again. (They were
  disallowed in v0.1.0; see below.) They're allowed by ES5, and differentiating
  between integers and floats may make sense on some platforms. ([#16]; thanks
  [@Midar].)
- Unescaped newlines in strings are rejected. ([#24]; thanks [@Midar].)

## v0.1.0 - 2012-06-03

### BREAKING CHANGES

- Octal numbers are rejected. Previously, they were accepted but improperly
  parsed as base-10 numbers. (Thanks [@MaxNanasy].)
- Trailing decimal points in decimal numbers are rejected. These are disallowed
  by both JSON5 and JSON. (Thanks [@MaxNanasy].)
- Omitted elements in arrays are rejected. These are disallowed by both JSON5
  and JSON.

### Features

- Hexadecimal numbers are allowed. (Thanks [@MaxNanasy].)
- Leading decimal points in decimal numbers are allowed. (Thanks [@MaxNanasy].)
- JSON5 files can be imported via Node.js `require()` calls. Register the
  `.json5` file extension via `json5/lib/require`.
- A Node.js binary, `json5`, in included that transpiles JSON5 files to JSON.

### Fixes

- Syntax errors throw with `SyntaxError` instances.

## v0.0.1 - 2012-05-27

This was the first implementation of this JSON5 parser.

### Features

- Unquoted object keys, including reserved words, are supported. Unicode
  characters and escape sequences sequences aren't yet supported.
- Single-quoted strings are supported.
- Multi-line strings are supported.
- Trailing commas in arrays and objects are supported.
- Comments, both inline and block, are supported.

## v0.0.0 - 2012-05-27

Let's consider this to be Douglas Crockford's original [json_parse.js] — a
parser for the regular JSON format.

[json_parse.js]:
  https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/json2.js
[v8-hex-fix]: http://code.google.com/p/v8/issues/detail?id=2240
[@maxnanasy]: https://github.com/MaxNanasy
[@midar]: https://github.com/Midar
[@pepkin88]: https://github.com/pepkin88
[@rowanhill]: https://github.com/rowanhill
[@aeisenberg]: https://github.com/aeisenberg
[@jordanbtucker]: https://github.com/jordanbtucker
[@amb26]: https://github.com/amb26
[#1]: https://github.com/json5/json5/issues/1
[#16]: https://github.com/json5/json5/issues/16
[#24]: https://github.com/json5/json5/issues/24
[#30]: https://github.com/json5/json5/issues/30
[#32]: https://github.com/json5/json5/issues/32
[#36]: https://github.com/json5/json5/issues/36
[#57]: https://github.com/json5/json5/issues/57
[#58]: https://github.com/json5/json5/pull/58
[#60]: https://github.com/json5/json5/pull/60
[#63]: https://github.com/json5/json5/pull/63
[#66]: https://github.com/json5/json5/issues/66
[#67]: https://github.com/json5/json5/issues/67
[#68]: https://github.com/json5/json5/issues/68
[#70]: https://github.com/json5/json5/issues/70
[#71]: https://github.com/json5/json5/issues/71
[#72]: https://github.com/json5/json5/issues/72
[#84]: https://github.com/json5/json5/pull/84
[#89]: https://github.com/json5/json5/pull/89
[#97]: https://github.com/json5/json5/pull/97
[#101]: https://github.com/json5/json5/pull/101
[#108]: https://github.com/json5/json5/pull/108
[#134]: https://github.com/json5/json5/pull/134
[#154]: https://github.com/json5/json5/issues/154
[#181]: https://github.com/json5/json5/issues/181
[#182]: https://github.com/json5/json5/issues/182
[#187]: https://github.com/json5/json5/issues/187
[#196]: https://github.com/json5/json5/issues/196
[#199]: https://github.com/json5/json5/issues/199
[#208]: https://github.com/json5/json5/issues/208
[#210]: https://github.com/json5/json5/issues/210
[#222]: https://github.com/json5/json5/issues/222
[#228]: https://github.com/json5/json5/issues/228
[#229]: https://github.com/json5/json5/issues/229
[#236]: https://github.com/json5/json5/issues/236
[#244]: https://github.com/json5/json5/issues/244
[#266]: https://github.com/json5/json5/issues/266
