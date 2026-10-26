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
        JSON5.parse('{$_:1,_$:2,a\u200C:3}'),
        {$_: 1, _$: 2, 'a\u200C': 3}
    )
})

test('parse: parses unicode property names', () => {
    assert.deepStrictEqual(
        JSON5.parse('{ùńîċõďë:9}'),
        {'ùńîċõďë': 9}
    )
})

test('parse: parses property names with characters added in Unicode 18', () => {
    assert.deepStrictEqual(JSON5.parse('{\uA7DD:1}'), {'\uA7DD': 1})
})

test('parse: parses property names with characters outside the BMP', () => {
    assert.deepStrictEqual(JSON5.parse('{\u{10000}\u{1D7CE}:1}'), {'\u{10000}\u{1D7CE}': 1})
})

test('parse: parses escaped property names', () => {
    assert.deepStrictEqual(
        JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}'),
        {ab: 1, $_: 2, _$: 3}
    )
})

test('parse: preserves __proto__ property names', () => {
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
        -0x0123456789abcdefABCDEF // eslint-disable-line no-loss-of-precision
    )
})

test('parse: returns unsafe integers as numbers by default', () => {
    assert.strictEqual(JSON5.parse('12345678901234567890'), 12345678901234567000)
})

test('parse(text, {bigint: true}): returns unsafe integers as bigints', () => {
    assert.strictEqual(
        JSON5.parse('12345678901234567890', {bigint: true}),
        12345678901234567890n
    )
    assert.strictEqual(
        JSON5.parse('-12345678901234567890', {bigint: true}),
        -12345678901234567890n
    )
    assert.strictEqual(
        JSON5.parse('+9007199254740992', {bigint: true}),
        9007199254740992n
    )
})

test('parse(text, {bigint: true}): returns unsafe hexadecimal integers as bigints', () => {
    assert.strictEqual(
        JSON5.parse('0x0123456789abcdefABCDEF', {bigint: true}),
        0x0123456789abcdefABCDEFn
    )
    assert.strictEqual(
        JSON5.parse('-0X20000000000000', {bigint: true}),
        -0x20000000000000n
    )
})

test('parse(text, {bigint: true}): returns safe integers as numbers', () => {
    assert.deepStrictEqual(
        JSON5.parse('[0, -0, 1, -1, 0x1F, 9007199254740991, -9007199254740991]', {bigint: true}),
        [0, -0, 1, -1, 0x1F, 9007199254740991, -9007199254740991]
    )
})

test('parse(text, {bigint: true}): returns non-integer literals as numbers', () => {
    assert.deepStrictEqual(
        JSON5.parse('[1e20, 1.5e30, 12345678901234567890.0, .5, 5., Infinity, -Infinity]', {bigint: true}),
        [1e20, 1.5e30, 12345678901234567890.0, 0.5, 5, Infinity, -Infinity] // eslint-disable-line no-loss-of-precision
    )
    assert.ok(isNaN(JSON5.parse('NaN', {bigint: true})))
})

test('parse(text, {bigint: true}): returns bigints in objects and arrays', () => {
    assert.deepStrictEqual(
        JSON5.parse('{a: 12345678901234567890, b: [1, -0x20000000000000]}', {bigint: true}),
        {a: 12345678901234567890n, b: [1, -0x20000000000000n]}
    )
})

test('parse(text, reviver, {bigint: true}): passes bigints to the reviver', () => {
    assert.deepStrictEqual(
        JSON5.parse(
            '{a: 12345678901234567890}',
            (k, v) => (typeof v === 'bigint' ? String(v) : v),
            {bigint: true}
        ),
        {a: '12345678901234567890'}
    )
})

