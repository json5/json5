import {test} from 'node:test'
import assert from 'node:assert'
import * as JSON5 from '../lib/index.js'

test('parse: parses empty objects', () => {
    assert.deepStrictEqual(JSON5.parse('{}'), {})
})

test('parse: parses double string property names', () => {
    assert.deepStrictEqual(JSON5.parse('{"a":1}'), {a: 1})
})

test('parse: parses single string property names', () => {
    assert.deepStrictEqual(JSON5.parse("{'a':1}"), {a: 1})
})

test('parse: parses unquoted property names', () => {
    assert.deepStrictEqual(JSON5.parse('{a:1}'), {a: 1})
})

test('parse: parses special character property names', () => {
    assert.deepStrictEqual(
        JSON5.parse('{$_:1,_$:2,a‌:3}'),
        {$_: 1, _$: 2, 'a‌': 3}
    )
})

test('parse: parses unicode property names', () => {
    assert.deepStrictEqual(
        JSON5.parse('{ùńîċõďë:9}'),
        {'ùńîċõďë': 9}
    )
})

test('parse: parses escaped property names', () => {
    assert.deepStrictEqual(
        JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}'),
        {ab: 1, $_: 2, _$: 3}
    )
})

test('parse: preserves __proto__ property names', () => {
    // eslint-disable-next-line no-proto
    assert.deepStrictEqual(JSON5.parse('{"__proto__":1}').__proto__, 1)
})

test('parse: parses multiple properties', () => {
    assert.deepStrictEqual(JSON5.parse('{abc:1,def:2}'), {abc: 1, def: 2})
})

test('parse: parses nested objects', () => {
    assert.deepStrictEqual(JSON5.parse('{a:{b:2}}'), {a: {b: 2}})
})

test('parse: parses empty arrays', () => {
    assert.deepStrictEqual(JSON5.parse('[]'), [])
})

test('parse: parses array values', () => {
    assert.deepStrictEqual(JSON5.parse('[1]'), [1])
})

test('parse: parses multiple array values', () => {
    assert.deepStrictEqual(JSON5.parse('[1,2]'), [1, 2])
})

test('parse: parses nested arrays', () => {
    assert.deepStrictEqual(JSON5.parse('[1,[2,3]]'), [1, [2, 3]])
})

test('parse: parses nulls', () => {
    assert.strictEqual(JSON5.parse('null'), null)
})

test('parse: parses true', () => {
    assert.strictEqual(JSON5.parse('true'), true)
})

test('parse: parses false', () => {
    assert.strictEqual(JSON5.parse('false'), false)
})

test('parse: parses leading zeroes', () => {
    assert.deepStrictEqual(JSON5.parse('[0,0.,0e0]'), [0, 0, 0])
})

test('parse: parses integers', () => {
    assert.deepStrictEqual(JSON5.parse('[1,23,456,7890]'), [1, 23, 456, 7890])
})

test('parse: parses signed numbers', () => {
    assert.deepStrictEqual(JSON5.parse('[-1,+2,-.1,-0]'), [-1, +2, -0.1, -0])
})

test('parse: parses leading decimal points', () => {
    assert.deepStrictEqual(JSON5.parse('[.1,.23]'), [0.1, 0.23])
})

test('parse: parses fractional numbers', () => {
    assert.deepStrictEqual(JSON5.parse('[1.0,1.23]'), [1, 1.23])
})

test('parse: parses exponents', () => {
    assert.deepStrictEqual(
        JSON5.parse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]'),
        [1, 10, 10, 1, 1.1, 0.1, 10]
    )
})

test('parse: parses hexadecimal numbers', () => {
    assert.deepStrictEqual(JSON5.parse('[0x1,0x10,0xff,0xFF]'), [1, 16, 255, 255])
})

test('parse: parses signed and unsigned Infinity', () => {
    assert.deepStrictEqual(JSON5.parse('[Infinity,-Infinity]'), [Infinity, -Infinity])
})

test('parse: parses NaN', () => {
    assert.ok(isNaN(JSON5.parse('NaN')))
})

test('parse: parses signed NaN', () => {
    assert.ok(isNaN(JSON5.parse('-NaN')))
})

