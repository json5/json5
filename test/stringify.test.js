import {test} from 'node:test'
import assert from 'node:assert'
import * as JSON5 from '../lib/index.js'

test('stringify: stringifies empty objects', () => {
    assert.strictEqual(JSON5.stringify({}), '{}')
})

test('stringify: stringifies unquoted property names', () => {
    assert.strictEqual(JSON5.stringify({a: 1}), '{a:1}')
})

test('stringify: stringifies single quoted string property names', () => {
    assert.strictEqual(JSON5.stringify({'a-b': 1}), "{'a-b':1}")
})

test('stringify: stringifies double quoted string property names', () => {
    assert.strictEqual(JSON5.stringify({"a'": 1}), `{"a'":1}`)
})

test('stringify: stringifies empty string property names', () => {
    assert.strictEqual(JSON5.stringify({'': 1}), "{'':1}")
})

test('stringify: stringifies special character property names', () => {
    assert.strictEqual(
        JSON5.stringify({$_: 1, _$: 2, 'a\u200C': 3}),
        '{$_:1,_$:2,a\u200C:3}'
    )
})

test('stringify: stringifies unicode property names', () => {
    assert.strictEqual(JSON5.stringify({'ùńîċõďë': 9}), '{ùńîċõďë:9}')
})

test('stringify: stringifies property names with characters outside the BMP', () => {
    assert.strictEqual(
        JSON5.stringify({'\u{10000}\u{1D7CE}': 1, 'a\u{10000}b': 2}),
        '{\u{10000}\u{1D7CE}:1,a\u{10000}b:2}'
    )
})

test('stringify: stringifies escaped property names', () => {
    assert.strictEqual(
        JSON5.stringify({'\\\b\f\n\r\t\v\0\x01': 1}),
        "{'\\\\\\b\\f\\n\\r\\t\\v\\0\\x01':1}"
    )
})

test('stringify: stringifies escaped null character property names', () => {
    assert.strictEqual(
        JSON5.stringify({'\0\x001': 1}),
        "{'\\0\\x001':1}"
    )
})

test('stringify: stringifies multiple properties', () => {
    assert.strictEqual(JSON5.stringify({abc: 1, def: 2}), '{abc:1,def:2}')
})

test('stringify: stringifies nested objects', () => {
    assert.strictEqual(JSON5.stringify({a: {b: 2}}), '{a:{b:2}}')
})

test('stringify: stringifies empty arrays', () => {
    assert.strictEqual(JSON5.stringify([]), '[]')
})

test('stringify: stringifies array values', () => {
    assert.strictEqual(JSON5.stringify([1]), '[1]')
})

test('stringify: stringifies multiple array values', () => {
    assert.strictEqual(JSON5.stringify([1, 2]), '[1,2]')
})

test('stringify: stringifies nested arrays', () => {
    assert.strictEqual(JSON5.stringify([1, [2, 3]]), '[1,[2,3]]')
})

test('stringify: stringifies nulls', () => {
    assert.strictEqual(JSON5.stringify(null), 'null')
})

test('stringify: returns undefined for functions', () => {
    assert.strictEqual(JSON5.stringify(() => {}), undefined)
})

test('stringify: ignores function properties', () => {
    assert.strictEqual(JSON5.stringify({a () {}}), '{}')
})

test('stringify: returns null for functions in arrays', () => {
    assert.strictEqual(JSON5.stringify([() => {}]), '[null]')
})

test('stringify: stringifies true', () => {
    assert.strictEqual(JSON5.stringify(true), 'true')
})

test('stringify: stringifies false', () => {
    assert.strictEqual(JSON5.stringify(false), 'false')
})

test('stringify: stringifies true Boolean objects', () => {
    assert.strictEqual(JSON5.stringify(new Boolean(true)), 'true')
})

test('stringify: stringifies false Boolean objects', () => {
    assert.strictEqual(JSON5.stringify(new Boolean(false)), 'false')
})

test('stringify: uses the stored Boolean value when valueOf is overridden', () => {
    for (const primitive of [true, false]) {
        const value = new Boolean(primitive)
        value.valueOf = () => !primitive
        assert.strictEqual(JSON5.stringify(value), String(primitive))
    }
})

test('stringify: stringifies numbers', () => {
    assert.strictEqual(JSON5.stringify(-1.2), '-1.2')
})

test('stringify: throws on bigints', () => {
    assert.throws(() => JSON5.stringify(BigInt(1)), /BigInt/)
})

