/* eslint-disable quotes,dot-notation,no-new-wrappers */
// noinspection JSUnresolvedReference,JSPrimitiveTypeWrapperUsage

import {assert} from 'chai'

const JSON5 = (await import('../lib/index.js')).default

describe('stringify', () => {
    describe('objects', () => {
        it('stringifies empty objects', () => {
            assert.strictEqual(JSON5.stringify({ }), '{}')
        })

        it('stringifies unquoted property names', () => {
            assert.strictEqual(JSON5.stringify({a: 1}), '{a:1}')
        })

        it('stringifies single quoted string property names', () => {
            assert.strictEqual(JSON5.stringify({'a-b': 1}), "{'a-b':1}")
        })

        it('stringifies double quoted string property names', () => {
            assert.strictEqual(JSON5.stringify({"a'": 1}), `{"a'":1}`)
        })

        it('stringifies empty string property names', () => {
            assert.strictEqual(JSON5.stringify({'': 1}), "{'':1}")
        })

        it('stringifies special character property names', () => {
            assert.strictEqual(JSON5.stringify({$_: 1, _$: 2, a\u200C: 3}), '{$_:1,_$:2,a\u200C:3}')
        })

        it('stringifies unicode property names', () => {
            // noinspection NonAsciiCharacters
            assert.strictEqual(JSON5.stringify({'ùńîċõďë': 9, 𠀋: 0}), '{ùńîċõďë:9,𠀋:0}') // eslint-disable-line quote-props
        })

        it('stringifies escaped property names', () => {
            assert.strictEqual(JSON5.stringify({'\\\b\f\n\r\t\v\0\x01': 1}), "{'\\\\\\b\\f\\n\\r\\t\\v\\0\\x01':1}")
        })

        it('stringifies escaped null character property names', () => {
            assert.strictEqual(JSON5.stringify({'\0\x001': 1}), "{'\\0\\x001':1}")
        })

        it('stringifies multiple properties', () => {
            assert.strictEqual(JSON5.stringify({abc: 1, def: 2}), '{abc:1,def:2}')
        })

        it('stringifies nested objects', () => {
            assert.strictEqual(JSON5.stringify({a: {b: 2}}), '{a:{b:2}}')
        })
    })

    describe('arrays', () => {
        it('stringifies empty arrays', () => {
            assert.strictEqual(JSON5.stringify([]), '[]')
        })

        it('stringifies array values', () => {
            assert.strictEqual(JSON5.stringify([1]), '[1]')
        })

        it('stringifies multiple array values', () => {
            assert.strictEqual(JSON5.stringify([1, 2]), '[1,2]')
        })

        it('stringifies nested arrays', () => {
            assert.strictEqual(JSON5.stringify([1, [2, 3]]), '[1,[2,3]]')
        })
    })

    it('stringifies nulls', () => {
        assert.strictEqual(JSON5.stringify(null), 'null')
    })

    it('returns undefined for functions', () => {
        assert.strictEqual(JSON5.stringify(() => {}), undefined)
    })

    it('ignores function properties', () => {
        assert.strictEqual(JSON5.stringify({a () {}}), '{}')
    })

    it('returns null for functions in arrays', () => {
        assert.strictEqual(JSON5.stringify([() => {}]), '[null]')
    })

    describe('Booleans', () => {
        it('stringifies true', () => {
            assert.strictEqual(JSON5.stringify(true), 'true')
        })

        it('stringifies false', () => {
            assert.strictEqual(JSON5.stringify(false), 'false')
        })

        it('stringifies true Boolean objects', () => {
            // eslint-disable-next-line no-new-wrappers
            assert.strictEqual(JSON5.stringify(new Boolean(true)), 'true')
        })

        it('stringifies false Boolean objects', () => {
            // eslint-disable-next-line no-new-wrappers
            assert.strictEqual(JSON5.stringify(new Boolean(false)), 'false')
        })
    })

    describe('numbers', () => {
        it('stringifies numbers', () => {
            assert.strictEqual(JSON5.stringify(-1.2), '-1.2')
        })

        it('doesn\'t create double negative sign', () => {
            assert.strictEqual(JSON5.stringify(-0.1), '-0.1')
        })

        it('stringifies non-finite numbers', () => {
            assert.strictEqual(JSON5.stringify([Infinity, -Infinity, NaN]), '[Infinity,-Infinity,NaN]')
        })

        it('stringifies Number objects', () => {
            // eslint-disable-next-line no-new-wrappers
            assert.strictEqual(JSON5.stringify(new Number(-1.2)), '-1.2')
        })
    })

    describe('strings', () => {
        it('stringifies single quoted strings', () => {
            assert.strictEqual(JSON5.stringify('ab😀c'), "'ab😀c'")
        })

        it('stringifies double quoted strings', () => {
            assert.strictEqual(JSON5.stringify("abc'"), `"abc'"`)
        })

        it('stringifies escaped characters', () => {
            assert.strictEqual(JSON5.stringify('\\\b\f\n\r\t\v\0\x0f'), "'\\\\\\b\\f\\n\\r\\t\\v\\0\\x0f'")
        })

        it('stringifies escaped null characters', () => {
            assert.strictEqual(JSON5.stringify('\0\x001'), "'\\0\\x001'")
        })

        it('stringifies escaped single quotes', () => {
            assert.strictEqual(JSON5.stringify(`\`'"`), '\'`\\\'"\'')
        })

        it('stringifies escaped double quotes', () => {
            assert.strictEqual(JSON5.stringify(`\`''"`), "\"`''\\\"\"")
        })

        it('stringifies escaped line and paragraph separators', () => {
            assert.strictEqual(JSON5.stringify('\u2028\u2029'), "'\\u2028\\u2029'")
        })

        it('stringifies String objects', () => {
            // noinspection JSCheckFunctionSignatures
            assert.strictEqual(JSON5.stringify(new String('abc')), "'abc'") // eslint-disable-line no-new-wrappers
        })
    })

    it('stringifies using built-in toJSON methods', () => {
        assert.strictEqual(JSON5.stringify(new Date('2016-01-01T00:00:00.000Z')),
            "'2016-01-01T00:00:00.000Z'")
    })

    it('stringifies using user defined toJSON methods', () => {
        function C () { }
        Object.assign(C.prototype, {toJSON () { return {a: 1, b: 2} }})
        assert.strictEqual(JSON5.stringify(new C()), '{a:1,b:2}')
    })

    it('stringifies using user defined toJSON(key) methods', () => {
        function C () { }
        Object.assign(C.prototype, {toJSON (key) { return (key === 'a') ? 1 : 2 }})
        assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
    })

    it('stringifies using user defined toJSON5 methods', () => {
        function C () {}
        Object.assign(C.prototype, {toJSON5 () { return {a: 1, b: 2} }})
        assert.strictEqual(JSON5.stringify(new C()), '{a:1,b:2}')
    })

    it('stringifies using toJSON5(key) methods', () => {
        function C () {}
        Object.assign(C.prototype, {toJSON5 (key) { return (key === 'a') ? 1 : 2 }})
        assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
    })

    it('calls toJSON5 instead of toJSON if both are defined', () => {
        function C () {}
        Object.assign(C.prototype, {
            toJSON () { return {a: 1, b: 2} },
            toJSON5 () { return {a: 2, b: 2} },
        })
        assert.strictEqual(JSON5.stringify(new C()), '{a:2,b:2}')
    })

    it('throws on circular objects', () => {
        const a = {}
        a.a = a
        assert.throws(() => { JSON5.stringify(a) }, TypeError, 'Converting circular structure to JSON5')
    })

    it('throws on circular arrays', () => {
        const a = []
        a[0] = a
        assert.throws(() => { JSON5.stringify(a) }, TypeError, 'Converting circular structure to JSON5')
    })

    describe('#stringify(value, null, space)', () => {
        it('does not indent when no value is provided', () => {
            assert.strictEqual(JSON5.stringify([1]), '[1]')
        })

        it('does not indent when 0 is provided', () => {
            assert.strictEqual(JSON5.stringify([1], null, 0), '[1]')
        })

        it('does not indent when an empty string is provided', () => {
            assert.strictEqual(JSON5.stringify([1], null, ''), '[1]')
        })

        it('indents n spaces when a number is provided', () => {
            assert.strictEqual(JSON5.stringify([1], null, 2), '[\n  1,\n]')
        })

        it('does not indent more than 10 spaces when a number is provided', () => {
            assert.strictEqual(JSON5.stringify([1], null, 11), '[\n          1,\n]')
        })

        it('indents with the string provided', () => {
            assert.strictEqual(JSON5.stringify([1], null, '\t'), '[\n\t1,\n]')
        })

        it('does not indent more than 10 characters of the string provided', () => {
            assert.strictEqual(JSON5.stringify([1], null, '           '), '[\n          1,\n]')
        })

        it('indents in arrays', () => {
            assert.strictEqual(JSON5.stringify([1], null, 2), '[\n  1,\n]')
        })

        it('indents in nested arrays', () => {
            assert.strictEqual(JSON5.stringify([1, [2], 3], null, 2), '[\n  1,\n  [\n    2,\n  ],\n  3,\n]')
        })

        it('indents in objects', () => {
            assert.strictEqual(JSON5.stringify({a: 1}, null, 2), '{\n  a: 1,\n}')
        })

        it('indents in nested objects', () => {
            assert.strictEqual(JSON5.stringify({a: {b: 2}}, null, 2), '{\n  a: {\n    b: 2,\n  },\n}')
        })

        it('accepts Number objects', () => {
            // eslint-disable-next-line no-new-wrappers
            assert.strictEqual(JSON5.stringify([1], null, new Number(2)), '[\n  1,\n]')
        })

        it('accepts String objects', () => {
            // noinspection JSCheckFunctionSignatures
            assert.strictEqual(JSON5.stringify([1], null, new String('\t')), '[\n\t1,\n]') // eslint-disable-line no-new-wrappers
        })
    })

    describe('#stringify(value, replacer)', () => {
        it('filters keys when an array is provided', () => {
            assert.strictEqual(JSON5.stringify({a: 1, b: 2, 3: 3}, ['a', 3]), "{a:1,'3':3}")
        })

        it('only filters string and number keys when an array is provided', () => {
            assert.strictEqual(JSON5.stringify({a: 1, b: 2, 3: 3, false: 4}, ['a', 3, false]), "{a:1,'3':3}")
        })

        it('accepts String and Number objects when an array is provided', () => {
            // noinspection JSCheckFunctionSignatures
            assert.strictEqual(JSON5.stringify({a: 1, b: 2, 3: 3}, [new String('a'), new Number(3)]), "{a:1,'3':3}") // eslint-disable-line no-new-wrappers
        })

        it('replaces values when a function is provided', () => {
            assert.strictEqual(
                JSON5.stringify({a: 1, b: 2}, (key, value) => (key === 'a') ? 2 : value),
                '{a:2,b:2}',
            )
        })

        it('sets `this` to the parent value', () => {
            assert.strictEqual(
                JSON5.stringify({a: {b: 1}}, function (k, v) { return (k === 'b' && this.b) ? 2 : v }),
                '{a:{b:2}}')
        })

        it('deletes object values when a replacer returns `undefined`', () => {
            assert.strictEqual(
                JSON5.stringify({a: 1, b: 2}, (key, value) => (key === 'b') ? undefined : value),
                '{a:1}',
            )
        })

        it('can shrink array by manipulating holder', () => {
            assert.strictEqual(
                JSON5.stringify([1, 77, 3, 44], function (key, value) {
                    if (key > 1) {
                        --this.length
                        return undefined
                    } else {
                        return value
                    }
                }),
                '[1,77]',
            )

            assert.strictEqual(
                JSON5.stringify([1, 2, 3, 4, 5], function (key, value) {
                    if (key === '2') {
                        this.splice(parseInt(key), 1)
                        return undefined
                    } else {
                        return value
                    }
                }),
                '[1,2,4,5]',
            )

            assert.strictEqual(
                JSON5.stringify([1, 2, 3, 4, 5], (key, value) => key === '2' ? undefined : value),
                '[1,2,null,4,5]',
            )
        })

        it('does not shrink array when not manipulating holder', () => {
            assert.strictEqual(
                JSON5.stringify([1, 77, 3, 44], function (key, value) {
                    if (key > 1) {
                        return undefined
                    } else {
                        return value
                    }
                }),
                '[1,77,null,null]',
            )
        })

        it('is called after toJSON', () => {
            function C () {}
            Object.assign(C.prototype, {toJSON () { return {a: 1, b: 2} }})
            assert.strictEqual(
                JSON5.stringify(new C(), (key, value) => (key === 'a') ? 2 : value),
                '{a:2,b:2}',
            )
        })

        it('does not affect space when calls are nested', () => {
            assert.strictEqual(
                JSON5.stringify({a: 1}, (key, value) => {
                    JSON5.stringify({}, null, 4)
                    return value
                }, 2),
                '{\n  a: 1,\n}',
            )
        })
    })

    describe('#stringify(value, options)', () => {
        it('accepts replacer as an option', () => {
            assert.strictEqual(JSON5.stringify({a: 1, b: 2, 3: 3}, {replacer: ['a', 3]}), "{a:1,'3':3}")
        })

        it('accepts space as an option', () => {
            assert.strictEqual(JSON5.stringify([1], {space: 2}), '[\n  1,\n]')
        })
    })

    describe('#stringify(value, {quote})', () => {
        it('uses double quotes if provided', () => {
            assert.strictEqual(JSON5.stringify({'a"': '1"'}, {quote: '"'}), '{"a\\"":"1\\""}')
        })

        it('uses single quotes if provided', () => {
            assert.strictEqual(JSON5.stringify({"a'": "1'"}, {quote: "'"}), "{'a\\'':'1\\''}")
        })
    })
})
