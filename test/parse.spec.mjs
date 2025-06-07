/* eslint-disable dot-notation */
// noinspection JSUnresolvedReference

import {assert, expect} from 'chai'
import sinon from 'sinon'

const JSON5 = (await import('../lib/index.js')).default

describe('parse(text)', () => {
    describe('objects', () => {
        it('parses empty objects', () =>
            expect(
                JSON5.parse('{}')).to.deep.equal(
                {},
            ),
        )

        it('parses double-quoted string property names', () =>
            expect(
                JSON5.parse('{"a":1}')).to.deep.equal(
                {a: 1},
            ),
        )

        it('parses single-quoted string property names', () =>
            expect(
                JSON5.parse("{'a':1}")).to.deep.equal(
                {a: 1},
            ),
        )

        it('parses unquoted property names', () =>
            expect(
                JSON5.parse('{a:1}')).to.deep.equal(
                {a: 1},
            ),
        )

        it('parses special character property names', () =>
            expect(
                JSON5.parse('{$_:1,_$:2,a\u200C:3}')).to.deep.equal(
                // eslint-disable-next-line quote-props
                {$_: 1, _$: 2, 'a\u200C': 3},
            ),
        )

        it('parses unicode property names', () =>
            // noinspection NonAsciiCharacters
            expect(
                JSON5.parse('{ùńîċõďë:9}')).to.deep.equal(
                // eslint-disable-next-line quote-props
                {'ùńîċõďë': 9},
            ),
        )

        it('parses escaped property names', () =>
            expect(
                JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}')).to.deep.equal(
                {ab: 1, $_: 2, _$: 3},
            ),
        )

        it('preserves __proto__ property names', () =>
            expect(
                // eslint-disable-next-line no-proto
                JSON5.parse('{"__proto__":1}').__proto__).to.equal(
                1,
            ),
        )

        it('preserves __proto__ property names when reviver is used', () =>
            expect(
                // eslint-disable-next-line no-proto
                JSON5.parse('{"__proto__":1}', (k, v) => v).__proto__).to.equal(
                1,
            ),
        )

        it('parses multiple properties', () =>
            expect(
                JSON5.parse('{abc:1,def:2}')).to.deep.equal(
                {abc: 1, def: 2},
            ),
        )

        it('parses nested objects', () =>
            expect(
                JSON5.parse('{a:{b:2}}')).to.deep.equal(
                {a: {b: 2}},
            ),
        )
    })

    describe('arrays', () => {
        it('parses empty arrays', () =>
            expect(
                JSON5.parse('[]')).to.deep.equal(
                [],
            ),
        )

        it('parses array values', () =>
            expect(
                JSON5.parse('[1]')).to.deep.equal(
                [1],
            ),
        )

        it('parses multiple array values', () =>
            expect(
                JSON5.parse('[1,2]')).to.deep.equal(
                [1, 2],
            ),
        )

        it('parses nested arrays', () =>
            expect(
                JSON5.parse('[1,[2,3]]')).to.deep.equal(
                [1, [2, 3]],
            ),
        )
    })

    it('nulls', () => {
        expect(
            JSON5.parse('null')).to.equal(
            null,
            'parses nulls',
        )
    })

    describe('booleans', () => {
        it('parses true', () =>
            expect(
                JSON5.parse('true')).to.equal(
                true,
            ),
        )

        it('parses false', () =>
            expect(
                JSON5.parse('false')).to.equal(
                false,
            ),
        )
    })

    describe('numbers', () => {
        it('parses leading zeroes', () =>
            expect(
                JSON5.parse('[0,0.,0e0,0E0]')).to.deep.equal(
                [0, 0, 0, 0],
            ),
        )

        it('parses integers', () =>
            expect(
                JSON5.parse('[1,23,456,7890,09,-08]')).to.deep.equal(
                [1, 23, 456, 7890, 9, -8],
            ),
        )

        it('parses signed numbers', () =>
            expect(
                JSON5.parse('[-1,+2,-.1,-0]')).to.deep.equal(
                [-1, +2, -0.1, -0],
            ),
        )

        it('parses leading and trailing decimal points', () =>
            expect(
                JSON5.parse('[.1,.23,-4.]')).to.deep.equal(
                [0.1, 0.23, -4],
            ),
        )

        it('parses fractional numbers', () =>
            expect(
                JSON5.parse('[1.0,1.23]')).to.deep.equal(
                [1, 1.23],
            ),
        )

        it('parses exponents', () =>
            expect(
                JSON5.parse('[1e0,1e1,1e01,1.e0,1.E0,1.1E0,1e-1,1E+1]')).to.deep.equal(
                [1, 10, 10, 1, 1, 1.1, 0.1, 10],
            ),
        )

        it('parses hexadecimal numbers', () =>
            expect(
                JSON5.parse('[0x1,0x10,0Xff,0xFF,0x11]')).to.deep.equal(
                [1, 16, 255, 255, 17],
            ),
        )

        expect(
            JSON5.parse('[Infinity,-Infinity]')).to.deep.equal(
            [Infinity, -Infinity],
            'parses signed and unsigned Infinity',
        )

        it('parses signed and unsigned Infinity', () =>
            expect(
                JSON5.parse('[Infinity,-Infinity]')).to.deep.equal(
                [Infinity, -Infinity],
            ),
        )

        it('parses NaN', () => {
            expect(
                isNaN(JSON5.parse('NaN'))).to.be.ok

            // parses signed NaN
            expect(
                isNaN(JSON5.parse('-NaN'))).to.be.ok
        })

        it('parses 1', () => {
            expect(
                JSON5.parse('1')).to.equal(
                1,
            )
        })

        it('parses +1.23e100', () =>
            expect(
                JSON5.parse('+1.23e100')).to.equal(
                1.23e100,
            ),
        )

        it('parses bare hexadecimal number', () => {
            expect(
                JSON5.parse('0x1')).to.equal(
                0x1,
            )

            expect(
                JSON5.parse('-0x0123456789abcdefABCDEF')).to.equal(
                // eslint-disable-next-line no-loss-of-precision
                -0x0123456789abcdefABCDEF,
            )
        })
    })

    describe('strings', () => {
        it('parses double-quoted strings', () =>
            expect(
                JSON5.parse('"ab😀c"')).to.equal(
                'ab😀c',
            ),
        )

        it('parses single-quoted strings', () =>
            expect(
                JSON5.parse("'abc'")).to.equal(
                'abc',
            ),
        )

        it('parses quotes in strings', () =>
            expect(
                // eslint-disable-next-line quotes
                JSON5.parse(`['"',"'",'\`']`)).to.deep.equal(
                ['"', "'", '`'],
            ),
        )

        it('parses escaped characters', () =>
            expect(
                // eslint-disable-next-line quotes
                JSON5.parse(`'\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF\\\n\\\r\n\\\r\\\u2028\\\u2029\\a\\'\\"'`)).to.equal(
                `\b\f\n\r\t\v\0\x0f\u01FF\a'"`, // eslint-disable-line no-useless-escape,quotes
            ),
        )
    })

    it('parses line and paragraph separators with a warning', () => {
        const mock = sinon.mock(console)
        mock
            .expects('warn')
            .twice()
            .calledWithMatch('not valid ECMAScript')

        assert.deepStrictEqual(
            JSON5.parse("'\u2028\u2029'"),
            '\u2028\u2029',
        )

        mock.verify()
        mock.restore()
    })

    describe('comments', () => {
        it('parses single-line comments', () =>
            expect(
                JSON5.parse('{//comment\n}')).to.deep.equal(
                {},
            ),
        )

        it('parses single-line comments at end of input', () =>
            expect(
                JSON5.parse('{}//comment')).to.deep.equal(
                {},
            ),
        )

        it('parses multi-line comments', () =>
            expect(
                JSON5.parse('{/*comment\n** */}')).to.deep.equal(
                {},
            ),
        )
    })

    it('whitespace', () => {
        expect(
            JSON5.parse('{\t\v\f \u00A0\uFEFF\n\r\u2028\u2029\u2003}')).to.deep.equal(
            {},
            'parses whitespace',
        )
    })
})

