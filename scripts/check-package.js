#!/usr/bin/env node

/**
 * @file Ensures that `package.json5` matches `package.json`, and exits with a
 * non-zero exit code otherwise.
 *
 * If no command-line arguments are provided, the script checks the files in the
 * project root.
 *
 * If two command-line arguments are provided, the script checks that both files
 * match. The order of the filenames is not important since they are both parsed
 * as JSON5. This is meant to be run by lint-staged.
 *
 * If one one command-line argument is provided, the script exits with a
 * non-zero exit code. This happens when lint-staged is run and only one of
 * `package.json` or `package.json5` is staged.
 */

const assert = require('assert')
const fs = require('fs')
const JSON5 = require('../lib')

if (process.argv.length === 2) {
  check(require.resolve('../package.json'), require.resolve('../package.json5'))
} else if (process.argv.length === 3) {
  console.error('Please stage both package.json and package.json5.')
  process.exitCode = 1
} else {
  check(process.argv[2], process.argv[3])
}

/**
 * Ensures that the `package.json` or `package.json5` file at the given
 * filenames match. The order of the filenames is not important.
 * @param {string} firstPkgFilename The filename of the first file.
 * @param {string} secondPkgFilename The filename of the second file.
 */
function check(firstPkgFilename, secondPkgFilename) {
  const firstPkg = JSON5.parse(fs.readFileSync(firstPkgFilename, 'utf8'))
  const secondPkg = JSON5.parse(fs.readFileSync(secondPkgFilename, 'utf8'))
  try {
    assert.deepStrictEqual(
      secondPkg,
      firstPkg,
      'package.json5 does not match package.json.\nPlease run `npm run package:build` to fix.',
    )
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  }
}
