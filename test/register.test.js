import {test} from 'node:test'
import assert from 'node:assert'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)

test('require(*.json5): parses a JSON5 document', () => {
    require('../lib/register.cjs')
    assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
})

test('require(*.json5): is backward compatible with v0.5.1, but gives a deprecation warning', () => {
    const warnings = []
    const originalWarn = console.warn
    console.warn = (...args) => { warnings.push(args) }
    try {
        require('../lib/require.cjs')
    } finally {
        console.warn = originalWarn
    }
    assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    assert.strictEqual(warnings.length, 1)
    assert.deepStrictEqual(
        warnings[0],
        ["'json5/require' is deprecated. Please use 'json5/register' instead."]
    )
})

test('require(*.json5): throws on invalid JSON5', () => {
    require('../lib/register.cjs')
    assert.throws(() => { require('./invalid.json5') }, SyntaxError)
})