test('parse(text, options): treats a missing or null bigint option as false', () => {
    assert.strictEqual(JSON5.parse('12345678901234567890', {}), 12345678901234567000)
    assert.strictEqual(JSON5.parse('12345678901234567890', {bigint: null}), 12345678901234567000)
    assert.strictEqual(JSON5.parse('12345678901234567890', {bigint: false}), 12345678901234567000)
    assert.strictEqual(JSON5.parse('12345678901234567890', null, null), 12345678901234567000)
})

test('parse(text, options): throws on a non-boolean bigint option', () => {
    assert.throws(() => JSON5.parse('1', {bigint: 'yes'}), TypeError)
    assert.throws(() => JSON5.parse('1', null, {bigint: 1}), TypeError)
})

test('parse(text, reviver, options): does not treat an array reviver as options', () => {
    assert.strictEqual(
        JSON5.parse('12345678901234567890', [], {bigint: true}),
        12345678901234567890n
    )
})

test('parse: does not keep the bigint option between calls', () => {
    JSON5.parse('1', {bigint: true})
    assert.strictEqual(JSON5.parse('12345678901234567890'), 12345678901234567000)
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

test('parse: parses line and paragraph separators', () => {
    assert.deepStrictEqual(JSON5.parse("'\u2028\u2029'"), '\u2028\u2029')
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
        JSON5.parse('{\t\v\f \u00A0\uFEFF\n\r\u2028\u2029\u2003}'),
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

test('parse(text, reviver): visits properties deleted by an earlier reviver call', () => {
    function revive (parse) {
        return parse('{"a":1,"b":2}', function (k, v) {
            if (k === 'a') delete this.b
            return (k === 'b') ? 'revived' : v
        })
    }

    const expected = revive(JSON.parse)
    assert.deepStrictEqual(revive(JSON5.parse), expected)
    assert.deepStrictEqual(expected, {a: 1, b: 'revived'})
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

for (const [container, input, key] of [
    ['object', '{"a":1}', 'a'],
    ['array', '[1]', '0'],
]) {
    for (const [operation, replacement] of [
        ['replace', 2],
        ['delete', undefined],
    ]) {
        test(`parse(text, reviver): does not throw when a frozen ${container} rejects ${operation}`, () => {
            function revive (parse) {
                const keys = []
                const value = parse(input, function (k, v) {
                    keys.push(k)
                    if (k === key) {
                        Object.freeze(this)
                        return replacement
                    }

                    return v
                })
                return {keys, value, descriptor: Object.getOwnPropertyDescriptor(value, key)}
            }

            const expected = revive(JSON.parse)
            assert.deepStrictEqual(revive(JSON5.parse), expected)
            assert.deepStrictEqual(expected.keys, [key, ''])
            assert.strictEqual(expected.value[key], 1)
            assert.strictEqual(expected.descriptor.configurable, false)
            assert.strictEqual(expected.descriptor.writable, false)
        })
    }

    test(`parse(text, reviver): does not throw when a non-extensible ${container} rejects restoring a property`, () => {
        function revive (parse) {
            return parse(input, function (k, v) {
                if (k === key) {
                    delete this[k]
                    Object.preventExtensions(this)
                    return 2
                }

                return v
            })
        }

        const expected = revive(JSON.parse)
        const actual = revive(JSON5.parse)
        assert.deepStrictEqual(actual, expected)
        assert.strictEqual(Object.hasOwn(actual, key), false)
        assert.strictEqual(Object.isExtensible(actual), false)
    })
}

for (const operation of ['defineProperty', 'deleteProperty']) {
    test(`parse(text, reviver): propagates errors thrown by a proxy ${operation} trap`, () => {
        const error = new Error('reviver proxy trap')
        for (const parse of [JSON.parse, JSON5.parse]) {
            assert.throws(() => parse('{"a":1,"b":{}}', function (k, v) {
                if (k === 'a') {
                    this.b = new Proxy({c: 1}, {
                        [operation] () { throw error },
                    })
                }

                return k === 'c' && operation === 'deleteProperty' ? undefined : v
            }), e => e === error)
        }
    })
}