test('stringify: throws on BigInt objects', () => {
    assert.throws(() => JSON5.stringify(Object(BigInt(1))), /BigInt/)
})

test('stringify: uses the stored BigInt value when valueOf is overridden', () => {
    const value = Object(BigInt(1))
    // Make `valueOf` return a number instead of a bigint
    value.valueOf = () => 1
    assert.throws(() => JSON5.stringify(value), /BigInt/)
})

test('stringify: stringifies non-finite numbers', () => {
    assert.strictEqual(JSON5.stringify([Infinity, -Infinity, NaN]), '[Infinity,-Infinity,NaN]')
})

test('stringify: stringifies Number objects', () => {
    assert.strictEqual(JSON5.stringify(new Number(-1.2)), '-1.2')
})

test('stringify: stringifies single quoted strings', () => {
    assert.strictEqual(JSON5.stringify('abc'), "'abc'")
})

test('stringify: stringifies double quoted strings', () => {
    assert.strictEqual(JSON5.stringify("abc'"), `"abc'"`)
})

test('stringify: stringifies escaped characters', () => {
    assert.strictEqual(
        JSON5.stringify('\\\b\f\n\r\t\v\0\x0f'),
        "'\\\\\\b\\f\\n\\r\\t\\v\\0\\x0f'"
    )
})

test('stringify: stringifies escaped null characters', () => {
    assert.strictEqual(JSON5.stringify('\0\x001'), "'\\0\\x001'")
})

test('stringify: stringifies escaped single quotes', () => {
    assert.strictEqual(JSON5.stringify(`'"`), `'\\'"'`)
})

test('stringify: stringifies escaped double quotes', () => {
    assert.strictEqual(JSON5.stringify(`''"`), `"''\\""`)
})

test('stringify: stringifies escaped line and paragraph separators', () => {
    assert.strictEqual(JSON5.stringify('\u2028\u2029'), "'\\u2028\\u2029'")
})

test('stringify: stringifies escaped lone surrogates', () => {
    assert.strictEqual(JSON5.stringify('\uD800'), "'\\ud800'")
    assert.strictEqual(JSON5.stringify('\uDEAD'), "'\\udead'")
    assert.strictEqual(JSON5.stringify('a\uDBFFb\uDC00c'), "'a\\udbffb\\udc00c'")
    assert.strictEqual(JSON5.stringify('\uDC00\uD800'), "'\\udc00\\ud800'")
    assert.strictEqual(JSON5.stringify('😀\uD83D'), "'😀\\ud83d'")
})

test('stringify: stringifies surrogate pairs', () => {
    assert.strictEqual(JSON5.stringify('😀'), "'😀'")
})

test('stringify: stringifies escaped lone surrogate property names', () => {
    assert.strictEqual(JSON5.stringify({'\uDEAD': 1}), "{'\\udead':1}")
})

test('stringify: stringifies String objects', () => {
    assert.strictEqual(JSON5.stringify(new String('abc')), "'abc'")
})

test('stringify: stringifies using built-in toJSON methods', () => {
    assert.strictEqual(
        JSON5.stringify(new Date('2016-01-01T00:00:00.000Z')),
        "'2016-01-01T00:00:00.000Z'"
    )
})

test('stringify: stringifies using user defined toJSON methods', () => {
    function C () {}
    Object.assign(C.prototype, {toJSON () { return {a: 1, b: 2} }})
    assert.strictEqual(JSON5.stringify(new C()), '{a:1,b:2}')
})

test('stringify: stringifies using user defined toJSON(key) methods', () => {
    function C () {}
    Object.assign(C.prototype, {toJSON (key) { return (key === 'a') ? 1 : 2 }})
    assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
})

test('stringify: stringifies using toJSON5 methods', () => {
    function C () {}
    Object.assign(C.prototype, {toJSON5 () { return {a: 1, b: 2} }})
    assert.strictEqual(JSON5.stringify(new C()), '{a:1,b:2}')
})

test('stringify: stringifies using toJSON5(key) methods', () => {
    function C () {}
    Object.assign(C.prototype, {toJSON5 (key) { return (key === 'a') ? 1 : 2 }})
    assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
})

test('stringify: calls toJSON5 instead of toJSON if both are defined', () => {
    function C () {}
    Object.assign(C.prototype, {
        toJSON () { return {a: 1, b: 2} },
        toJSON5 () { return {a: 2, b: 2} },
    })
    assert.strictEqual(JSON5.stringify(new C()), '{a:2,b:2}')
})

