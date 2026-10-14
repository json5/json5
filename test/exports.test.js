import {test} from 'node:test'
import assert from 'node:assert'
import {createRequire} from 'node:module'
import * as source from '../lib/index.js'
import {parse, stringify} from '../lib/index.js'

const require = createRequire(import.meta.url)

test('exports: the sources only have named exports', () => {
    assert.deepStrictEqual(Object.keys(source), ['parse', 'stringify'])
})

test('exports: the ES module entry has named exports', () => {
    assert.ok(typeof parse === 'function')
    assert.ok(typeof stringify === 'function')
})

test('exports: require() of the ES module entry returns the named exports', () => {
    const {parse: parseCJS, stringify: stringifyCJS} = require('../lib/index.js')
    assert.strictEqual(parseCJS, parse)
    assert.strictEqual(stringifyCJS, stringify)
})
