### Unreleased [[code][cNew], [diff][dNew]]

[cNew]: https://github.com/aseemk/json5/tree/develop
[dNew]: https://github.com/aseemk/json5/compare/master...develop

These changes are sitting unreleased on the `develop` branch:

- (Nothing yet.)

### v0.2.0 [[code][c0.2.0], [diff][d0.2.0]]

[c0.2.0]: https://github.com/aseemk/json5/tree/v0.2.0
[d0.2.0]: https://github.com/aseemk/json5/compare/v0.1.0...v0.2.0

This release fixes some bugs and adds some more utility features to help you
express data more easily:

- **Breaking:** Negative hexadecimal numbers (e.g. `-0xC8`) are rejected now.
  While V8 (e.g. Chrome and Node) supported them, it turns out they're invalid
  in ES5. This has been [fixed in V8][v8-hex-fix] (and by extension, Chrome
  and Node), so JSON5 officially rejects them now, too. ([#36][])

[v8-hex-fix]: http://code.google.com/p/v8/issues/detail?id=2240
[#36]: https://github.com/aseemk/json5/issues/36

- **Breaking:** Trailing decimal points in decimal numbers are allowed again.
  They're allowed by ES5, and differentiating between integers and floats may
  make sense on some platforms. ([#16][]; thanks [@Midar][].)

[#16]: https://github.com/aseemk/json5/issues/16

- **New:** `Infinity` and `-Infinity` are now allowed number literals.
  ([#30][]; thanks [@pepkin88][].)

[#30]: https://github.com/aseemk/json5/issues/30

- **New:** Plus signs (`+`) in front of numbers are now allowed, since it can
  be helpful in some contexts to explicitly mark numbers as positive.
  (E.g. when a property represents changes or deltas.)

- Bug fix: unescaped newlines in strings are rejected now. ([#24][]; thanks
  [@Midar][].)

[#24]: https://github.com/aseemk/json5/issues/24

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
[@Midar]: https://github.com/Midar
[@pepkin88]: https://github.com/pepkin88