describe('parse(text, reviver)', () => {
    it('modifies property values', () =>
        expect(
            JSON5.parse('{a:1,b:2,c:null}', (k, v) => (k === 'a') ? 'revived' : v)).to.deep.equal(
            {a: 'revived', b: 2, c: null},
        ),
    )

    it('modifies nested object property values', () =>
        expect(
            JSON5.parse('{a:{b:2}}', (k, v) => (k === 'b') ? 'revived' : v)).to.deep.equal(
            {a: {b: 'revived'}},
        ),
    )

    it('deletes property values', () =>
        expect(
            JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? undefined : v)).to.deep.equal(
            {b: 2},
        ),
    )

    it('modifies array values', () =>
        expect(
            JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? 'revived' : v)).to.deep.equal(
            [0, 'revived', 2],
        ),
    )

    it('modifies nested array values', () =>
        expect(
            JSON5.parse('[0,[1,2,3]]', (k, v) => (k === '2') ? 'revived' : v)).to.deep.equal(
            [0, [1, 2, 'revived']],
        ),
    )

    // noinspection JSConsecutiveCommasInArrayLiteral
    it('deletes array values', () =>
        expect(
            JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? undefined : v)).to.deep.equal(
            [0, , 2], // eslint-disable-line no-sparse-arrays
        ),
    )

    it('deletes array values and shrinks array', () =>
        expect(
            JSON5.parse('[0,1,2]', function (k, v) {
                if (k === '1') {
                    this.splice(parseInt(k), 1)
                    return undefined
                } else {
                    return v
                }
            })).to.deep.equal(
            [0, 2],
        ),
    )

    it('modifies the root value', () =>
        expect(
            JSON5.parse('1', (k, v) => (k === '') ? 'revived' : v)).to.equal(
            'revived',
        ),
    )

    it('sets `this` to the parent value', () =>
        expect(
            JSON5.parse('{a:{b:2}}', function (k, v) { return (k === 'b' && this.b) ? 'revived' : v })).to.deep.equal(
            {a: {b: 'revived'}},
        ),
    )

    it('make sure content of primitive values is accessible', () =>
        expect(
            JSON5.parse('{a:1234567890123456789001234567890,b:"x"}', function (k, v, context) {
                if (typeof v === 'number') {
                    // eslint-disable-next-line n/no-unsupported-features/es-builtins
                    return BigInt(context.source)
                } else if (typeof v === 'string') {
                    return context.source.replace(/"/g, '@')
                }
                return v
            })).to.deep.equal(
            {a: 1234567890123456789001234567890n, b: '@x@'},
        ),
    )
})

describe('very long strings', () => {
    it('parse long string (1MB)', () => {
        const s = 'a'.repeat(1000 * 1000)
        assert.strictEqual(JSON5.parse(`'${s}'`), s)
    })

    it('parse long escaped string (20KB)', () => {
        const s = '\\t'.repeat(10000)
        assert.strictEqual(JSON5.parse(`'${s}'`), s.replace(/\\t/g, '\t'))
    })

    // Let's not run this slow test all the time.
    xit('parse long string (100MB)', function () {
        this.timeout(15000)
        const s = 'z'.repeat(100 * 1000 * 1000)
        assert.strictEqual(JSON5.parse(`'${s}'`), s)
    })
})

describe('line ending agnosticism', () => {
    it('counts lines correctly', () => {
        try {
            JSON5.parse('[1,\n2,\r3,\r\n4,\u20285,\u2029?]')
            expect(false).to.be.ok
        } catch (err) {
            expect(err instanceof SyntaxError &&
                /^JSON5: invalid character/.test(err.message) &&
                err.lineNumber === 6 &&
                err.columnNumber === 1).to.be.ok
        }
    })
})
