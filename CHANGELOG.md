### v0.1.0 [[code][c0.1.0], [diff][d0.1.0]]

[c0.1.0]: https://github.com/aseemk/json5/tree/v0.1.0
[d0.1.0]: https://github.com/aseemk/json5/compare/v0.0.1...v0.1.0

This release tightens JSON5 support and adds helpful utility features:

- Support hexadecimal numbers. (Thanks [@MaxNanasy][].)

- Reject octal numbers properly now. Previously, they were accepted but
  improperly parsed as base-10 numbers. (Thanks [@MaxNanasy][].)

- **Breaking:** Reject "noctal" numbers now (base-10 numbers that begin with a
  leading zero). These are disallowed by both JSON5 and JSON, as well as by
  ES5's strict mode. (Thanks [@MaxNanasy][].)

- Support leading decimal points in decimal numbers. (Thanks [@MaxNanasy][].)

- **Breaking:** Reject trailing decimal points in decimal numbers now. These
  are disallowed by both JSON5 and JSON. (Thanks [@MaxNanasy][].)
  
- **Breaking:** Reject omitted elements in arrays now. These are disallowed by
  both JSON5 and JSON.

- Throw proper `SyntaxError` instances on errors now.

- Add Node.js `require()` hook. Require `json5/lib/require` to register it.

- Add Node.js executable to compile JSON5 files to JSON. Run with `json5`.

### v0.0.1 [[code][c0.0.1], [diff][d0.0.1]]

[c0.0.1]: https://github.com/aseemk/json5/tree/v0.0.1
[d0.0.1]: https://github.com/aseemk/json5/compare/v0.0.0...v0.0.1

This was the first implementation of this JSON5 parser.

- Support unquoted object keys, including reserved words. Unicode characters
  and escape sequences sequences aren't yet supported.

- Support single-quoted strings.

- Support multi-line strings.

- Support trailing commas in arrays and objects.

- Support comments, both inline and block.

### v0.0.0 [[code](https://github.com/aseemk/json5/tree/v0.0.0)]

Let's consider this to be Douglas Crockford's original [json_parse.js][] — a
parser for the regular JSON format.

[json_parse.js]: https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

[@MaxNanasy]: https://github.com/MaxNanasy
