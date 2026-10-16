import {test} from 'node:test'
import assert from 'node:assert'
import {createRequire} from 'node:module'
import JSON5, {parse, stringify} from '../lib/index.js'

const require = createRequire(import.meta.url)

test('exports: the default export carries the named exports', () => {
    assert.strictEqual(JSON5.parse, parse)
    assert.strictEqual(JSON5.stringify, stringify)
})

test('exports: require() returns the default export', () => {
    assert.strictEqual(require('../lib/index.js'), JSON5)
    assert.deepStrictEqual(Object.keys(require('../lib/index.js')), ['parse', 'stringify'])
})
