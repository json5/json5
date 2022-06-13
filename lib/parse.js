const util = require('./util')

const ParseState = {
    start: 0,
    beforePropertyName: 1,
    afterPropertyName: 2,
    beforePropertyValue: 3,
    afterPropertyValue: 4,
    beforeArrayValue: 5,
    afterArrayValue: 6,
    end: 7,
}

const LexState = {
    default: 8,
    comment: 9,
    multiLineComment: 10,
    multiLineCommentAsterisk: 11,
    singleLineComment: 12,
    value: 13,
    identifierNameStartEscape: 14,
    identifierName: 15,
    identifierNameEscape: 16,
    sign: 17,
    zero: 18,
    decimalInteger: 19,
    decimalPointLeading: 20,
    decimalPoint: 21,
    decimalFraction: 22,
    decimalExponent: 23,
    decimalExponentSign: 24,
    decimalExponentInteger: 25,
    hexadecimal: 26,
    hexadecimalInteger: 27,
    string: 28,
    start: ParseState.start,
    beforePropertyName: ParseState.beforePropertyName,
    afterPropertyName: ParseState.afterPropertyName,
    beforePropertyValue: ParseState.beforePropertyValue,
    afterPropertyValue: ParseState.afterPropertyValue,
    beforeArrayValue: ParseState.beforeArrayValue,
    afterArrayValue: ParseState.afterArrayValue,
    end: ParseState.end,
}

const Token = {
    eof: 0,
    punctuator: 1,
    null: 2,
    boolean: 3,
    numeric: 4,
    identifier: 5,
    numeric: 6,
    string: 7,
    punctuator: 8,
}

const tokenRef = {
    type: -1,
    value: '',
    line: -1,
    column: -1,
}

const FIRST_DOUBLE_LENGTH_CODE = 2 ** 16
const getCodePointLength = c => c >= FIRST_DOUBLE_LENGTH_CODE ? 2 : 1

let source
let parseState
let stack
let pos
let line
let column
let token
let key
let root

module.exports = function parse (text, reviver) {
    source = String(text)
    parseState = ParseState.start
    stack = []
    pos = 0
    line = 1
    column = 0
    token = undefined
    key = undefined
    root = undefined

    do {
        token = lex()

        // This code is unreachable.
        // if (!parseStates[parseState]) {
        //     throw invalidParseState()
        // }

        parseStates[parseState]()
    } while (token.type !== Token.eof)

    if (typeof reviver === 'function') {
        return internalize({'': root}, '', reviver)
    }

    return root
}

function internalize (holder, name, reviver) {
    const value = holder[name]
    if (value != null && typeof value === 'object') {
        for (const key in value) {
            const replacement = internalize(value, key, reviver)
            if (replacement === undefined) {
                delete value[key]
            } else {
                value[key] = replacement
            }
        }
    }

    return reviver.call(holder, name, value)
}

let lexState
let buffer
let doubleQuote
let sign
let c

function lex () {
    lexState = LexState.default
    buffer = ''
    doubleQuote = false
    sign = 1

    for (;;) {
        c = peek()

        // This code is unreachable.
        // if (!lexStates[lexState]) {
        //     throw invalidLexState(lexState)
        // }

        const token = lexStates[lexState]()
        if (token) {
            return token
        }
    }
}

function peek () {
    if (source[pos]) {
        return source.codePointAt(pos)
    }
}

function skip () {
    const c = peek()

    if (c === 10 /* '\n' */) {
        line++
        column = 0
    } else if (c) {
        column += getCodePointLength(c)
    } else {
        column++
    }

    if (c) {
        pos += getCodePointLength(c)
    }

    return c
}

function read () {
    return String.fromCodePoint(skip())
}

