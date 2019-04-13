const assert = require('assert')
const JSON5 = require('../lib')

require('tap').mochaGlobals()

describe('JSON5', () => {
    describe('#parse()', () => {
        describe('errors', () => {
            it('throws on empty documents', () => {
                assert.throws(() => {
                    JSON5.parse('')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 1
                ))
            })

            it('throws on documents with only comments', () => {
                assert.throws(() => {
                    JSON5.parse('//a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on incomplete single line comments', () => {
                assert.throws(() => {
                    JSON5.parse('/a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on unterminated multiline comments', () => {
                assert.throws(() => {
                    JSON5.parse('/*')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on unterminated multiline comment closings', () => {
                assert.throws(() => {
                    JSON5.parse('/**')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on invalid characters in values', () => {
                assert.throws(() => {
                    JSON5.parse('a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 1
                ))
            })

            it('throws on invalid characters in identifier start escapes', () => {
                assert.throws(() => {
                    JSON5.parse('{\\a:1}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid identifier start characters', () => {
                assert.throws(() => {
                    JSON5.parse('{\\u0021:1}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid identifier character/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on invalid characters in identifier continue escapes', () => {
                assert.throws(() => {
                    JSON5.parse('{a\\a:1}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on invalid identifier continue characters', () => {
                assert.throws(() => {
                    JSON5.parse('{a\\u0021:1}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid identifier character/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid characters following a sign', () => {
                assert.throws(() => {
                    JSON5.parse('-a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on invalid characters following a leading decimal point', () => {
                assert.throws(() => {
                    JSON5.parse('.a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on invalid characters following an exponent indicator', () => {
                assert.throws(() => {
                    JSON5.parse('1ea')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid characters following an exponent sign', () => {
                assert.throws(() => {
                    JSON5.parse('1e-a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'a'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on invalid characters following a hexadecimal indicator', () => {
                assert.throws(() => {
                    JSON5.parse('0xg')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'g'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid new lines in strings', () => {
                assert.throws(() => {
                    JSON5.parse('"\n"')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '\\n'/.test(err.message) &&
                    err.lineNumber === 2 &&
                    err.columnNumber === 0
                ))
            })

            it('throws on unterminated strings', () => {
                assert.throws(() => {
                    JSON5.parse('"')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on invalid identifier start characters in property names', () => {
                assert.throws(() => {
                    JSON5.parse('{!:1}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '!'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on invalid characters following a property name', () => {
                assert.throws(() => {
                    JSON5.parse('{a!1}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '!'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid characters following a property value', () => {
                assert.throws(() => {
                    JSON5.parse('{a:1!}')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '!'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 5
                ))
            })

            it('throws on invalid characters following an array value', () => {
                assert.throws(() => {
                    JSON5.parse('[1!]')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '!'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid characters in literals', () => {
                assert.throws(() => {
                    JSON5.parse('tru!')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '!'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on unterminated escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on invalid first digits in hexadecimal escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\xg"')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'g'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on invalid second digits in hexadecimal escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\x0g"')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'g'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 5
                ))
            })

            it('throws on invalid unicode escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\u000g"')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character 'g'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 7
                ))
            })

            it('throws on escaped digits other than 0', () => {
                for (let i = 1; i <= 9; i++) {
                    assert.throws(() => {
                        JSON5.parse(`'\\${i}'`)
                    },
                    err => (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '\d'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    ))
                }
            })

            it('throws on octal escapes', () => {
                assert.throws(() => {
                    JSON5.parse("'\\01'")
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '1'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on multiple values', () => {
                assert.throws(() => {
                    JSON5.parse('1 2')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '2'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws with control characters escaped in the message', () => {
                assert.throws(() => {
                    JSON5.parse('\x01')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid character '\\x01'/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 1
                ))
            })

            it('throws on unclosed objects before property names', () => {
                assert.throws(() => {
                    JSON5.parse('{')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on unclosed objects after property names', () => {
                assert.throws(() => {
                    JSON5.parse('{a')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })

            it('throws on unclosed objects before property values', () => {
                assert.throws(() => {
                    JSON5.parse('{a:')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 4
                ))
            })

            it('throws on unclosed objects after property values', () => {
                assert.throws(() => {
                    JSON5.parse('{a:1')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 5
                ))
            })

            it('throws on unclosed arrays before values', () => {
                assert.throws(() => {
                    JSON5.parse('[')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 2
                ))
            })

            it('throws on unclosed arrays after values', () => {
                assert.throws(() => {
                    JSON5.parse('[1')
                },
                err => (
                    err instanceof SyntaxError &&
                    /^JSON5: invalid end of input/.test(err.message) &&
                    err.lineNumber === 1 &&
                    err.columnNumber === 3
                ))
            })
        })
    })
})
