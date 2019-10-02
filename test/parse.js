const assert = require('assert')
const sinon = require('sinon')
const JSON5 = require('../lib')

require('tap').mochaGlobals()

const t = require('tap')

t.test('parse(text)', t => {
    t.test('objects', t => {
        t.strictSame(
            JSON5.parse('{}'),
            {},
            'parses empty objects'
        )

        t.strictSame(
            JSON5.parse('{"a":1}'),
            {a: 1},
            'parses double string property names'
        )

        t.strictSame(
            JSON5.parse("{'a':1}"),
            {a: 1},
            'parses single string property names'
        )

        t.strictSame(
            JSON5.parse('{a:1}'),
            {a: 1},
            'parses unquoted property names'
        )

        t.strictSame(
            JSON5.parse('{$_:1,_$:2,a\u200C:3}'),
            {$_: 1, _$: 2, 'a\u200C': 3},
            'parses special character property names'
        )

        t.strictSame(
            JSON5.parse('{ùńîċõďë:9}'),
            {'ùńîċõďë': 9},
            'parses unicode property names'
        )

        t.strictSame(
            JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}'),
            {ab: 1, $_: 2, _$: 3},
            'parses escaped property names'
        )

        t.strictSame(
            JSON5.parse('{abc:1,def:2}'),
            {abc: 1, def: 2},
            'parses multiple properties'
        )

        t.strictSame(
            JSON5.parse('{a:{b:2}}'),
            {a: {b: 2}},
            'parses nested objects'
        )

        t.end()
    })

    t.test('arrays', t => {
        t.strictSame(
            JSON5.parse('[]'),
            [],
            'parses empty arrays'
        )

        t.strictSame(
            JSON5.parse('[1]'),
            [1],
            'parses array values'
        )

        t.strictSame(
            JSON5.parse('[1,2]'),
            [1, 2],
            'parses multiple array values'
        )

        t.strictSame(
            JSON5.parse('[1,[2,3]]'),
            [1, [2, 3]],
            'parses nested arrays'
        )

        t.end()
    })

    t.test('nulls', t => {
        t.equal(
            JSON5.parse('null'),
            null,
            'parses nulls'
        )

        t.end()
    })

    t.test('Booleans', t => {
        t.equal(
            JSON5.parse('true'),
            true,
            'parses true'
        )

        t.equal(
            JSON5.parse('false'),
            false,
            'parses false'
        )

        t.end()
    })

    t.test('numbers', t => {
        t.strictSame(
            JSON5.parse('[0,0.,0e0]'),
            [0, 0, 0],
            'parses leading zeroes'
        )

        t.strictSame(
            JSON5.parse('[1,23,456,7890]'),
            [1, 23, 456, 7890],
            'parses integers'
        )

        t.strictSame(
            JSON5.parse('[-1,+2,-.1,-0]'),
            [-1, +2, -0.1, -0],
            'parses signed numbers'
        )

        t.strictSame(
            JSON5.parse('[.1,.23]'),
            [0.1, 0.23],
            'parses leading decimal points'
        )

        t.strictSame(
            JSON5.parse('[1.0,1.23]'),
            [1, 1.23],
            'parses fractional numbers'
        )

        t.strictSame(
            JSON5.parse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]'),
            [1, 10, 10, 1, 1.1, 0.1, 10],
            'parses exponents'
        )

        t.strictSame(
            JSON5.parse('[0x1,0x10,0xff,0xFF]'),
            [1, 16, 255, 255],
            'parses hexadecimal numbers'
        )

        t.strictSame(
            JSON5.parse('[Infinity,-Infinity]'),
            [Infinity, -Infinity],
            'parses signed and unsigned Infinity'
        )

        t.ok(
            isNaN(JSON5.parse('NaN')),
            'parses NaN'
        )

        t.ok(
            isNaN(JSON5.parse('-NaN')),
            'parses signed NaN'
        )

        t.end()
    })

    t.test('strings', t => {
        t.equal(
            JSON5.parse('"abc"'),
            'abc',
            'parses double quoted strings'
        )

        t.equal(
            JSON5.parse("'abc'"),
            'abc',
            'parses single quoted strings'
        )

        t.strictSame(
            JSON5.parse(`['"',"'"]`),
            ['"', "'"],
            'parses quotes in strings')

        t.equal(
            JSON5.parse(`'\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF\\\n\\\r\n\\\r\\\u2028\\\u2029\\a\\'\\"'`),
            `\b\f\n\r\t\v\0\x0f\u01FF\a'"`, // eslint-disable-line no-useless-escape
            'parses escaped characters'
        )

        t.test('parses line and paragraph separators with a warning', t => {
            const mock = sinon.mock(console)
            mock
                .expects('warn')
                .twice()
                .calledWithMatch('not valid ECMAScript')

            assert.deepStrictEqual(
                JSON5.parse("'\u2028\u2029'"),
                '\u2028\u2029'
            )

            mock.verify()
            mock.restore()

            t.end()
        })

        t.end()
    })

    t.test('comments', t => {
        t.strictSame(
            JSON5.parse('{//comment\n}'),
            {},
            'parses single-line comments'
        )

        t.strictSame(
            JSON5.parse('{}//comment'),
            {},
            'parses single-line comments at end of input'
        )

        t.strictSame(
            JSON5.parse('{/*comment\n** */}'),
            {},
            'parses multi-line comments'
        )

        t.end()
    })

    t.test('whitespace', t => {
        t.strictSame(
            JSON5.parse('{\t\v\f \u00A0\uFEFF\n\r\u2028\u2029\u2003}'),
            {},
            'parses whitespace'
        )

        t.end()
    })

    t.end()
})

t.test('parse(text, reviver)', t => {
    t.strictSame(
        JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? 'revived' : v),
        {a: 'revived', b: 2},
        'modifies property values'
    )

    t.strictSame(
        JSON5.parse('{a:{b:2}}', (k, v) => (k === 'b') ? 'revived' : v),
        {a: {b: 'revived'}},
        'modifies nested object property values'
    )

    t.strictSame(
        JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? undefined : v),
        {b: 2},
        'deletes property values'
    )

    t.strictSame(
        JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? 'revived' : v),
        [0, 'revived', 2],
        'modifies array values'
    )

    t.strictSame(
        JSON5.parse('[0,[1,2,3]]', (k, v) => (k === '2') ? 'revived' : v),
        [0, [1, 2, 'revived']],
        'modifies nested array values'
    )

    t.strictSame(
        JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? undefined : v),
        [0, , 2], // eslint-disable-line no-sparse-arrays
        'deletes array values'
    )

    t.equal(
        JSON5.parse('1', (k, v) => (k === '') ? 'revived' : v),
        'revived',
        'modifies the root value'
    )

    t.strictSame(
        JSON5.parse('{a:{b:2}}', function (k, v) { return (k === 'b' && this.b) ? 'revived' : v }),
        {a: {b: 'revived'}},
        'sets `this` to the parent value'
    )

    t.end()
})