test('stringify: throws on circular objects', () => {
    let a = {}
    a.a = a
    assert.throws(() => { JSON5.stringify(a) }, TypeError, 'Converting circular structure to JSON5')
})

test('stringify: throws on circular arrays', () => {
    let a = []
    a[0] = a
    assert.throws(() => { JSON5.stringify(a) }, TypeError, 'Converting circular structure to JSON5')
})

test('stringify(value, null, space): does not indent when no value is provided', () => {
    assert.strictEqual(JSON5.stringify([1]), '[1]')
})

test('stringify(value, null, space): does not indent when 0 is provided', () => {
    assert.strictEqual(JSON5.stringify([1], null, 0), '[1]')
})

test('stringify(value, null, space): does not indent when an empty string is provided', () => {
    assert.strictEqual(JSON5.stringify([1], null, ''), '[1]')
})

test('stringify(value, null, space): indents n spaces when a number is provided', () => {
    assert.strictEqual(JSON5.stringify([1], null, 2), '[\n  1,\n]')
})

test('stringify(value, null, space): does not indent more than 10 spaces when a number is provided', () => {
    assert.strictEqual(JSON5.stringify([1], null, 11), '[\n          1,\n]')
})

test('stringify(value, null, space): indents with the string provided', () => {
    assert.strictEqual(JSON5.stringify([1], null, '\t'), '[\n\t1,\n]')
})

test('stringify(value, null, space): does not indent more than 10 characters of the string provided', () => {
    assert.strictEqual(JSON5.stringify([1], null, '           '), '[\n          1,\n]')
})

test('stringify(value, null, space): indents in arrays', () => {
    assert.strictEqual(JSON5.stringify([1], null, 2), '[\n  1,\n]')
})

test('stringify(value, null, space): indents in nested arrays', () => {
    assert.strictEqual(
        JSON5.stringify([1, [2], 3], null, 2),
        '[\n  1,\n  [\n    2,\n  ],\n  3,\n]'
    )
})

test('stringify(value, null, space): indents in objects', () => {
    assert.strictEqual(JSON5.stringify({a: 1}, null, 2), '{\n  a: 1,\n}')
})

test('stringify(value, null, space): indents in nested objects', () => {
    assert.strictEqual(
        JSON5.stringify({a: {b: 2}}, null, 2),
        '{\n  a: {\n    b: 2,\n  },\n}'
    )
})

test('stringify(value, null, space): accepts Number objects', () => {
    assert.strictEqual(JSON5.stringify([1], null, new Number(2)), '[\n  1,\n]')
})

test('stringify(value, null, space): accepts String objects', () => {
    assert.strictEqual(JSON5.stringify([1], null, new String('\t')), '[\n\t1,\n]')
})

test('stringify(value, replacer): filters keys when an array is provided', () => {
    assert.strictEqual(
        JSON5.stringify({a: 1, b: 2, 3: 3}, ['a', 3]),
        "{a:1,'3':3}"
    )
})

test('stringify(value, replacer): only filters string and number keys when an array is provided', () => {
    assert.strictEqual(
        JSON5.stringify({a: 1, b: 2, 3: 3, false: 4}, ['a', 3, false]),
        "{a:1,'3':3}"
    )
})

test('stringify(value, replacer): accepts String and Number objects when an array is provided', () => {
    assert.strictEqual(
        JSON5.stringify({a: 1, b: 2, 3: 3}, [new String('a'), new Number(3)]),
        "{a:1,'3':3}"
    )
})

test('stringify(value, replacer): reads replacer arrays by index, not with the iterator', () => {
    const keys = ['a']
    keys[Symbol.iterator] = function * () { yield 'b' }
    assert.strictEqual(JSON5.stringify({a: 1, b: 2}, keys), '{a:1}')
})

test('stringify(value, replacer): reads the replacer array length once', () => {
    const results = [JSON.stringify, JSON5.stringify].map(stringify => {
        const keys = ['a', 'b']
        Object.defineProperty(keys, 0, {
            get () {
                keys[1] = 'c'
                keys.push('b')
                return 'a'
            },
        })
        return JSON5.parse(stringify({a: 1, b: 2, c: 3}, keys))
    })
    assert.deepStrictEqual(results[1], results[0])
})

