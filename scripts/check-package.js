const assert = require('assert')
const fs = require('fs')
const JSON5 = require('../lib')

if (process.argv.length === 2) {
  // The script is not being run by lint-staged.
  check(require.resolve('../package.json'), require.resolve('../package.json5'))
} else if (process.argv.length === 3) {
  // The script is being run by lint-staged, and only package.json or
  // package.json5 has been staged.
  console.error('Please stage both package.json and package.json5.')
  process.exitCode = 1
} else {
  // The script is being run by lint-staged. Ensure package.json and
  // package.json5 match.
  check(process.argv[2], process.argv[3])
}

function check(pkgFilename, pkg5Filename) {
  const pkg = JSON5.parse(fs.readFileSync(pkgFilename, 'utf8'))
  const pkg5 = JSON5.parse(fs.readFileSync(pkg5Filename, 'utf8'))
  try {
    assert.deepStrictEqual(
      pkg5,
      pkg,
      'package.json5 does not match package.json.\nPlease run `npm run build:package` to fix.',
    )
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  }
}
