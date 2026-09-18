import {test} from 'node:test'
import assert from 'node:assert'
import {createRequire} from 'node:module'
import fs from 'node:fs'
import vm from 'node:vm'
import * as source from '../lib/index.js'
import JSON5, {parse, stringify} from '../dist/index.mjs'

const require = createRequire(import.meta.url)

test('exports: the sources only have named exports', () => {
    assert.deepStrictEqual(Object.keys(source), ['parse', 'stringify'])
})

test('exports: the ES module entry adds a default export carrying the named exports', () => {
    assert.strictEqual(JSON5.parse, parse)
    assert.strictEqual(JSON5.stringify, stringify)
})

test('exports: require() of the ES module entry returns the default export', () => {
    assert.strictEqual(require('../dist/index.mjs'), JSON5)
})

test('exports: the CommonJS entry is a plain {parse, stringify} object', () => {
    const cjs = require('../dist/index.cjs')
    assert.deepStrictEqual(Object.getOwnPropertyNames(cjs).sort(), ['parse', 'stringify'])
    assert.strictEqual(cjs.__esModule, undefined)
    assert.deepStrictEqual(cjs.parse('{a:1}'), {a: 1})
    assert.strictEqual(cjs.stringify({a: 1}), '{a:1}')
})

test('exports: the browser global has parse and stringify', () => {
    const context = {}
    vm.runInNewContext(fs.readFileSync(new URL('../dist/index.min.js', import.meta.url), 'utf8'), context)
    assert.deepStrictEqual(Object.keys(context.JSON5).sort(), ['parse', 'stringify'])
    // the parsed object comes from another realm, so compare its shape
    assert.strictEqual(JSON.stringify(context.JSON5.parse('{a:1}')), '{"a":1}')
})
