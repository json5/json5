import {test} from 'node:test'
import assert from 'node:assert'
import JSON5 from '../lib/index.js'

function throwsWith (fn, {message, lineNumber, columnNumber}) {
    assert.throws(fn, err => {
        assert.ok(message.test(err.message), `message ${JSON.stringify(err.message)} does not match ${message}`)
        assert.strictEqual(err.lineNumber, lineNumber, 'lineNumber')
        assert.strictEqual(err.columnNumber, columnNumber, 'columnNumber')
        return true
    })
}

test('parse errors: throws on empty documents', () => {
    throwsWith(() => JSON5.parse(''), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 1,
    })
})

test('parse errors: throws on documents with only comments', () => {
    throwsWith(() => JSON5.parse('//a'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on incomplete single line comments', () => {
    throwsWith(() => JSON5.parse('/a'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on unterminated multiline comments', () => {
    throwsWith(() => JSON5.parse('/*'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on unterminated multiline comment closings', () => {
    throwsWith(() => JSON5.parse('/**'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on invalid characters in values', () => {
    throwsWith(() => JSON5.parse('a'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 1,
    })
})

test('parse errors: throws on invalid characters in identifier start escapes', () => {
    throwsWith(() => JSON5.parse('{\\a:1}'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid identifier start characters', () => {
    throwsWith(() => JSON5.parse('{\\u0021:1}'), {
        message: /^JSON5: invalid identifier character/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on invalid characters in identifier continue escapes', () => {
    throwsWith(() => JSON5.parse('{a\\a:1}'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on invalid identifier continue characters', () => {
    throwsWith(() => JSON5.parse('{a\\u0021:1}'), {
        message: /^JSON5: invalid identifier character/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid characters following a sign', () => {
    throwsWith(() => JSON5.parse('-a'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on invalid characters following a leading decimal point', () => {
    throwsWith(() => JSON5.parse('.a'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on invalid characters following an exponent indicator', () => {
    throwsWith(() => JSON5.parse('1ea'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid characters following an exponent sign', () => {
    throwsWith(() => JSON5.parse('1e-a'), {
        message: /^JSON5: invalid character 'a'/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on invalid characters following a hexadecimal indicator', () => {
    throwsWith(() => JSON5.parse('0xg'), {
        message: /^JSON5: invalid character 'g'/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid new lines in strings', () => {
    throwsWith(() => JSON5.parse('"\n"'), {
        message: /^JSON5: invalid character '\\n'/,
        lineNumber: 2,
        columnNumber: 0,
    })
})

test('parse errors: throws on unterminated strings', () => {
    throwsWith(() => JSON5.parse('"'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on invalid identifier start characters in property names', () => {
    throwsWith(() => JSON5.parse('{!:1}'), {
        message: /^JSON5: invalid character '!'/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on invalid characters following a property name', () => {
    throwsWith(() => JSON5.parse('{a!1}'), {
        message: /^JSON5: invalid character '!'/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid characters following a property value', () => {
    throwsWith(() => JSON5.parse('{a:1!}'), {
        message: /^JSON5: invalid character '!'/,
        lineNumber: 1,
        columnNumber: 5,
    })
})

test('parse errors: throws on invalid characters following an array value', () => {
    throwsWith(() => JSON5.parse('[1!]'), {
        message: /^JSON5: invalid character '!'/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid characters in literals', () => {
    throwsWith(() => JSON5.parse('tru!'), {
        message: /^JSON5: invalid character '!'/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on unterminated escapes', () => {
    throwsWith(() => JSON5.parse('"\\'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on invalid first digits in hexadecimal escapes', () => {
    throwsWith(() => JSON5.parse('"\\xg"'), {
        message: /^JSON5: invalid character 'g'/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on invalid second digits in hexadecimal escapes', () => {
    throwsWith(() => JSON5.parse('"\\x0g"'), {
        message: /^JSON5: invalid character 'g'/,
        lineNumber: 1,
        columnNumber: 5,
    })
})

test('parse errors: throws on invalid unicode escapes', () => {
    throwsWith(() => JSON5.parse('"\\u000g"'), {
        message: /^JSON5: invalid character 'g'/,
        lineNumber: 1,
        columnNumber: 7,
    })
})

for (let i = 1; i <= 9; i++) {
    test(`parse errors: throws on escaped digit ${i}`, () => {
        throwsWith(() => JSON5.parse(`'\\${i}'`), {
            message: /^JSON5: invalid character '\d'/,
            lineNumber: 1,
            columnNumber: 3,
        })
    })
}

test('parse errors: throws on octal escapes', () => {
    throwsWith(() => JSON5.parse("'\\01'"), {
        message: /^JSON5: invalid character '1'/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on multiple values', () => {
    throwsWith(() => JSON5.parse('1 2'), {
        message: /^JSON5: invalid character '2'/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws with control characters escaped in the message', () => {
    throwsWith(() => JSON5.parse('\x01'), {
        message: /^JSON5: invalid character '\\x01'/,
        lineNumber: 1,
        columnNumber: 1,
    })
})

test('parse errors: throws on unclosed objects before property names', () => {
    throwsWith(() => JSON5.parse('{'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on unclosed objects after property names', () => {
    throwsWith(() => JSON5.parse('{a'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 3,
    })
})

test('parse errors: throws on unclosed objects before property values', () => {
    throwsWith(() => JSON5.parse('{a:'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 4,
    })
})

test('parse errors: throws on unclosed objects after property values', () => {
    throwsWith(() => JSON5.parse('{a:1'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 5,
    })
})

test('parse errors: throws on unclosed arrays before values', () => {
    throwsWith(() => JSON5.parse('['), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 2,
    })
})

test('parse errors: throws on unclosed arrays after values', () => {
    throwsWith(() => JSON5.parse('[1'), {
        message: /^JSON5: invalid end of input/,
        lineNumber: 1,
        columnNumber: 3,
    })
})
