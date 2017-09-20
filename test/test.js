const assert = require('assert')
const sinon = require('sinon')
const JSON5 = require('../lib/')

describe('JSON5', function () {
    describe('#parse()', function () {
        describe('objects', function () {
            it('parses empty objects', function () {
                assert.deepStrictEqual({}, JSON5.parse('{}'))
            })

            it('parses double string property names', function () {
                assert.deepStrictEqual({a: 1}, JSON5.parse('{"a":1}'))
            })

            it('parses single string property names', function () {
                assert.deepStrictEqual({a: 1}, JSON5.parse("{'a':1}"))
            })

            it('parses unquoted property names', function () {
                assert.deepStrictEqual({a: 1}, JSON5.parse('{a:1}'))
            })

            it('parses special character property names', function () {
                assert.deepStrictEqual({$_: 1, _$: 2, 'a\u200C': 3}, JSON5.parse('{$_:1,_$:2,a\u200C:3}'))
            })

            it('parses unicode property names', function () {
                assert.deepStrictEqual({'ùńîċõďë': 9}, JSON5.parse('{ùńîċõďë:9}'))
            })

            it('parses escaped property names', function () {
                assert.deepStrictEqual({ab: 1, $_: 2, _$: 3}, JSON5.parse('{\\u0061\\u0062:1,\\u0024\\u005F:2,\\u005F\\u0024:3}'))
            })

            it('parses multiple properties', function () {
                assert.deepStrictEqual({abc: 1, def: 2}, JSON5.parse('{abc:1,def:2}'))
            })

            it('parses nested objects', function () {
                assert.deepStrictEqual({a: {b: 2}}, JSON5.parse('{a:{b:2}}'))
            })
        })

        describe('arrays', function () {
            it('parses empty arrays', function () {
                assert.deepStrictEqual([], JSON5.parse('[]'))
            })

            it('parses array values', function () {
                assert.deepStrictEqual([1], JSON5.parse('[1]'))
            })

            it('parses multiple array values', function () {
                assert.deepStrictEqual([1, 2], JSON5.parse('[1,2]'))
            })

            it('parses nested arrays', function () {
                assert.deepStrictEqual([1, [2, 3]], JSON5.parse('[1,[2,3]]'))
            })
        })

        it('parses nulls', function () {
            assert.strictEqual(null, JSON5.parse('null'))
        })

        it('parses true', function () {
            assert.strictEqual(true, JSON5.parse('true'))
        })

        it('parses false', function () {
            assert.strictEqual(false, JSON5.parse('false'))
        })

        describe('numbers', function () {
            it('parses leading zeroes', function () {
                assert.deepStrictEqual([0, 0, 0], JSON5.parse('[0,0.,0e0]'))
            })

            it('parses integers', function () {
                assert.deepStrictEqual([1, 23, 456, 7890], JSON5.parse('[1,23,456,7890]'))
            })

            it('parses signed numbers', function () {
                // let warn = sinon.stub(console, 'warn')
                assert.deepStrictEqual([-1, +2, -0.1, -0, -Infinity], JSON5.parse('[-1,+2,-.1,-0,-Infinity]'))
                // warn.restore()
            })

            it('parses leading decimal points', function () {
                assert.deepStrictEqual([0.1, 0.23], JSON5.parse('[.1,.23]'))
            })

            it('parses fractional numbers', function () {
                assert.deepStrictEqual([1, 1.23], JSON5.parse('[1.0,1.23]'))
            })

            it('parses exponents', function () {
                assert.deepStrictEqual([1, 10, 10, 1, 1.1, 0.1, 10], JSON5.parse('[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]'))
            })

            // it('parses binary numbers', function () {
            //     assert.deepStrictEqual([1, 2, 3], JSON5.parse('[0b1,0b10,0b011]'))
            // })

            // it('parses octal numbers', function () {
            //     assert.deepStrictEqual([1, 8, 9], JSON5.parse('[0o1,0o10,0o011]'))
            // })

            it('parses hexadecimal numbers', function () {
                assert.deepStrictEqual([1, 16, 255, 255], JSON5.parse('[0x1,0x10,0xff,0xFF]'))
            })

            it('parses Infinity', function () {
                // const warn = sinon.stub(console, 'warn', function (message) {
                //     assert(message.indexOf('Infinity') >= 0)
                // })
                assert.strictEqual(Infinity, JSON5.parse('Infinity'))
                // assert(warn.calledOnce)
                // warn.restore()
            })

            it('parses NaN with a warning', function () {
                // const warn = sinon.stub(console, 'warn', function (message) {
                //     assert(message.indexOf('NaN') >= 0)
                // })
                assert(isNaN(JSON5.parse('NaN')))
                // assert(warn.calledOnce)
                // warn.restore()
            })
        })

        describe('strings', function () {
            it('parses double quoted strings', function () {
                assert.strictEqual('abc', JSON5.parse('"abc"'))
            })

            it('parses single quoted strings', function () {
                assert.strictEqual('abc', JSON5.parse("'abc'"))
            })

            it('parses nested quotes strings', function () {
                assert.deepStrictEqual(['"', "'"], JSON5.parse('[\'"\',"\'"]'))
            })

            it('parses escaped characters', function () {
                // eslint-disable-next-line no-useless-escape
                assert.strictEqual('\b\f\n\r\t\v\0\x0f\u01FF\n\n\a\'\"', JSON5.parse("'\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF\\\n\\\r\n\\a\\'\\\"'"))
            })

            it('parses line and paragraph separators with a warning', function () {
                const warn = sinon.stub(console, 'warn', function (message) {
                    assert(message.indexOf('not valid ECMAScript') >= 0)
                })
                assert.strictEqual('\u2028\u2029', JSON5.parse("'\u2028\u2029'"))
                assert(warn.calledTwice)
                warn.restore()
            })
        })

        // describe('templates', function () {
        //     it('parses empty templates', function () {
        //         assert.strictEqual('', JSON5.parse('``'))
        //     })

        //     it('parses contents', function () {
        //         assert.strictEqual('abc', JSON5.parse('`abc`'))
        //     })

        //     it('parses dollar signs', function () {
        //         assert.strictEqual('a$b', JSON5.parse('`a$b`'))
        //     })

        //     it('parses escaped characters', function () {
        //         // eslint-disable-next-line no-useless-escape
        //         assert.strictEqual('\b\f\n\r\t\v\0\x0f\u01FF\n\n\a\'\"A', JSON5.parse('`\\b\\f\\n\\r\\t\\v\\0\\x0f\\u01fF\\\n\\\r\n\\a\\\'\\"\\u{000041}`'))
        //     })

        //     it('parses line breaks', function () {
        //         assert.strictEqual('\n\n\n\u2028\u2029', JSON5.parse('`\n\r\r\n\u2028\u2029`'))
        //     })
        // })

        describe('comments', function () {
            it('parses single-line comments', function () {
                assert.deepStrictEqual({}, JSON5.parse('{//comment\n}'))
            })

            it('parses multi-line comments', function () {
                assert.deepStrictEqual({}, JSON5.parse('{/*comment\n* */}'))
            })
        })

        it('parses whitespace', function () {
            assert.deepEqual({}, JSON5.parse('{\t\v\f \u00A0\uFEFF\n\r\u2028\u2029\u2003}'))
        })
    })

    describe('#parse(text, reviver)', function () {
        it('modifies property values', function () {
            assert.deepStrictEqual({a: 'revived', b: 2}, JSON5.parse('{a:1,b:2}', function (k, v) {
                return (k === 'a') ? 'revived' : v
            }))
        })

        it('modifies nested object property values', function () {
            assert.deepStrictEqual({a: {b: 'revived'}}, JSON5.parse('{a:{b:2}}', function (k, v) {
                return (k === 'b') ? 'revived' : v
            }))
        })

        it('deletes property values', function () {
            assert.deepStrictEqual({b: 2}, JSON5.parse('{a:1,b:2}', function (k, v) {
                return (k === 'a') ? undefined : v
            }))
        })

        it('modifies array values', function () {
            assert.deepStrictEqual([0, 'revived', 2], JSON5.parse('[0,1,2]', function (k, v) {
                return (k === '1') ? 'revived' : v
            }))
        })

        it('modifies nested array values', function () {
            assert.deepStrictEqual([0, [1, 2, 'revived']], JSON5.parse('[0,[1,2,3]]', function (k, v) {
                return (k === '2') ? 'revived' : v
            }))
        })

        it('deletes array values', function () {
            // eslint-disable-next-line no-sparse-arrays
            assert.deepStrictEqual([0, , 2], JSON5.parse('[0,1,2]', function (k, v) {
                return (k === '1') ? undefined : v
            }))
        })

        it('modifies the root value', function () {
            assert.deepStrictEqual('revived', JSON5.parse('1', function (k, v) {
                return (k === '') ? 'revived' : v
            }))
        })

        it('sets `this` to the parent value', function () {
            assert.deepStrictEqual({a: {b: 'revived'}}, JSON5.parse('{a:{b:2}}', function (k, v) {
                return (k === 'b' && this.b) ? 'revived' : v
            }))
        })
    })

    describe('#stringify', function () {
        describe('objects', function () {
            it('stringifies empty objects', function () {
                assert.strictEqual('{}', JSON5.stringify({}))
            })

            it('stringifies unquoted property names', function () {
                assert.strictEqual('{a:1}', JSON5.stringify({a: 1}))
            })

            it('stringifies single quoted string property names', function () {
                assert.strictEqual("{'a-b':1}", JSON5.stringify({'a-b': 1}))
            })

            it('stringifies double quoted string property names', function () {
                assert.strictEqual('{"a\'":1}', JSON5.stringify({"a'": 1}))
            })

            it('stringifies special character property names', function () {
                assert.strictEqual('{$_:1,_$:2,a\u200C:3}', JSON5.stringify({$_: 1, _$: 2, 'a\u200C': 3}))
            })

            it('stringifies unicode property names', function () {
                assert.strictEqual('{ùńîċõďë:9}', JSON5.stringify({'ùńîċõďë': 9}))
            })

            it('stringifies escaped property names', function () {
                assert.strictEqual("{'\\b\\f\\n\\r\\t\\v\\0\\x01':1}", JSON5.stringify({'\b\f\n\r\t\v\0\x01': 1}))
            })

            it('stringifies multiple properties', function () {
                assert.strictEqual('{abc:1,def:2}', JSON5.stringify({abc: 1, def: 2}))
            })

            it('stringifies nested objects', function () {
                assert.strictEqual('{a:{b:2}}', JSON5.stringify({a: {b: 2}}))
            })
        })

        describe('arrays', function () {
            it('stringifies empty arrays', function () {
                assert.strictEqual('[]', JSON5.stringify([]))
            })

            it('stringifies array values', function () {
                assert.strictEqual('[1]', JSON5.stringify([1]))
            })

            it('stringifies multiple array values', function () {
                assert.strictEqual('[1,2]', JSON5.stringify([1, 2]))
            })

            it('stringifies nested arrays', function () {
                assert.strictEqual('[1,[2,3]]', JSON5.stringify([1, [2, 3]]))
            })
        })

        it('stringifies nulls', function () {
            assert.strictEqual('null', JSON5.stringify(null))
        })

        it('stringifies true', function () {
            assert.strictEqual('true', JSON5.stringify(true))
        })

        it('stringifies false', function () {
            assert.strictEqual('false', JSON5.stringify(false))
        })

        it('returns undefined for functions', function () {
            assert.strictEqual(undefined, JSON5.stringify(function () {}))
        })

        it('returns null for functions in arrays', function () {
            assert.strictEqual('[null]', JSON5.stringify([function () {}]))
        })

        describe('numbers', function () {
            it('stringifies numbers', function () {
                assert.strictEqual('-1.2', JSON5.stringify(-1.2))
            })

            it('stringifies non-finite numbers', function () {
                assert.strictEqual('[Infinity,-Infinity,NaN]', JSON5.stringify([Infinity, -Infinity, NaN]))
            })
        })

        describe('strings', function () {
            it('stringifies single quoted strings', function () {
                assert.strictEqual("'abc'", JSON5.stringify('abc'))
            })

            it('stringifies double quoted strings', function () {
                assert.strictEqual('"abc\'"', JSON5.stringify("abc'"))
            })

            // it('stringifies template strings', function () {
            //     assert.strictEqual('`abc\'"`', JSON5.stringify('abc\'"'))
            // })

            it('stringifies escaped characters', function () {
                assert.strictEqual("'\\b\\f\\n\\r\\t\\v\\0\\x0f'", JSON5.stringify('\b\f\n\r\t\v\0\x0f'))
            })

            it('stringifies escaped single quotes', function () {
                assert.strictEqual("'\\'\"'", JSON5.stringify('\'"'))
            })

            it('stringifies escaped double quotes', function () {
                assert.strictEqual('"\'\'\\""', JSON5.stringify('\'\'"'))
            })

            // it('stringifies escaped backtick quotes', function () {
            //     assert.strictEqual('`\'\'""\\``', JSON5.stringify('\'\'""`'))
            // })

            it('stringifies escaped line and paragraph separators', function () {
                assert.strictEqual("'\\u2028\\u2029'", JSON5.stringify('\u2028\u2029'))
            })
        })

        it('stringifies using built-in toJSON methods', function () {
            assert.strictEqual("'2016-01-01T00:00:00.000Z'", JSON5.stringify(new Date('2016-01-01T00:00:00.000Z')))
        })

        it('stringifies using user defined toJSON methods', function () {
            /* eslint-disable no-extend-native */
            RegExp.prototype.toJSON = RegExp.prototype.toString
            assert.strictEqual("'/a/'", JSON5.stringify(/a/))
            RegExp.prototype.toJSON = undefined
            /* eslint-enable no-extend-native */
        })

        it('stringifies using user defined toJSON(key) methods', function () {
            let C = function () {}
            C.prototype.toJSON = function (key) { return (key === 'a') ? 1 : 2 }
            assert.strictEqual('{a:1,b:2}', JSON5.stringify({a: new C(), b: new C()}))
        })

        it('stringifies using toJSON5 methods', function () {
            /* eslint-disable no-extend-native */
            RegExp.prototype.toJSON5 = RegExp.prototype.toString
            assert.strictEqual("'/a/'", JSON5.stringify(/a/))
            RegExp.prototype.toJSON5 = undefined
            /* eslint-enable no-extend-native */
        })

        it('stringifies using toJSON5(key) methods', function () {
            let C = function () {}
            C.prototype.toJSON5 = function (key) { return (key === 'a') ? 1 : 2 }
            assert.strictEqual('{a:1,b:2}', JSON5.stringify({a: new C(), b: new C()}))
        })
    })

    describe('#stringify(space)', function () {
        it('does not indent when no value is provided', function () {
            assert.strictEqual('[1]', JSON5.stringify([1]))
        })

        it('does not indent when 0 is provided', function () {
            assert.strictEqual('[1]', JSON5.stringify([1], null, 0))
        })

        it('does not indent when an empty string is provided', function () {
            assert.strictEqual('[1]', JSON5.stringify([1], null, ''))
        })

        it('indents n spaces when a number is provided', function () {
            assert.strictEqual('[\n  1,\n]', JSON5.stringify([1], null, 2))
        })

        it('does not indent more than 10 spaces when a number is provided', function () {
            assert.strictEqual('[\n          1,\n]', JSON5.stringify([1], null, 11))
        })

        it('indents with the string provided', function () {
            assert.strictEqual('[\n\t1,\n]', JSON5.stringify([1], null, '\t'))
        })

        it('does not indent more than 10 characters of the string provided', function () {
            assert.strictEqual('[\n          1,\n]', JSON5.stringify([1], null, '           '))
        })

        it('indents in arrays', function () {
            assert.strictEqual('[\n  1,\n]', JSON5.stringify([1], null, 2))
        })

        it('indents in nested arrays', function () {
            assert.strictEqual('[\n  1,\n  [\n    2,\n  ],\n  3,\n]', JSON5.stringify([1, [2], 3], null, 2))
        })

        it('indents in objects', function () {
            assert.strictEqual('{\n  a: 1,\n}', JSON5.stringify({a: 1}, null, 2))
        })

        it('indents in nested objects', function () {
            assert.strictEqual('{\n  a: {\n    b: 2,\n  },\n}', JSON5.stringify({a: {b: 2}}, null, 2))
        })
    })

    describe('#stringify(replacer)', function () {
        it('filters keys when an array is provided', function () {
            assert.strictEqual("{a:1,'0':3}", JSON5.stringify({a: 1, b: 2, 0: 3}, ['a', 0]))
        })

        it('replaces values when a function is provided', function () {
            assert.strictEqual('{a:2,b:2}', JSON5.stringify({a: 1, b: 2}, function (key, value) {
                return (key === 'a') ? 2 : value
            }))
        })
    })
})

describe('require(*.json5)', function () {
    it('parses a JSON5 document', function () {
        require('../lib/register')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    })
})
