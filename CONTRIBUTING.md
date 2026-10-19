# Contributing to JSON5
We're glad you're interested in contributing to JSON5.

## Development
```sh
git clone https://github.com/json5/json5
cd json5
npm install
```

When contributing code, please write relevant tests and run `npm test` and `npm
run test-types` before submitting pull requests. Please use an editor that supports
[EditorConfig](http://editorconfig.org/).

If your change affects users, add an entry to the Unreleased section of
`CHANGELOG.md`. A CI check fails if a pull request doesn't update it. If your
change doesn't need an entry, like a docs or CI change, a maintainer will add
the `skip-changelog ⏩` label.

## Issues
To report bugs or request features regarding the JSON5 data format, please
submit an issue to the [official specification
repository](https://github.com/json5/json5-spec).

To report bugs or request features regarding the JavaScript implementation of
JSON5, please submit an issue to this repository.
