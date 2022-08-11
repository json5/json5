const JSON5 = require('../lib')

const t = require('tap')

t.test('JSON5', t => {
    t.test('#parse()', t => {
        t.test('errors', t => {
            t.throws(
                () => { JSON5.parse('') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 1,
                },
                'throws on empty documents'
            )

            t.throws(
                () => { JSON5.parse('//a') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on documents with only comments'
            )

            t.throws(
                () => { JSON5.parse('/a') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on incomplete single line comments'
            )

            t.throws(
                () => { JSON5.parse('/*') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on unterminated multiline comments'
            )

            t.throws(
                () => { JSON5.parse('/**') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on unterminated multiline comment closings'
            )

            t.throws(
                () => { JSON5.parse('a') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 1,
                },
                'throws on invalid characters in values'
            )

            t.throws(
                () => { JSON5.parse('{\\a:1}') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on invalid characters in identifier start escapes'
            )

            t.throws(
                () => { JSON5.parse('{\\u0021:1}') },
                {
                    message: /^JSON5: invalid identifier character/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on invalid identifier start characters'
            )

            t.throws(
                () => { JSON5.parse('{a\\a:1}') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on invalid characters in identifier continue escapes'
            )

            t.throws(
                () => { JSON5.parse('{a\\u0021:1}') },
                {
                    message: /^JSON5: invalid identifier character/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on invalid identifier continue characters'
            )

            t.throws(
                () => { JSON5.parse('-a') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on invalid characters following a sign'
            )

            t.throws(
                () => { JSON5.parse('.a') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on invalid characters following a leading decimal point'
            )

            t.throws(
                () => { JSON5.parse('1ea') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on invalid characters following an exponent indicator'
            )

            t.throws(
                () => { JSON5.parse('1e-a') },
                {
                    message: /^JSON5: invalid character 'a'/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on invalid characters following an exponent sign'
            )

            t.throws(
                () => { JSON5.parse('0xg') },
                {
                    message: /^JSON5: invalid character 'g'/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on invalid characters following a hexadecimal indicator'
            )

            t.throws(
                () => { JSON5.parse('"\n"') },
                {
                    message: /^JSON5: invalid character '\\n'/,
                    lineNumber: 2,
                    columnNumber: 0,
                },
                'throws on invalid new lines in strings'
            )

            t.throws(
                () => { JSON5.parse('"') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on unterminated strings'
            )

            t.throws(
                () => { JSON5.parse('{!:1}') },
                {
                    message: /^JSON5: invalid character '!'/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on invalid identifier start characters in property names'
            )

            t.throws(
                () => { JSON5.parse('{a!1}') },
                {
                    message: /^JSON5: invalid character '!'/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on invalid characters following a property name'
            )

            t.throws(
                () => { JSON5.parse('{a:1!}') },
                {
                    message: /^JSON5: invalid character '!'/,
                    lineNumber: 1,
                    columnNumber: 5,
                },
                'throws on invalid characters following a property value'
            )

            t.throws(
                () => { JSON5.parse('[1!]') },
                {
                    message: /^JSON5: invalid character '!'/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on invalid characters following an array value'
            )

            t.throws(
                () => { JSON5.parse('tru!') },
                {
                    message: /^JSON5: invalid character '!'/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on invalid characters in literals'
            )

            t.throws(
                () => { JSON5.parse('"\\') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on unterminated escapes'
            )

            t.throws(
                () => { JSON5.parse('"\\xg"') },
                {
                    message: /^JSON5: invalid character 'g'/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on invalid first digits in hexadecimal escapes'
            )

            t.throws(
                () => { JSON5.parse('"\\x0g"') },
                {
                    message: /^JSON5: invalid character 'g'/,
                    lineNumber: 1,
                    columnNumber: 5,
                },
                'throws on invalid second digits in hexadecimal escapes'
            )

            t.throws(
                () => { JSON5.parse('"\\u000g"') },
                {
                    message: /^JSON5: invalid character 'g'/,
                    lineNumber: 1,
                    columnNumber: 7,
                },
                'throws on invalid unicode escapes'
            )

            for (let i = 1; i <= 9; i++) {
                t.throws(
                    () => { JSON5.parse(`'\\${i}'`) },
                    {
                        message: /^JSON5: invalid character '\d'/,
                        lineNumber: 1,
                        columnNumber: 3,
                    },
                    `throws on escaped digit ${i}`
                )
            }

            t.throws(
                () => { JSON5.parse("'\\01'") },
                {
                    message: /^JSON5: invalid character '1'/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on octal escapes'
            )

            t.throws(
                () => { JSON5.parse('1 2') },
                {
                    message: /^JSON5: invalid character '2'/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on multiple values'
            )

            t.throws(
                () => { JSON5.parse('\x01') },
                {
                    message: /^JSON5: invalid character '\\x01'/,
                    lineNumber: 1,
                    columnNumber: 1,
                },
                'throws with control characters escaped in the message'
            )

            t.throws(
                () => { JSON5.parse('{') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on unclosed objects before property names'
            )

            t.throws(
                () => { JSON5.parse('{a') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on unclosed objects after property names'
            )

            t.throws(
                () => { JSON5.parse('{a:') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 4,
                },
                'throws on unclosed objects before property values'
            )

            t.throws(
                () => { JSON5.parse('{a:1') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 5,
                },
                'throws on unclosed objects after property values'
            )

            t.throws(
                () => { JSON5.parse('[') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 2,
                },
                'throws on unclosed arrays before values'
            )

            t.throws(
                () => { JSON5.parse('[1') },
                {
                    message: /^JSON5: invalid end of input/,
                    lineNumber: 1,
                    columnNumber: 3,
                },
                'throws on unclosed arrays after values'
            )

            t.end()
        })

        t.end()
    })

    t.end()
})
