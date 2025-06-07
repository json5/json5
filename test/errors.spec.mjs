import {expect} from 'chai'

const JSON5 = (await import('../lib/index.js')).default

describe('JSON5', () => {
    describe('#parse()', () => {
        describe('errors', () => {
            it('throws on empty documents', () => {
                try {
                    JSON5.parse('')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 1).to.be.ok
                }
            })

            it('throws on documents with only comments', () => {
                try {
                    JSON5.parse('//a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on incomplete single line comments', () => {
                try {
                    JSON5.parse('/a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on unterminated multiline comments', () => {
                try {
                    JSON5.parse('/*')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on unterminated multiline comment closings', () => {
                try {
                    JSON5.parse('/**')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on invalid characters in values', () => {
                try {
                    JSON5.parse('a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 1).to.be.ok
                }
            })

            it('throws on invalid characters in identifier start escapes', () => {
                try {
                    JSON5.parse('{\\a:1}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid identifier start characters', () => {
                try {
                    JSON5.parse('{\\u0021:1}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid identifier character/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on invalid characters in identifier continue escapes', () => {
                try {
                    JSON5.parse('{a\\a:1}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on invalid identifier continue characters', () => {
                try {
                    JSON5.parse('{a\\u0021:1}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid identifier character/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid characters following a sign', () => {
                try {
                    JSON5.parse('-a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on invalid characters following a leading decimal point', () => {
                try {
                    JSON5.parse('.a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on invalid characters following an exponent indicator', () => {
                try {
                    JSON5.parse('1ea')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid characters following an exponent sign', () => {
                try {
                    JSON5.parse('1e-a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on invalid characters following a hexadecimal indicator', () => {
                try {
                    JSON5.parse('0xg')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid new lines in strings', () => {
                try {
                    JSON5.parse('"\n"')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '\\n'/.test(err.message) &&
                        err.lineNumber === 2 &&
                        err.columnNumber === 0).to.be.ok
                }
            })

            it('throws on unterminated strings', () => {
                try {
                    JSON5.parse('"')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on invalid identifier start characters in property names', () => {
                try {
                    JSON5.parse('{!:1}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on invalid characters following a property name', () => {
                try {
                    JSON5.parse('{a!1}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid characters following a property value', () => {
                try {
                    JSON5.parse('{a:1!}')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 5).to.be.ok
                }
            })

            it('throws on invalid characters following an array value', () => {
                try {
                    JSON5.parse('[1!]')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid characters in literals', () => {
                try {
                    JSON5.parse('tru!')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on unterminated escapes', () => {
                try {
                    JSON5.parse('"\\')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on invalid first digits in hexadecimal escapes', () => {
                try {
                    JSON5.parse('"\\xg"')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on invalid second digits in hexadecimal escapes', () => {
                try {
                    JSON5.parse('"\\x0g"')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 5).to.be.ok
                }
            })

            it('throws on invalid unicode escapes', () => {
                try {
                    JSON5.parse('"\\u000g"')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 7).to.be.ok
                }
            })

            it('throws on escaped digits other than 0', () => {
                for (let i = 1; i <= 9; i++) {
                    try {
                        JSON5.parse(`'\\${i}'`)
                        expect(false).to.be.ok
                    } catch (err) {
                        expect(err instanceof SyntaxError &&
                            /^JSON5: invalid character '\d'/.test(err.message) &&
                            err.lineNumber === 1 &&
                            err.columnNumber === 3).to.be.ok
                    }
                }
            })

            it('throws on octal escapes', () => {
                try {
                    JSON5.parse("'\\01'")
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '1'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on multiple values', () => {
                try {
                    JSON5.parse('1 2')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '2'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws with control characters escaped in the message', () => {
                try {
                    JSON5.parse('\x01')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid character '\\x01'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 1).to.be.ok
                }
            })

            it('throws on unclosed objects before property names', () => {
                try {
                    JSON5.parse('{')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on unclosed objects after property names', () => {
                try {
                    JSON5.parse('{a')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })

            it('throws on unclosed objects before property values', () => {
                try {
                    JSON5.parse('{a:')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4).to.be.ok
                }
            })

            it('throws on unclosed objects after property values', () => {
                try {
                    JSON5.parse('{a:1')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                 /^JSON5: invalid end of input/.test(err.message) &&
                 err.lineNumber === 1 &&
                 err.columnNumber === 5).to.be.ok
                }
            })

            it('throws on unclosed arrays before values', () => {
                try {
                    JSON5.parse('[')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2).to.be.ok
                }
            })

            it('throws on unclosed arrays after values', () => {
                try {
                    JSON5.parse('[1')
                    expect(false).to.be.ok
                } catch (err) {
                    expect(err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3).to.be.ok
                }
            })
        })
    })
})