const lexStates = {
    [LexState.default] () {
        switch (c) {
        case 9 /* '\t' */:
        case 11 /* '\v' */:
        case 12 /* '\f' */:
        case 32 /* ' ' */:
        case 160 /* '\u00A0' */:
        case 65279 /* '\uFEFF' */:
        case 10 /* '\n' */:
        case 13 /* '\r' */:
        case 8232 /* '\u2028' */:
        case 8233 /* '\u2029' */:
            skip()
            return

        case 47 /* '/' */:
            skip()
            lexState = LexState.comment
            return

        case undefined:
            skip()
            return newToken(Token.eof)
        }

        if (util.isSpaceSeparator(c)) {
            skip()
            return
        }

        // This code is unreachable.
        // if (!lexStates[parseState]) {
        //     throw invalidLexState(parseState)
        // }

        return lexStates[parseState]()
    },

    [LexState.comment] () {
        switch (c) {
        case 42 /* '*' */:
            skip()
            lexState = LexState.multiLineComment
            return

        case 47 /* '/' */:
            skip()
            lexState = LexState.singleLineComment
            return
        }

        throw invalidChar(read())
    },

    [LexState.multiLineComment] () {
        switch (c) {
        case 42 /* '*' */:
            skip()
            lexState = LexState.multiLineCommentAsterisk
            return

        case undefined:
            throw invalidChar(read())
        }

        skip()
    },

    [LexState.multiLineCommentAsterisk] () {
        switch (c) {
        case 42 /* '*' */:
            skip()
            return

        case 47 /* '/' */:
            skip()
            lexState = LexState.default
            return

        case undefined:
            throw invalidChar(read())
        }

        skip()
        lexState = LexState.multiLineComment
    },

    [LexState.singleLineComment] () {
        switch (c) {
        case 10 /* '\n' */:
        case 13 /* '\r' */:
        case 8232 /* '\u2028' */:
        case 8233 /* '\u2029' */:
            skip()
            lexState = LexState.default
            return

        case undefined:
            skip()
            return newToken(Token.eof)
        }

        skip()
    },

    [LexState.value] () {
        switch (c) {
        case 123 /* '{' */:
        case 91 /* '[' */:
            return newToken(Token.punctuator, skip())

        case 110 /* 'n' */:
            skip()
            literal([117 /* 'u' */, 108 /* 'l' */, 108 /* 'l' */])
            return newToken(Token.null, null)

        case 116 /* 't' */:
            skip()
            literal([114 /* 'r' */, 117 /* 'u' */, 101 /* 'e' */])
            return newToken(Token.boolean, true)

        case 102 /* 'f' */:
            skip()
            literal([97 /* 'a' */, 108 /* 'l' */, 115 /* 's' */, 101 /* 'e' */])
            return newToken(Token.boolean, false)

        case 45 /* '-' */:
        case 43 /* '+' */:
            if (skip() === 45 /* '-' */) {
                sign = -1
            }

            lexState = LexState.sign
            return

        case 46 /* '.' */:
            buffer = read()
            lexState = LexState.decimalPointLeading
            return

        case 48 /* '0' */:
            buffer = read()
            lexState = LexState.zero
            return

        case 49 /* '1' */:
        case 50 /* '2' */:
        case 51 /* '3' */:
        case 52 /* '4' */:
        case 53 /* '5' */:
        case 54 /* '6' */:
        case 55 /* '7' */:
        case 56 /* '8' */:
        case 57 /* '9' */:
            buffer = read()
            lexState = LexState.decimalInteger
            return

        case 73 /* 'I' */:
            skip()
            literal([110 /* 'n' */, 102 /* 'f' */, 105 /* 'i' */, 110 /* 'n' */, 105 /* 'i' */, 116 /* 't' */, 121 /* 'y' */])
            return newToken(Token.numeric, Infinity)

        case 78 /* 'N' */:
            skip()
            literal([97 /* 'a' */, 78 /* 'N' */])
            return newToken(Token.numeric, NaN)

        case 34 /* '"' */:
        case 39 /* "'" */:
            doubleQuote = (skip() === 34 /* '"' */)
            buffer = ''
            lexState = LexState.string
            return
        }

        throw invalidChar(read())
    },

    [LexState.identifierNameStartEscape] () {
        if (c !== 117 /* 'u' */) {
            throw invalidChar(read())
        }

        skip()
        const u = unicodeEscape()
        switch (u) {
        case 36 /* '$' */:
        case 95 /* '_' */:
            break

        default:
            if (!util.isIdStartChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += u
        lexState = LexState.identifierName
    },

    [LexState.identifierName] () {
        switch (c) {
        case 36 /* '$' */:
        case 95 /* '_' */:
        case 8204 /* '\u200C' */:
        case 8205 /* '\u200D' */:
            buffer += read()
            return

        case 92 /* '\\' */:
            skip()
            lexState = LexState.identifierNameEscape
            return
        }

        if (util.isIdContinueChar(c)) {
            buffer += read()
            return
        }

        return newToken(Token.identifier, buffer)
    },

    [LexState.identifierNameEscape] () {
        if (c !== 117 /* 'u' */) {
            throw invalidChar(read())
        }

        skip()
        const u = unicodeEscape()
        switch (u) {
        case 36 /* '$' */:
        case 95 /* '_' */:
        case 8204 /* '\u200C' */:
        case 8205 /* '\u200D' */:
            break

        default:
            if (!util.isIdContinueChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += u
        lexState = LexState.identifierName
    },

    [LexState.sign] () {
        switch (c) {
        case 46 /* '.' */:
            buffer = read()
            lexState = LexState.decimalPointLeading
            return

        case 48 /* '0' */:
            buffer = read()
            lexState = LexState.zero
            return

        case 49 /* '1' */:
        case 50 /* '2' */:
        case 51 /* '3' */:
        case 52 /* '4' */:
        case 53 /* '5' */:
        case 54 /* '6' */:
        case 55 /* '7' */:
        case 56 /* '8' */:
        case 57 /* '9' */:
            buffer = read()
            lexState = LexState.decimalInteger
            return

        case 73 /* 'I' */:
            skip()
            literal([110 /* 'n' */, 102 /* 'f' */, 105 /* 'i' */, 110 /* 'n' */, 105 /* 'i' */, 116 /* 't' */, 121 /* 'y' */])
            return newToken(Token.numeric, sign * Infinity)

        case 78 /* 'N' */:
            skip()
            literal([97 /* 'a' */, 78 /* 'N' */])
            return newToken(Token.numeric, NaN)
        }

        throw invalidChar(read())
    },

    [LexState.zero] () {
        switch (c) {
        case 46 /* '.' */:
            buffer += read()
            lexState = LexState.decimalPoint
            return

        case 101 /* 'e' */:
        case 69 /* 'E' */:
            buffer += read()
            lexState = LexState.decimalExponent
            return

        case 120 /* 'x' */:
        case 88 /* 'X' */:
            buffer += read()
            lexState = LexState.hexadecimal
            return
        }

        return newToken(Token.numeric, sign * 0)
    },

    [LexState.decimalInteger] () {
        switch (c) {
        case 46 /* '.' */:
            buffer += read()
            lexState = LexState.decimalPoint
            return

        case 101 /* 'e' */:
        case 69 /* 'E' */:
            buffer += read()
            lexState = LexState.decimalExponent
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            return
        }

        return newToken(Token.numeric, sign * Number(buffer))
    },

    [LexState.decimalPointLeading] () {
        if (util.isDigit(c)) {
            buffer += read()
            lexState = LexState.decimalFraction
            return
        }

        throw invalidChar(read())
    },

    [LexState.decimalPoint] () {
        switch (c) {
        case 101 /* 'e' */:
        case 69 /* 'E' */:
            buffer += read()
            lexState = LexState.decimalExponent
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            lexState = LexState.decimalFraction
            return
        }

        return newToken(Token.numeric, sign * Number(buffer))
    },

    [LexState.decimalFraction] () {
        switch (c) {
        case 101 /* 'e' */:
        case 69 /* 'E' */:
            buffer += read()
            lexState = LexState.decimalExponent
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            return
        }

        return newToken(Token.numeric, sign * Number(buffer))
    },

    [LexState.decimalExponent] () {
        switch (c) {
        case 43 /* '+' */:
        case 45 /* '-' */:
            buffer += read()
            lexState = LexState.decimalExponentSign
            return
        }

        if (util.isDigit(c)) {
            buffer += read()
            lexState = LexState.decimalExponentInteger
            return
        }

        throw invalidChar(read())
    },

    [LexState.decimalExponentSign] () {
        if (util.isDigit(c)) {
            buffer += read()
            lexState = LexState.decimalExponentInteger
            return
        }

        throw invalidChar(read())
    },

    [LexState.decimalExponentInteger] () {
        if (util.isDigit(c)) {
            buffer += read()
            return
        }

        return newToken(Token.numeric, sign * Number(buffer))
    },

    [LexState.hexadecimal] () {
        if (util.isHexDigit(c)) {
            buffer += read()
            lexState = LexState.hexadecimalInteger
            return
        }

        throw invalidChar(read())
    },

    [LexState.hexadecimalInteger] () {
        if (util.isHexDigit(c)) {
            buffer += read()
            return
        }

        return newToken(Token.numeric, sign * Number(buffer))
    },

    [LexState.string] () {
        switch (c) {
        case 92 /* '\\' */:
            skip()
            buffer += escape()
            return

        case 34 /* '"' */:
            if (doubleQuote) {
                skip()
                return newToken(Token.string, buffer)
            }

            buffer += read()
            return

        case 39 /* "'" */:
            if (!doubleQuote) {
                skip()
                return newToken(Token.string, buffer)
            }

            buffer += read()
            return

        case 10 /* '\n' */:
        case 13 /* '\r' */:
            throw invalidChar(read())

        case 8232 /* '\u2028' */:
        case 8233 /* '\u2029' */:
            separatorChar(c)
            break

        case undefined:
            throw invalidChar(read())
        }

        buffer += read()
    },

    [LexState.start] () {
        switch (c) {
        case 123 /* '{' */:
        case 91 /* '[' */:
            return newToken(Token.punctuator, skip())

        // This code is unreachable since the default lexState handles eof.
        // case undefined:
        //     return newToken(Token.eof)
        }

        lexState = LexState.value
    },

    [LexState.beforePropertyName] () {
        switch (c) {
        case 36 /* '$' */:
        case 95 /* '_' */:
            buffer = read()
            lexState = LexState.identifierName
            return

        case 92 /* '\\' */:
            skip()
            lexState = LexState.identifierNameStartEscape
            return

        case 125 /* '}' */:
            return newToken(Token.punctuator, skip())

        case 34 /* '"' */:
        case 39 /* "'" */:
            doubleQuote = (skip() === 34 /* '"' */)
            lexState = LexState.string
            return
        }

        if (util.isIdStartChar(c)) {
            buffer += read()
            lexState = LexState.identifierName
            return
        }

        throw invalidChar(read())
    },

    [LexState.afterPropertyName] () {
        if (c === 58 /* ':' */) {
            return newToken(Token.punctuator, skip())
        }

        throw invalidChar(read())
    },

    [LexState.beforePropertyValue] () {
        lexState = LexState.value
    },

    [LexState.afterPropertyValue] () {
        switch (c) {
        case 44 /* ',' */:
        case 125 /* '}' */:
            return newToken(Token.punctuator, skip())
        }

        throw invalidChar(read())
    },

    [LexState.beforeArrayValue] () {
        if (c === 93 /* ']' */) {
            return newToken(Token.punctuator, skip())
        }

        lexState = LexState.value
    },

    [LexState.afterArrayValue] () {
        switch (c) {
        case 44 /* ',' */:
        case 93 /* ']' */:
            return newToken(Token.punctuator, skip())
        }

        throw invalidChar(read())
    },

    [LexState.end] () {
        // This code is unreachable since it's handled by the default lexState.
        // if (c === undefined) {
        //     skip()
        //     return newToken(Token.eof)
        // }

        throw invalidChar(read())
    },
}

function newToken (type, value) {
    tokenRef.type = type
    tokenRef.value = value
    tokenRef.line = line
    tokenRef.column = column
    return tokenRef
}

function literal (s) {
    for (const c of s) {
        const p = skip()

        if (p !== c) {
            throw invalidChar(read())
        }
    }
}

function escape () {
    const c = peek()
    switch (c) {
    case 98 /* 'b' */:
        skip()
        return 8 /* '\b' */

    case 102 /* 'f' */:
        skip()
        return 12 /* '\f' */

    case 110 /* 'n' */:
        skip()
        return 10 /* '\n' */

    case 114 /* 'r' */:
        skip()
        return 13 /* '\r' */

    case 116 /* 't' */:
        skip()
        return 9 /* '\t' */

    case 118 /* 'v' */:
        skip()
        return 11 /* '\v' */

    case 48 /* '0' */:
        skip()
        if (util.isDigit(peek())) {
            throw invalidChar(read())
        }

        return 0 /* '\0' */

    case 120 /* 'x' */:
        skip()
        return hexEscape()

    case 117 /* 'u' */:
        skip()
        return unicodeEscape()

    case 10 /* '\n' */:
    case 8232 /* '\u2028' */:
    case 8233 /* '\u2029' */:
        skip()
        return ''

    case 13 /* '\r' */:
        skip()
        if (peek() === 10 /* '\n' */) {
            skip()
        }

        return ''

    case 49 /* '1' */:
    case 50 /* '2' */:
    case 51 /* '3' */:
    case 52 /* '4' */:
    case 53 /* '5' */:
    case 54 /* '6' */:
    case 55 /* '7' */:
    case 56 /* '8' */:
    case 57 /* '9' */:
        throw invalidChar(read())

    case undefined:
        throw invalidChar(read())
    }

    return read()
}

function hexEscape () {
    let buffer = ''
    let c = peek()

    if (!util.isHexDigit(c)) {
        throw invalidChar(read())
    }

    buffer += read()

    c = peek()
    if (!util.isHexDigit(c)) {
        throw invalidChar(read())
    }

    buffer += read()

    return String.fromCodePoint(parseInt(buffer, 16))
}

function unicodeEscape () {
    let buffer = ''
    let count = 4

    while (count-- > 0) {
        const c = peek()
        if (!util.isHexDigit(c)) {
            throw invalidChar(read())
        }

        buffer += read()
    }

    return String.fromCodePoint(parseInt(buffer, 16))
}

const parseStates = {
    [ParseState.start] () {
        if (token.type === Token.eof) {
            throw invalidEOF()
        }

        push()
    },

    [ParseState.beforePropertyName] () {
        switch (token.type) {
        case Token.identifier:
        case Token.string:
            key = token.value
            parseState = ParseState.afterPropertyName
            return

        case Token.punctuator:
            // This code is unreachable since it's handled by the lexState.
            // if (token.value !== 125 /* '}' */) {
            //     throw invalidToken()
            // }

            pop()
            return

        case Token.eof:
            throw invalidEOF()
        }

        // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()
    },

    [ParseState.afterPropertyName] () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== Token.punctuator || token.value !== 58 /* ':' */) {
        //     throw invalidToken()
        // }

        if (token.type === Token.eof) {
            throw invalidEOF()
        }

        parseState = ParseState.beforePropertyValue
    },

    [ParseState.beforePropertyValue] () {
        if (token.type === Token.eof) {
            throw invalidEOF()
        }

        push()
    },

    [ParseState.beforeArrayValue] () {
        if (token.type === Token.eof) {
            throw invalidEOF()
        }

        if (token.type === Token.punctuator && token.value === 93 /* ']' */) {
            pop()
            return
        }

        push()
    },

    [ParseState.afterPropertyValue] () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== Token.punctuator) {
        //     throw invalidToken()
        // }

        if (token.type === Token.eof) {
            throw invalidEOF()
        }

        switch (token.value) {
        case 44 /* ',' */:
            parseState = ParseState.beforePropertyName
            return

        case 125 /* '}' */:
            pop()
        }

        // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()
    },

    [ParseState.afterArrayValue] () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== Token.punctuator) {
        //     throw invalidToken()
        // }

        if (token.type === Token.eof) {
            throw invalidEOF()
        }

        switch (token.value) {
        case 44 /* ',' */:
            parseState = ParseState.beforeArrayValue
            return

        case 93 /* ']' */:
            pop()
        }

        // This code is unreachable since it's handled by the lexState.
        // throw invalidToken()
    },

    [ParseState.end] () {
        // This code is unreachable since it's handled by the lexState.
        // if (token.type !== Token.eof) {
        //     throw invalidToken()
        // }
    },
}

function push () {
    let value

    switch (token.type) {
    case Token.punctuator:
        switch (token.value) {
        case 123 /* '{' */:
            value = {}
            break

        case 91 /* '[' */:
            value = []
            break
        }

        break

    case Token.null:
    case Token.boolean:
    case Token.numeric:
    case Token.string:
        value = token.value
        break

    // This code is unreachable.
    // default:
    //     throw invalidToken()
    }

    if (root === undefined) {
        root = value
    } else {
        const parent = stack[stack.length - 1]
        if (Array.isArray(parent)) {
            parent.push(value)
        } else {
            parent[key] = value
        }
    }

    if (value !== null && typeof value === 'object') {
        stack.push(value)

        if (Array.isArray(value)) {
            parseState = ParseState.beforeArrayValue
        } else {
            parseState = ParseState.beforePropertyName
        }
    } else {
        const current = stack[stack.length - 1]
        if (current == null) {
            parseState = ParseState.end
        } else if (Array.isArray(current)) {
            parseState = ParseState.afterArrayValue
        } else {
            parseState = ParseState.afterPropertyValue
        }
    }
}

function pop () {
    stack.pop()

    const current = stack[stack.length - 1]
    if (current == null) {
        parseState = ParseState.end
    } else if (Array.isArray(current)) {
        parseState = ParseState.afterArrayValue
    } else {
        parseState = ParseState.afterPropertyValue
    }
}

// This code is unreachable.
// function invalidParseState () {
//     return new Error(`JSON5: invalid parse state '${parseState}'`)
// }

// This code is unreachable.
// function invalidLexState (state) {
//     return new Error(`JSON5: invalid lex state '${state}'`)
// }

function invalidChar (c) {
    if (c === undefined) {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
    }

    return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
}

function invalidEOF () {
    return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
}

// This code is unreachable.
// function invalidToken () {
//     if (token.type === Token.eof) {
//         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
//     }

//     const c = String.fromCodePoint(token.value.codePointAt(0))
//     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
// }

function invalidIdentifier () {
    column -= 5
    return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`)
}

function separatorChar (c) {
    console.warn(`JSON5: '${formatChar(c)}' in strings is not valid ECMAScript; consider escaping`)
}

function formatChar (c) {
    const replacements = {
        39 /* "'" */: "\\'",
        34 /* '"' */: '\\"',
        92 /* '\\' */: '\\\\',
        8 /* '\b' */: '\\b',
        12 /* '\f' */: '\\f',
        10 /* '\n' */: '\\n',
        13 /* '\r' */: '\\r',
        9 /* '\t' */: '\\t',
        11 /* '\v' */: '\\v',
        0 /* '\0' */: '\\0',
        8232 /* '\u2028' */: '\\u2028',
        8233 /* '\u2029' */: '\\u2029',
    }

    if (replacements[c]) {
        return replacements[c]
    }

    if (c < 32 /* ' ' */) {
        const hexString = c.charCodeAt(0).toString(16)
        return '\\x' + ('00' + hexString).substring(hexString.length)
    }

    return c
}

function syntaxError (message) {
    const err = new SyntaxError(message)
    err.lineNumber = line
    err.columnNumber = column
    return err
}
