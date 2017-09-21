const assert = require('assert')
const sinon = require('sinon')
const JSON5 = require('../lib/')

describe('JSON5', function () {
    describe('#parse()', function () {
        describe('objects', function () {
            it('parses empty objects', function () {
                assert.deepStrictEqual(JSON5.parse('{}'), {})
            })

            it('parses double string property names', function () {
                assert.deepStrictEqual(JSON5.parse('{"a":1}'), {a: 1})
            })

            it('parses single string property names', function () {
                assert.deepStrictEqual(JSON5.parse("{'a':1}"), {a: 1})
            })

            it('parses unquoted property names', function () {
                assert.deepStrictEqual(JSON5.parse('{a:1}'), {a: 1})
            })

            it('parses special character property names', function () {
                assert.deepStrictEqual(JSON5.parse('{$_:1,_$:2,a\u200C:3}'), {$_: 1, _$: 2, 'a\u200C': 3})
            })

            it('parses unicode property names', function () {
                assert.deepStrictEqual(JSON5.parse('{ùńîċõďë:9}'), {'ùńîċõďë': 9})
            })

            it('parses escaped property names', function () {
                assert.deepStrictEqual(JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}'), {ab: 1, $_: 2, _$: 3})
            })

            it('parses multiple properties', function () {
                assert.deepStrictEqual(JSON5.parse('{abc:1,def:2}'), {abc: 1, def: 2})
            })

            it('parses nested objects', function () {
                assert.deepStrictEqual(JSON5.parse('{a:{b:2}}'), {a: {b: 2}})
            })
        })

        describe('arrays', function () {
            it('parses empty arrays', function () {
                assert.deepStrictEqual(JSON5.parse('[]'), [])
            })

            it('parses array values', function () {
                assert.deepStrictEqual(JSON5.parse('[1]'), [1])
            })

            it('parses multiple array values', function () {
                assert.deepStrictEqual(JSON5.parse('[1,2]'), [1, 2])
            })

            it('parses nested arrays', function () {
                assert.deepStrictEqual(JSON5.parse('[1,[2,3]]'), [1, [2, 3]])
            })
        })

        it('parses nulls', function () {
            assert.strictEqual(JSON5.parse('null'), null)
        })

        it('parses true', function () {
            assert.strictEqual(JSON5.parse('true'), true)
        })

        it('parses false', function () {
            assert.strictEqual(JSON5.parse('false'), false)
        })

        describe('numbers', function () {
            it('parses leading zeroes', function () {
                assert.deepStrictEqual(JSON5.parse('[0,0.,0e0]'), [0, 0, 0])
            })

            it('parses integers', function () {
                assert.deepStrictEqual(JSON5.parse('[1,23,456,7890]'), [1, 23, 456, 7890])
            })

            it('parses signed numbers', function () {
                assert.deepStrictEqual(JSON5.parse('[-1,+2,-.1,-0,-Infinity]'), [-1, +2, -0.1, -0, -Infinity])
            })

            it('parses leading decimal points', function () {
                assert.deepStrictEqual(JSON5.parse('[.1,.23]'), [0.1, 0.23])
            })

            it('parses fractional numbers', function () {
                assert.deepStrictEqual(JSON5.parse('[1.0,1.23]'), [1, 1.23])
            })

            it('parses exponents', function () {
                assert.deepStrictEqual(JSON5.parse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]'), [1, 10, 10, 1, 1.1, 0.1, 10])
            })

            it('parses hexadecimal numbers', function () {
                assert.deepStrictEqual(JSON5.parse('[0x1,0x10,0xff,0xFF]'), [1, 16, 255, 255])
            })

            it('parses Infinity', function () {
                assert.strictEqual(JSON5.parse('Infinity'), Infinity)
            })

            it('parses NaN with a warning', function () {
                assert(isNaN(JSON5.parse('NaN')))
            })
        })

        describe('strings', function () {
            it('parses double quoted strings', function () {
                assert.strictEqual(JSON5.parse('"abc"'), 'abc')
            })

            it('parses single quoted strings', function () {
                assert.strictEqual(JSON5.parse("'abc'"), 'abc')
            })

            it('parses nested quotes strings', function () {
                assert.deepStrictEqual(JSON5.parse(`['"',"'"]`), ['"', "'"])
            })

            it('parses escaped characters', function () {
                // eslint-disable-next-line no-useless-escape
                assert.strictEqual(JSON5.parse(`'\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF\\\n\\\r\n\\a\\'\\"'`), `\b\f\n\r\t\v\0\x0f\u01FF\n\n\a'"`)
            })

            it('parses line and paragraph separators with a warning', function () {
                const warn = sinon.stub(console, 'warn', function (message) {
                    assert(message.indexOf('not valid ECMAScript') >= 0)
                })
                assert.strictEqual(JSON5.parse("'\u2028\u2029'"), '\u2028\u2029')
                assert(warn.calledTwice)
                warn.restore()
            })
        })

        describe('comments', function () {
            it('parses single-line comments', function () {
                assert.deepStrictEqual(JSON5.parse('{//comment\n}'), {})
            })

            it('parses multi-line comments', function () {
                assert.deepStrictEqual(JSON5.parse('{/*comment\n* */}'), {})
            })
        })

        it('parses whitespace', function () {
            assert.deepEqual(JSON5.parse('{\t\v\f \u00A0\uFEFF\n\r\u2028\u2029\u2003}'), {})
        })
    })

    describe('#parse(text, reviver)', function () {
        it('modifies property values', function () {
            assert.deepStrictEqual(
                JSON5.parse('{a:1,b:2}', function (k, v) {
                    return (k === 'a') ? 'revived' : v
                }),
                {a: 'revived', b: 2}
            )
        })

        it('modifies nested object property values', function () {
            assert.deepStrictEqual(
                JSON5.parse('{a:{b:2}}', function (k, v) {
                    return (k === 'b') ? 'revived' : v
                }),
                {a: {b: 'revived'}}
            )
        })

        it('deletes property values', function () {
            assert.deepStrictEqual(
                JSON5.parse('{a:1,b:2}', function (k, v) {
                    return (k === 'a') ? undefined : v
                }),
                {b: 2}
            )
        })

        it('modifies array values', function () {
            assert.deepStrictEqual(
                JSON5.parse('[0,1,2]', function (k, v) {
                    return (k === '1') ? 'revived' : v
                }),
                [0, 'revived', 2]
            )
        })

        it('modifies nested array values', function () {
            assert.deepStrictEqual(
                JSON5.parse('[0,[1,2,3]]', function (k, v) {
                    return (k === '2') ? 'revived' : v
                }),
                [0, [1, 2, 'revived']]
            )
        })

        it('deletes array values', function () {
            assert.deepStrictEqual(
                JSON5.parse('[0,1,2]', function (k, v) {
                    return (k === '1') ? undefined : v
                }),
                // eslint-disable-next-line no-sparse-arrays
                [0, , 2]
            )
        })

        it('modifies the root value', function () {
            assert.deepStrictEqual(
                JSON5.parse('1', function (k, v) {
                    return (k === '') ? 'revived' : v
                }),
                'revived'
            )
        })

        it('sets `this` to the parent value', function () {
            assert.deepStrictEqual(
                JSON5.parse('{a:{b:2}}', function (k, v) {
                    return (k === 'b' && this.b) ? 'revived' : v
                }),
                {a: {b: 'revived'}}
            )
        })
    })

    describe('#stringify', function () {
        describe('objects', function () {
            it('stringifies empty objects', function () {
                assert.strictEqual(JSON5.stringify({}), '{}')
            })

            it('stringifies unquoted property names', function () {
                assert.strictEqual(JSON5.stringify({a: 1}), '{a:1}')
            })

            it('stringifies single quoted string property names', function () {
                assert.strictEqual(JSON5.stringify({'a-b': 1}), "{'a-b':1}")
            })

            it('stringifies double quoted string property names', function () {
                assert.strictEqual(JSON5.stringify({"a'": 1}), `{"a'":1}`)
            })

            it('stringifies special character property names', function () {
                assert.strictEqual(JSON5.stringify({$_: 1, _$: 2, 'a\u200C': 3}), '{$_:1,_$:2,a\u200C:3}')
            })

            it('stringifies unicode property names', function () {
                assert.strictEqual(JSON5.stringify({'ùńîċõďë': 9}), '{ùńîċõďë:9}')
            })

            it('stringifies escaped property names', function () {
                assert.strictEqual(JSON5.stringify({'\b\f\n\r\t\v\0\x01': 1}), "{'\\b\\f\\n\\r\\t\\v\\0\\x01':1}")
            })

            it('stringifies multiple properties', function () {
                assert.strictEqual(JSON5.stringify({abc: 1, def: 2}), '{abc:1,def:2}')
            })

            it('stringifies nested objects', function () {
                assert.strictEqual(JSON5.stringify({a: {b: 2}}), '{a:{b:2}}')
            })
        })

        describe('arrays', function () {
            it('stringifies empty arrays', function () {
                assert.strictEqual(JSON5.stringify([]), '[]')
            })

            it('stringifies array values', function () {
                assert.strictEqual(JSON5.stringify([1]), '[1]')
            })

            it('stringifies multiple array values', function () {
                assert.strictEqual(JSON5.stringify([1, 2]), '[1,2]')
            })

            it('stringifies nested arrays', function () {
                assert.strictEqual(JSON5.stringify([1, [2, 3]]), '[1,[2,3]]')
            })
        })

        it('stringifies nulls', function () {
            assert.strictEqual(JSON5.stringify(null), 'null')
        })

        it('stringifies true', function () {
            assert.strictEqual(JSON5.stringify(true), 'true')
        })

        it('stringifies false', function () {
            assert.strictEqual(JSON5.stringify(false), 'false')
        })

        it('returns undefined for functions', function () {
            assert.strictEqual(JSON5.stringify(function () {}), undefined)
        })

        it('returns null for functions in arrays', function () {
            assert.strictEqual(JSON5.stringify([function () {}]), '[null]')
        })

        describe('numbers', function () {
            it('stringifies numbers', function () {
                assert.strictEqual(JSON5.stringify(-1.2), '-1.2')
            })

            it('stringifies non-finite numbers', function () {
                assert.strictEqual(JSON5.stringify([Infinity, -Infinity, NaN]), '[Infinity,-Infinity,NaN]')
            })
        })

        describe('strings', function () {
            it('stringifies single quoted strings', function () {
                assert.strictEqual(JSON5.stringify('abc'), "'abc'")
            })

            it('stringifies double quoted strings', function () {
                assert.strictEqual(JSON5.stringify("abc'"), `"abc'"`)
            })

            it('stringifies escaped characters', function () {
                assert.strictEqual(JSON5.stringify('\b\f\n\r\t\v\0\x0f'), "'\\b\\f\\n\\r\\t\\v\\0\\x0f'")
            })

            it('stringifies escaped single quotes', function () {
                assert.strictEqual(JSON5.stringify(`'"`), `'\\'"'`)
            })

            it('stringifies escaped double quotes', function () {
                assert.strictEqual(JSON5.stringify(`''"`), `"''\\""`)
            })

            it('stringifies escaped line and paragraph separators', function () {
                assert.strictEqual(JSON5.stringify('\u2028\u2029'), "'\\u2028\\u2029'")
            })
        })

        it('stringifies using built-in toJSON methods', function () {
            assert.strictEqual(JSON5.stringify(new Date('2016-01-01T00:00:00.000Z')), "'2016-01-01T00:00:00.000Z'")
        })

        it('stringifies using user defined toJSON methods', function () {
            /* eslint-disable no-extend-native */
            RegExp.prototype.toJSON = RegExp.prototype.toString
            assert.strictEqual(JSON5.stringify(/a/), "'/a/'")
            RegExp.prototype.toJSON = undefined
            /* eslint-enable no-extend-native */
        })

        it('stringifies using user defined toJSON(key) methods', function () {
            let C = function () {}
            C.prototype.toJSON = function (key) { return (key === 'a') ? 1 : 2 }
            assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
        })

        it('stringifies using toJSON5 methods', function () {
            /* eslint-disable no-extend-native */
            RegExp.prototype.toJSON5 = RegExp.prototype.toString
            assert.strictEqual(JSON5.stringify(/a/), "'/a/'")
            RegExp.prototype.toJSON5 = undefined
            /* eslint-enable no-extend-native */
        })

        it('stringifies using toJSON5(key) methods', function () {
            let C = function () {}
            C.prototype.toJSON5 = function (key) { return (key === 'a') ? 1 : 2 }
            assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
        })
    })

    describe('#stringify(space)', function () {
        it('does not indent when no value is provided', function () {
            assert.strictEqual(JSON5.stringify([1]), '[1]')
        })

        it('does not indent when 0 is provided', function () {
            assert.strictEqual(JSON5.stringify([1], null, 0), '[1]')
        })

        it('does not indent when an empty string is provided', function () {
            assert.strictEqual(JSON5.stringify([1], null, ''), '[1]')
        })

        it('indents n spaces when a number is provided', function () {
            assert.strictEqual(JSON5.stringify([1], null, 2), '[\n  1,\n]')
        })

        it('does not indent more than 10 spaces when a number is provided', function () {
            assert.strictEqual(JSON5.stringify([1], null, 11), '[\n          1,\n]')
        })

        it('indents with the string provided', function () {
            assert.strictEqual(JSON5.stringify([1], null, '\t'), '[\n\t1,\n]')
        })

        it('does not indent more than 10 characters of the string provided', function () {
            assert.strictEqual(JSON5.stringify([1], null, '           '), '[\n          1,\n]')
        })

        it('indents in arrays', function () {
            assert.strictEqual(JSON5.stringify([1], null, 2), '[\n  1,\n]')
        })

        it('indents in nested arrays', function () {
            assert.strictEqual(JSON5.stringify([1, [2], 3], null, 2), '[\n  1,\n  [\n    2,\n  ],\n  3,\n]')
        })

        it('indents in objects', function () {
            assert.strictEqual(JSON5.stringify({a: 1}, null, 2), '{\n  a: 1,\n}')
        })

        it('indents in nested objects', function () {
            assert.strictEqual(JSON5.stringify({a: {b: 2}}, null, 2), '{\n  a: {\n    b: 2,\n  },\n}')
        })
    })

    describe('#stringify(replacer)', function () {
        it('filters keys when an array is provided', function () {
            assert.strictEqual(JSON5.stringify({a: 1, b: 2, 0: 3}, ['a', 0]), "{a:1,'0':3}")
        })

        it('replaces values when a function is provided', function () {
            assert.strictEqual(
                JSON5.stringify({a: 1, b: 2}, function (key, value) {
                    return (key === 'a') ? 2 : value
                }),
                '{a:2,b:2}'
            )
        })
    })

    describe('#stringify(options)', function () {
        it('accepts replacer as an option', function () {
            assert.strictEqual(JSON5.stringify({a: 1, b: 2, 0: 3}, {replacer: ['a', 0]}), "{a:1,'0':3}")
        })

        it('accepts space as an option', function () {
            assert.strictEqual(JSON5.stringify([1], {space: 2}), '[\n  1,\n]')
        })
    })

    describe('#stringify({quote})', function () {
        it('uses double quotes if provided', function () {
            assert.strictEqual(JSON5.stringify({'a"': '1"'}, {quote: '"'}), '{"a\\"":"1\\""}')
        })

        it('uses single quotes if provided', function () {
            assert.strictEqual(JSON5.stringify({"a'": "1'"}, {quote: "'"}), "{'a\\'':'1\\''}")
        })
    })
})

describe('require(*.json5)', function () {
    it('parses a JSON5 document', function () {
        require('../lib/register')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    })
})
