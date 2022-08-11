const assert = require('assert')
const JSON5 = require('../lib')

const t = require('tap')

t.test('JSON5', t => {
    t.test('#stringify', t => {
        t.test('objects', t => {
            t.strictSame(
                JSON5.stringify({}),
                '{}',
                'stringifies empty objects'
            )

            t.strictSame(
                JSON5.stringify({a: 1}),
                '{a:1}',
                'stringifies unquoted property names'
            )

            t.strictSame(
                JSON5.stringify({'a-b': 1}),
                "{'a-b':1}",
                'stringifies single quoted string property names'
            )

            t.strictSame(
                JSON5.stringify({"a'": 1}),
                `{"a'":1}`,
                'stringifies double quoted string property names'
            )

            t.strictSame(
                JSON5.stringify({'': 1}),
                "{'':1}",
                'stringifies empty string property names'
            )

            t.strictSame(
                JSON5.stringify({$_: 1, _$: 2, 'a\u200C': 3}),
                '{$_:1,_$:2,a\u200C:3}',
                'stringifies special character property names'
            )

            t.strictSame(
                JSON5.stringify({'ùńîċõďë': 9}),
                '{ùńîċõďë:9}',
                'stringifies unicode property names'
            )

            t.strictSame(
                JSON5.stringify({'\\\b\f\n\r\t\v\0\x01': 1}),
                "{'\\\\\\b\\f\\n\\r\\t\\v\\0\\x01':1}",
                'stringifies escaped property names'
            )

            t.strictSame(
                JSON5.stringify({'\0\x001': 1}),
                "{'\\0\\x001':1}",
                'stringifies escaped null character property names'
            )

            t.strictSame(
                JSON5.stringify({abc: 1, def: 2}),
                '{abc:1,def:2}',
                'stringifies multiple properties'
            )

            t.strictSame(
                JSON5.stringify({a: {b: 2}}),
                '{a:{b:2}}',
                'stringifies nested objects'
            )

            t.end()
        })

        t.test('arrays', t => {
            t.strictSame(
                JSON5.stringify([]),
                '[]',
                'stringifies empty arrays'
            )

            t.strictSame(
                JSON5.stringify([1]),
                '[1]',
                'stringifies array values'
            )

            t.strictSame(
                JSON5.stringify([1, 2]),
                '[1,2]',
                'stringifies multiple array values'
            )

            t.strictSame(
                JSON5.stringify([1, [2, 3]]),
                '[1,[2,3]]',
                'stringifies nested arrays'
            )

            t.end()
        })

        t.strictSame(
            JSON5.stringify(null),
            'null',
            'stringifies nulls'
        )

        t.strictSame(
            JSON5.stringify(() => {}),
            undefined,
            'returns undefined for functions'
        )

        t.strictSame(
            JSON5.stringify({a () {}}),
            '{}',
            'ignores function properties'
        )

        t.strictSame(
            JSON5.stringify([() => {}]),
            '[null]',
            'returns null for functions in arrays'
        )

        t.test('Booleans', t => {
            t.strictSame(
                JSON5.stringify(true),
                'true',
                'stringifies true'
            )

            t.strictSame(
                JSON5.stringify(false),
                'false',
                'stringifies false'
            )

            t.strictSame(
                // eslint-disable-next-line no-new-wrappers
                JSON5.stringify(new Boolean(true)),
                'true',
                'stringifies true Boolean objects'
            )

            t.strictSame(
                // eslint-disable-next-line no-new-wrappers
                JSON5.stringify(new Boolean(false)),
                'false',
                'stringifies false Boolean objects'
            )

            t.end()
        })

        t.test('numbers', t => {
            t.strictSame(
                JSON5.stringify(-1.2),
                '-1.2',
                'stringifies numbers'
            )

            t.strictSame(
                JSON5.stringify([Infinity, -Infinity, NaN]),
                '[Infinity,-Infinity,NaN]',
                'stringifies non-finite numbers'
            )

            t.strictSame(
                // eslint-disable-next-line no-new-wrappers
                JSON5.stringify(new Number(-1.2)),
                '-1.2',
                'stringifies Number objects'
            )

            t.end()
        })

        t.test('strings', t => {
            t.strictSame(
                JSON5.stringify('abc'),
                "'abc'",
                'stringifies single quoted strings'
            )

            t.strictSame(
                JSON5.stringify("abc'"),
                `"abc'"`,
                'stringifies double quoted strings'
            )

            t.strictSame(
                JSON5.stringify('\\\b\f\n\r\t\v\0\x0f'),
                "'\\\\\\b\\f\\n\\r\\t\\v\\0\\x0f'",
                'stringifies escaped characters'
            )

            t.strictSame(
                JSON5.stringify('\0\x001'),
                "'\\0\\x001'",
                'stringifies escaped null characters'
            )

            t.strictSame(
                JSON5.stringify(`'"`),
                `'\\'"'`,
                'stringifies escaped single quotes'
            )

            t.strictSame(
                JSON5.stringify(`''"`),
                `"''\\""`,
                'stringifies escaped double quotes'
            )

            t.strictSame(
                JSON5.stringify('\u2028\u2029'),
                "'\\u2028\\u2029'",
                'stringifies escaped line and paragraph separators'
            )

            t.strictSame(
                // eslint-disable-next-line no-new-wrappers
                JSON5.stringify(new String('abc')),
                "'abc'",
                'stringifies String objects'
            )

            t.end()
        })

        t.strictSame(
            JSON5.stringify(new Date('2016-01-01T00:00:00.000Z')),
            "'2016-01-01T00:00:00.000Z'",
            'stringifies using built-in toJSON methods'
        )

        t.test('stringifies using user defined toJSON methods', t => {
            function C () {}
            Object.assign(C.prototype, {toJSON () { return {a: 1, b: 2} }})
            assert.strictEqual(JSON5.stringify(new C()), '{a:1,b:2}')
            t.end()
        })

        t.test('stringifies using user defined toJSON(key) methods', t => {
            function C () {}
            Object.assign(C.prototype, {toJSON (key) { return (key === 'a') ? 1 : 2 }})
            assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
            t.end()
        })

        t.test('stringifies using toJSON5 methods', t => {
            function C () {}
            Object.assign(C.prototype, {toJSON5 () { return {a: 1, b: 2} }})
            assert.strictEqual(JSON5.stringify(new C()), '{a:1,b:2}')
            t.end()
        })

        t.test('stringifies using toJSON5(key) methods', t => {
            function C () {}
            Object.assign(C.prototype, {toJSON5 (key) { return (key === 'a') ? 1 : 2 }})
            assert.strictEqual(JSON5.stringify({a: new C(), b: new C()}), '{a:1,b:2}')
            t.end()
        })

        t.test('calls toJSON5 instead of toJSON if both are defined', t => {
            function C () {}
            Object.assign(C.prototype, {
                toJSON () { return {a: 1, b: 2} },
                toJSON5 () { return {a: 2, b: 2} },
            })
            assert.strictEqual(JSON5.stringify(new C()), '{a:2,b:2}')
            t.end()
        })

        t.test('throws on circular objects', t => {
            let a = {}
            a.a = a
            assert.throws(() => { JSON5.stringify(a) }, TypeError, 'Converting circular structure to JSON5')
            t.end()
        })

        t.test('throws on circular arrays', t => {
            let a = []
            a[0] = a
            assert.throws(() => { JSON5.stringify(a) }, TypeError, 'Converting circular structure to JSON5')
            t.end()
        })

        t.end()
    })

    t.test('#stringify(value, null, space)', t => {
        t.strictSame(
            JSON5.stringify([1]),
            '[1]',
            'does not indent when no value is provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, 0),
            '[1]',
            'does not indent when 0 is provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, ''),
            '[1]',
            'does not indent when an empty string is provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, 2),
            '[\n  1,\n]',
            'indents n spaces when a number is provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, 11),
            '[\n          1,\n]',
            'does not indent more than 10 spaces when a number is provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, '\t'),
            '[\n\t1,\n]',
            'indents with the string provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, '           '),
            '[\n          1,\n]',
            'does not indent more than 10 characters of the string provided'
        )

        t.strictSame(
            JSON5.stringify([1], null, 2),
            '[\n  1,\n]',
            'indents in arrays'
        )

        t.strictSame(
            JSON5.stringify([1, [2], 3], null, 2),
            '[\n  1,\n  [\n    2,\n  ],\n  3,\n]',
            'indents in nested arrays'
        )

        t.strictSame(
            JSON5.stringify({a: 1}, null, 2),
            '{\n  a: 1,\n}',
            'indents in objects'
        )

        t.strictSame(
            JSON5.stringify({a: {b: 2}}, null, 2),
            '{\n  a: {\n    b: 2,\n  },\n}',
            'indents in nested objects'
        )

        t.strictSame(
            // eslint-disable-next-line no-new-wrappers
            JSON5.stringify([1], null, new Number(2)),
            '[\n  1,\n]',
            'accepts Number objects'
        )

        t.strictSame(
            // eslint-disable-next-line no-new-wrappers
            JSON5.stringify([1], null, new String('\t')),
            '[\n\t1,\n]',
            'accepts String objects'
        )

        t.end()
    })

    t.test('#stringify(value, replacer)', t => {
        t.strictSame(
            JSON5.stringify({a: 1, b: 2, 3: 3}, ['a', 3]),
            "{a:1,'3':3}",
            'filters keys when an array is provided'
        )

        t.strictSame(
            JSON5.stringify({a: 1, b: 2, 3: 3, false: 4}, ['a', 3, false]),
            "{a:1,'3':3}",
            'only filters string and number keys when an array is provided'
        )

        t.strictSame(
            // eslint-disable-next-line no-new-wrappers
            JSON5.stringify({a: 1, b: 2, 3: 3}, [new String('a'), new Number(3)]),
            "{a:1,'3':3}",
            'accepts String and Number objects when an array is provided'
        )

        t.strictSame(
            JSON5.stringify({a: 1, b: 2}, (key, value) => (key === 'a') ? 2 : value),
            '{a:2,b:2}',
            'replaces values when a function is provided'
        )

        t.strictSame(
            JSON5.stringify({a: {b: 1}}, function (k, v) { return (k === 'b' && this.b) ? 2 : v }),
            '{a:{b:2}}',
            'sets `this` to the parent value'
        )

        t.test('is called after toJSON', t => {
            function C () {}
            Object.assign(C.prototype, {toJSON () { return {a: 1, b: 2} }})
            assert.strictEqual(
                JSON5.stringify(new C(), (key, value) => (key === 'a') ? 2 : value),
                '{a:2,b:2}'
            )
            t.end()
        })

        t.test('is called after toJSON5', t => {
            function C () {}
            Object.assign(C.prototype, {toJSON5 () { return {a: 1, b: 2} }})
            assert.strictEqual(
                JSON5.stringify(new C(), (key, value) => (key === 'a') ? 2 : value),
                '{a:2,b:2}'
            )
            t.end()
        })

        t.strictSame(
            JSON5.stringify(
                {a: 1},
                (key, value) => {
                    JSON5.stringify({}, null, 4)
                    return value
                },
                2
            ),
            '{\n  a: 1,\n}',
            'does not affect space when calls are nested'
        )

        t.end()
    })

    t.test('#stringify(value, options)', t => {
        t.strictSame(
            JSON5.stringify({a: 1, b: 2, 3: 3}, {replacer: ['a', 3]}),
            "{a:1,'3':3}",
            'accepts replacer as an option'
        )

        t.strictSame(
            JSON5.stringify([1], {space: 2}),
            '[\n  1,\n]',
            'accepts space as an option'
        )

        t.end()
    })

    t.test('#stringify(value, {quote})', t => {
        t.strictSame(
            JSON5.stringify({'a"': '1"'}, {quote: '"'}),
            '{"a\\"":"1\\""}',
            'uses double quotes if provided'
        )

        t.strictSame(
            JSON5.stringify({"a'": "1'"}, {quote: "'"}),
            "{'a\\'':'1\\''}",
            'uses single quotes if provided'
        )

        t.end()
    })

    t.end()
})
