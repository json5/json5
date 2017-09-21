import assert from 'assert'
import JSON5 from '../lib'

describe('JSON5', () => {
    describe('#parse()', () => {
        describe('errors', () => {
            it('throws on invalid characters in comments', () => {
                assert.throws(() => {
                    JSON5.parse('/a')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2
                    )
                })
            })

            it('throws on unterminated multiline comments', () => {
                assert.throws(() => {
                    JSON5.parse('/*')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on unterminated multiline comment closings', () => {
                assert.throws(() => {
                    JSON5.parse('/**')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4
                    )
                })
            })

            it('throws on invalid characters in values', () => {
                assert.throws(() => {
                    JSON5.parse('a')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 1
                    )
                })
            })

            it('throws on invalid characters in identifier start escapes', () => {
                assert.throws(() => {
                    JSON5.parse('{\\a:1}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid identifier start characters', () => {
                assert.throws(() => {
                    JSON5.parse('{\\u0021:1}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid identifier character/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2
                    )
                })
            })

            it('throws on invalid characters in identifier continue escapes', () => {
                assert.throws(() => {
                    JSON5.parse('{a\\a:1}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4
                    )
                })
            })

            it('throws on invalid identifier continue characters', () => {
                assert.throws(() => {
                    JSON5.parse('{a\\u0021:1}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid identifier character/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid characters following a sign', () => {
                assert.throws(() => {
                    JSON5.parse('-a')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2
                    )
                })
            })

            it('throws on invalid characters following a leading decimal point', () => {
                assert.throws(() => {
                    JSON5.parse('.a')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2
                    )
                })
            })

            it('throws on invalid characters following an exponent indicator', () => {
                assert.throws(() => {
                    JSON5.parse('1ea')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid characters following an exponent sign', () => {
                assert.throws(() => {
                    JSON5.parse('1e-a')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'a'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4
                    )
                })
            })

            it('throws on invalid characters following a hexidecimal indicator', () => {
                assert.throws(() => {
                    JSON5.parse('0xg')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid new lines in strings', () => {
                assert.throws(() => {
                    JSON5.parse('"\n"')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '\\n'/.test(err.message) &&
                        err.lineNumber === 2 &&
                        err.columnNumber === 0
                    )
                })
            })

            it('throws on unterminated strings', () => {
                assert.throws(() => {
                    JSON5.parse('"')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2
                    )
                })
            })

            it('throws on invalid identifier start characters in property names', () => {
                assert.throws(() => {
                    JSON5.parse('{!:1}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 2
                    )
                })
            })

            it('throws on invalid characters following a property name', () => {
                assert.throws(() => {
                    JSON5.parse('{a!1}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid characters following a property value', () => {
                assert.throws(() => {
                    JSON5.parse('{a:1!}')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 5
                    )
                })
            })

            it('throws on invalid characters following an array value', () => {
                assert.throws(() => {
                    JSON5.parse('[1!]')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid characters in literals', () => {
                assert.throws(() => {
                    JSON5.parse('tru!')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '!'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4
                    )
                })
            })

            it('throws on unterminated escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid end of input/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws on invalid first digits in hexadecimal escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\xg"')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 4
                    )
                })
            })

            it('throws on invalid second digits in hexadecimal escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\x0g"')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 5
                    )
                })
            })

            it('throws on invalid unicode escapes', () => {
                assert.throws(() => {
                    JSON5.parse('"\\u000g"')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character 'g'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 7
                    )
                })
            })

            it('throws on multiple values', () => {
                assert.throws(() => {
                    JSON5.parse('1 2')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '2'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 3
                    )
                })
            })

            it('throws with control characters escaped in the message', () => {
                assert.throws(() => {
                    JSON5.parse('\x01')
                },
                err => {
                    return (
                        err instanceof SyntaxError &&
                        /^JSON5: invalid character '\\x01'/.test(err.message) &&
                        err.lineNumber === 1 &&
                        err.columnNumber === 1
                    )
                })
            })
        })
    })
})
