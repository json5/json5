import assert from 'assert'
import sinon from 'sinon'
import JSON5 from '../lib'

describe('JSON5', () => {
    describe('#parse()', () => {
        describe('objects', () => {
            it('parses empty objects', () => {
                assert.deepStrictEqual(JSON5.parse('{}'), {})
            })

            it('parses double string property names', () => {
                assert.deepStrictEqual(JSON5.parse('{"a":1}'), {a: 1})
            })

            it('parses single string property names', () => {
                assert.deepStrictEqual(JSON5.parse("{'a':1}"), {a: 1})
            })

            it('parses unquoted property names', () => {
                assert.deepStrictEqual(JSON5.parse('{a:1}'), {a: 1})
            })

            it('parses special character property names', () => {
                assert.deepStrictEqual(JSON5.parse('{$_:1,_$:2,a\u200C:3}'), {$_: 1, _$: 2, 'a\u200C': 3})
            })

            it('parses unicode property names', () => {
                assert.deepStrictEqual(JSON5.parse('{ùńîċõďë:9}'), {'ùńîċõďë': 9})
            })

            it('parses escaped property names', () => {
                assert.deepStrictEqual(JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}'), {ab: 1, $_: 2, _$: 3})
            })

            it('preserves __proto__ property names', () => {
                // eslint-disable-next-line no-proto
                assert.strictEqual(JSON5.parse('{"__proto__":1}').__proto__, 1)
            })

            it('parses multiple properties', () => {
                assert.deepStrictEqual(JSON5.parse('{abc:1,def:2}'), {abc: 1, def: 2})
            })

            it('parses nested objects', () => {
                assert.deepStrictEqual(JSON5.parse('{a:{b:2}}'), {a: {b: 2}})
            })
        })

        describe('arrays', () => {
            it('parses empty arrays', () => {
                assert.deepStrictEqual(JSON5.parse('[]'), [])
            })

            it('parses array values', () => {
                assert.deepStrictEqual(JSON5.parse('[1]'), [1])
            })

            it('parses multiple array values', () => {
                assert.deepStrictEqual(JSON5.parse('[1,2]'), [1, 2])
            })

            it('parses nested arrays', () => {
                assert.deepStrictEqual(JSON5.parse('[1,[2,3]]'), [1, [2, 3]])
            })
        })

        it('parses nulls', () => {
            assert.strictEqual(JSON5.parse('null'), null)
        })

        it('parses true', () => {
            assert.strictEqual(JSON5.parse('true'), true)
        })

        it('parses false', () => {
            assert.strictEqual(JSON5.parse('false'), false)
        })

        describe('numbers', () => {
            it('parses leading zeroes', () => {
                assert.deepStrictEqual(JSON5.parse('[0,0.,0e0]'), [0, 0, 0])
            })

            it('parses integers', () => {
                assert.deepStrictEqual(JSON5.parse('[1,23,456,7890]'), [1, 23, 456, 7890])
            })

            it('parses signed numbers', () => {
                assert.deepStrictEqual(JSON5.parse('[-1,+2,-.1,-0]'), [-1, +2, -0.1, -0])
            })

            it('parses leading decimal points', () => {
                assert.deepStrictEqual(JSON5.parse('[.1,.23]'), [0.1, 0.23])
            })

            it('parses fractional numbers', () => {
                assert.deepStrictEqual(JSON5.parse('[1.0,1.23]'), [1, 1.23])
            })

            it('parses exponents', () => {
                assert.deepStrictEqual(JSON5.parse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]'), [1, 10, 10, 1, 1.1, 0.1, 10])
            })

            it('parses hexadecimal numbers', () => {
                assert.deepStrictEqual(JSON5.parse('[0x1,0x10,0xff,0xFF]'), [1, 16, 255, 255])
            })

            it('parses signed and unsiged Infinity', () => {
                assert.deepStrictEqual(JSON5.parse('[Infinity,-Infinity]'), [Infinity, -Infinity])
            })

            it('parses signed and unsigned NaN', () => {
                assert(isNaN(JSON5.parse('NaN')))
                assert(isNaN(JSON5.parse('-NaN')))
            })
        })

        describe('strings', () => {
            it('parses double quoted strings', () => {
                assert.strictEqual(JSON5.parse('"abc"'), 'abc')
            })

            it('parses single quoted strings', () => {
                assert.strictEqual(JSON5.parse("'abc'"), 'abc')
            })

            it('parses nested quotes strings', () => {
                assert.deepStrictEqual(JSON5.parse(`['"',"'"]`), ['"', "'"])
            })

            it('parses escaped characters', () => {
                // eslint-disable-next-line no-useless-escape
                assert.strictEqual(JSON5.parse(`'\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF\\\n\\\r\n\\\r\\\u2028\\\u2029\\a\\'\\"'`), `\b\f\n\r\t\v\0\x0f\u01FF\a'"`)
            })

            it('parses line and paragraph separators with a warning', () => {
                const warn = sinon.stub(console, 'warn').callsFake(message => {
                    assert(message.indexOf('not valid ECMAScript') >= 0)
                })
                assert.strictEqual(JSON5.parse("'\u2028\u2029'"), '\u2028\u2029')
                assert(warn.calledTwice)
                warn.restore()
            })
        })

        describe('comments', () => {
            it('parses single-line comments', () => {
                assert.deepStrictEqual(JSON5.parse('{//comment\n}'), {})
            })

            it('parses single-line comments at end of input', () => {
                assert.deepStrictEqual(JSON5.parse('{}//comment'), {})
            })

            it('parses multi-line comments', () => {
                assert.deepStrictEqual(JSON5.parse('{/*comment\n** */}'), {})
            })
        })

        it('parses whitespace', () => {
            assert.deepStrictEqual(JSON5.parse('{\t\v\f \u00A0\uFEFF\n\r\u2028\u2029\u2003}'), {})
        })
    })

    describe('#parse(text, reviver)', () => {
        it('modifies property values', () => {
            assert.deepStrictEqual(
                JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? 'revived' : v),
                {a: 'revived', b: 2}
            )
        })

        it('modifies nested object property values', () => {
            assert.deepStrictEqual(
                JSON5.parse('{a:{b:2}}', (k, v) => (k === 'b') ? 'revived' : v),
                {a: {b: 'revived'}}
            )
        })

        it('deletes property values', () => {
            assert.deepStrictEqual(
                JSON5.parse('{a:1,b:2}', (k, v) => (k === 'a') ? undefined : v),
                {b: 2}
            )
        })

        it('modifies array values', () => {
            assert.deepStrictEqual(
                JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? 'revived' : v),
                [0, 'revived', 2]
            )
        })

        it('modifies nested array values', () => {
            assert.deepStrictEqual(
                JSON5.parse('[0,[1,2,3]]', (k, v) => (k === '2') ? 'revived' : v),
                [0, [1, 2, 'revived']]
            )
        })

        it('deletes array values', () => {
            assert.deepStrictEqual(
                JSON5.parse('[0,1,2]', (k, v) => (k === '1') ? undefined : v),
                // eslint-disable-next-line no-sparse-arrays
                [0, , 2]
            )
        })

        it('modifies the root value', () => {
            assert.strictEqual(
                JSON5.parse('1', (k, v) => (k === '') ? 'revived' : v),
                'revived'
            )
        })

        it('sets `this` to the parent value', () => {
            assert.deepStrictEqual(
                JSON5.parse('{a:{b:2}}', function (k, v) { return (k === 'b' && this.b) ? 'revived' : v }),
                {a: {b: 'revived'}}
            )
        })
    })
})
