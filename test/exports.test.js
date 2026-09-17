import {test} from 'node:test'
import assert from 'node:assert'
import {createRequire} from 'node:module'
import JSON5, {parse, stringify} from '../lib/index.js'

const require = createRequire(import.meta.url)

test('exports: default export carries the named exports', () => {
    assert.strictEqual(JSON5.parse, parse)
    assert.strictEqual(JSON5.stringify, stringify)
})

test('exports: require() of the ES module entry returns the same object', () => {
    assert.strictEqual(require('../lib/index.js'), JSON5)
})

test('exports: the CommonJS build exposes the same shape', () => {
    const cjs = require('../dist/index.cjs')
    assert.strictEqual(typeof cjs.parse, 'function')
    assert.strictEqual(typeof cjs.stringify, 'function')
    assert.deepStrictEqual(cjs.parse('{a:1}'), {a: 1})
    assert.strictEqual(cjs.stringify({a: 1}), '{a:1}')
})