test('parse: parses 1', () => {
    assert.deepStrictEqual(JSON5.parse('1'), 1)
})

test('parse: parses +1.23e100', () => {
    assert.deepStrictEqual(JSON5.parse('+1.23e100'), 1.23e100)
})

test('parse: parses bare hexadecimal number', () => {
    assert.deepStrictEqual(JSON5.parse('0x1'), 0x1)
})

test('parse: parses bare long hexadecimal number', () => {
    assert.deepStrictEqual(
        JSON5.parse('-0x0123456789abcdefABCDEF'),
        -0x0123456789abcdefABCDEF
    )
})

test('parse: parses double quoted strings', () => {
    assert.strictEqual(JSON5.parse('"abc"'), 'abc')
})

test('parse: parses single quoted strings', () => {
    assert.strictEqual(JSON5.parse("'abc'"), 'abc')
})

test('parse: parses quotes in strings', () => {
    assert.deepStrictEqual(JSON5.parse(`['"',"'"]`), ['"', "'"])
})

test('parse: parses escaped characters', () => {
    const input = "'" +
        '\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF' +
        '\\\n' + '\\\r\n' + '\\\r' +
        '\\\u2028' + '\\\u2029' +
        "\\a\\'\\\"" + "'"
    assert.strictEqual(
        JSON5.parse(input),
        '\b\f\n\r\t\v\0\x0f\u01FF' + "a'\""
    )
})

test('parse: parses line and paragraph separators with a warning', () => {
    const warnings = []
    const originalWarn = console.warn
    console.warn = (...args) => { warnings.push(args) }
    try {
        assert.deepStrictEqual(JSON5.parse("'  '"), '  ')
    } finally {
        console.warn = originalWarn
    }
    assert.strictEqual(warnings.length, 2)
    for (const w of warnings) {
        assert.ok(/not valid ECMAScript/.test(String(w[0])))
    }
})

test('parse: parses single-line comments', () => {
    assert.deepStrictEqual(JSON5.parse('{//comment\n}'), {})
})

test('parse: parses single-line comments at end of input', () => {
    assert.deepStrictEqual(JSON5.parse('{}//comment'), {})
})

test('parse: parses multi-line comments', () => {
    assert.deepStrictEqual(JSON5.parse('{/*comment\n** */}'), {})
})

test('parse: parses whitespace', () => {
    assert.deepStrictEqual(
        JSON5.parse('{\t\v\f  ﻿\n\r   }'),
        {}
    )
})

test('parse(text, reviver): modifies property values', () => {
    assert.deepStrictEqual(
        JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? 'revived' : v),
        {a: 'revived', b: 2}
    )
})

test('parse(text, reviver): modifies nested object property values', () => {
    assert.deepStrictEqual(
        JSON5.parse('{a:{b:2}}', (k, v) => (k === 'b') ? 'revived' : v),
        {a: {b: 'revived'}}
    )
})

test('parse(text, reviver): deletes property values', () => {
    assert.deepStrictEqual(
        JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? undefined : v),
        {b: 2}
    )
})

test('parse(text, reviver): modifies array values', () => {
    assert.deepStrictEqual(
        JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? 'revived' : v),
        [0, 'revived', 2]
    )
})

test('parse(text, reviver): modifies nested array values', () => {
    assert.deepStrictEqual(
        JSON5.parse('[0,[1,2,3]]', (k, v) => (k === '2') ? 'revived' : v),
        [0, [1, 2, 'revived']]
    )
})

test('parse(text, reviver): deletes array values', () => {
    assert.deepStrictEqual(
        JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? undefined : v),
        [0, , 2] // eslint-disable-line no-sparse-arrays
    )
})

test('parse(text, reviver): modifies the root value', () => {
    assert.strictEqual(
        JSON5.parse('1', (k, v) => (k === '') ? 'revived' : v),
        'revived'
    )
})

test('parse(text, reviver): sets `this` to the parent value', () => {
    assert.deepStrictEqual(
        JSON5.parse('{a:{b:2}}', function (k, v) { return (k === 'b' && this.b) ? 'revived' : v }),
        {a: {b: 'revived'}}
    )
})
