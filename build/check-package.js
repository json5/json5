const assert = require('assert')
const fs = require('fs')
const pkg = require('../package.json')

const JSON5 = require('..')
const pkg5JSON5 = fs.readFileSync('package.json5', 'utf8')
const pkg5 = JSON5.parse(pkg5JSON5)

try {
    assert.deepStrictEqual(pkg5, pkg, 'package.json5 does not match package.json.\nRun `npm run build-package` to update package.json5.')
} catch (err) {
    console.error(err.message)
    process.exitCode = 1
}