test('stringify(value, replacer): converts a proxy array length like JSON.stringify', () => {
    for (const length of [undefined, NaN, -2, 1.9, '2.9', {valueOf () { return 2 }}]) {
        const results = [JSON.stringify, JSON5.stringify].map(stringify => {
            const reads = []
            const keys = new Proxy(['a', 'b', 'c'], {
                get (target, key, receiver) {
                    reads.push(String(key))
                    return key === 'length' ? length : Reflect.get(target, key, receiver)
                },
            })
            return {value: JSON5.parse(stringify({a: 1, b: 2, c: 3}, keys)), reads}
        })
        assert.deepStrictEqual(results[1], results[0])
    }

    for (const length of [1n, Symbol('length')]) {
        const keys = new Proxy(['a'], {
            get (target, key, receiver) {
                return key === 'length' ? length : Reflect.get(target, key, receiver)
            },
        })
        assert.throws(() => JSON5.stringify({a: 1}, keys), TypeError)
    }
})

test('stringify(value, replacer): replaces values when a function is provided', () => {
    assert.strictEqual(
        JSON5.stringify({a: 1, b: 2}, (key, value) => (key === 'a') ? 2 : value),
        '{a:2,b:2}'
    )
})

test('stringify(value, replacer): ignores array elements appended by the replacer', () => {
    assert.strictEqual(
        JSON5.stringify([1], function (key, value) { if (key === '0') { this.push(2) } return value }),
        '[1]'
    )
})

test('stringify(value, replacer): serializes removed array elements as null when the replacer truncates the array', () => {
    assert.strictEqual(
        JSON5.stringify([1, 2], function (key, value) { if (key === '0') { this.length = 1 } return value }),
        '[1,null]'
    )
})

test('stringify(value, replacer): sets `this` to the parent value', () => {
    assert.strictEqual(
        JSON5.stringify({a: {b: 1}}, function (k, v) { return (k === 'b' && this.b) ? 2 : v }),
        '{a:{b:2}}'
    )
})

test('stringify(value, replacer): is called after toJSON', () => {
    function C () {}
    Object.assign(C.prototype, {toJSON () { return {a: 1, b: 2} }})
    assert.strictEqual(
        JSON5.stringify(new C(), (key, value) => (key === 'a') ? 2 : value),
        '{a:2,b:2}'
    )
})

test('stringify(value, replacer): is called after toJSON5', () => {
    function C () {}
    Object.assign(C.prototype, {toJSON5 () { return {a: 1, b: 2} }})
    assert.strictEqual(
        JSON5.stringify(new C(), (key, value) => (key === 'a') ? 2 : value),
        '{a:2,b:2}'
    )
})

test('stringify(value, replacer): does not affect space when calls are nested', () => {
    assert.strictEqual(
        JSON5.stringify(
            {a: 1},
            (_key, value) => {
                JSON5.stringify({}, null, 4)
                return value
            },
            2
        ),
        '{\n  a: 1,\n}'
    )
})

test('stringify(value, options): accepts replacer as an option', () => {
    assert.strictEqual(
        JSON5.stringify({a: 1, b: 2, 3: 3}, {replacer: ['a', 3]}),
        "{a:1,'3':3}"
    )
})

test('stringify(value, options): accepts space as an option', () => {
    assert.strictEqual(JSON5.stringify([1], {space: 2}), '[\n  1,\n]')
})

test('stringify(value, {quote}): uses double quotes if provided', () => {
    assert.strictEqual(
        JSON5.stringify({'a"': '1"'}, {quote: '"'}),
        '{"a\\"":"1\\""}'
    )
})

test('stringify(value, {quote}): uses single quotes if provided', () => {
    assert.strictEqual(
        JSON5.stringify({"a'": "1'"}, {quote: "'"}),
        "{'a\\'':'1\\''}"
    )
})

test('stringify(value, {quote}): throws on invalid quote characters', () => {
    assert.throws(() => JSON5.stringify('a', {quote: '`'}), TypeError)
    assert.throws(() => JSON5.stringify('a', {quote: '(a+)+$'}), TypeError)
})

test('stringify: reads each serialization hook once with its receiver and key', () => {
    for (const method of ['toJSON', 'toJSON5']) {
        let reads = 0
        const value = {
            get [method] () {
                reads++
                return Object.assign(function (key) {
                    assert.strictEqual(this, value)
                    return key
                }, {call: undefined})
            },
        }
        assert.strictEqual(JSON5.stringify({item: value}), "{item:'item'}")
        assert.strictEqual(reads, 1)
    }
})
