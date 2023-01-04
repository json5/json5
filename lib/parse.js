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
    identifier: 4,
    numeric: 5,
    string: 6,
}

const tokenRef = {
    type: -1,
    value: '',
    line: -1,
    column: -1,
}

const FIRST_DOUBLE_LENGTH_CODE = 1 << 16
const getCodePointLength = c => c >= FIRST_DOUBLE_LENGTH_CODE ? 2 : 1

const LITERAL_ULL = [0x0075 /* 'u' */, 0x006c /* 'l' */, 0x006c]
const LITERAL_RUE = [0x0072 /* 'r' */, 0x0075 /* 'u' */, 0x0065]
const LITERAL_ALSE = [0x0061 /* 'a' */, 0x006c /* 'l' */, 0x0073 /* 's' */, 0x0065]
const LITERAL_NFINITY = [0x006e /* 'n' */, 0x0066 /* 'f' */, 0x0069 /* 'i' */, 0x006e /* 'n' */, 0x0069 /* 'i' */, 0x0074 /* 't' */, 0x0079]
const LITERAL_AN = [0x0061 /* 'a' */, 0x004e]

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
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const key = String(i)
                const replacement = internalize(value, key, reviver)
                if (replacement === undefined) {
                    delete value[key]
                } else {
                    Object.defineProperty(value, key, {
                        value: replacement,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    })
                }
            }
        } else {
            for (const key in value) {
                const replacement = internalize(value, key, reviver)
                if (replacement === undefined) {
                    delete value[key]
                } else {
                    Object.defineProperty(value, key, {
                        value: replacement,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    })
                }
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

    if (c === 0x000a /* '\n' */) {
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
    const c = skip()
    if (c === undefined) { return undefined }
    return String.fromCodePoint(c)
}

const lexStates = {
    [LexState.default] () {
        switch (c) {
        case 0x0009 /* '\t' */:
        case 0x000b /* '\v' */:
        case 0x000c /* '\f' */:
        case 0x0020 /* ' ' */:
        case 0x00a0 /* '\u00A0' */:
        case 0xfeff /* '\uFEFF' */:
        case 0x000a /* '\n' */:
        case 0x000d /* '\r' */:
        case 0x2028 /* '\u2028' */:
        case 0x2029 /* '\u2029' */:
            skip()
            return

        case 0x002f /* '/' */:
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
        case 0x002a /* '*' */:
            skip()
            lexState = LexState.multiLineComment
            return

        case 0x002f /* '/' */:
            skip()
            lexState = LexState.singleLineComment
            return
        }

        throw invalidChar(read())
    },

    [LexState.multiLineComment] () {
        switch (c) {
        case 0x002a /* '*' */:
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
        case 0x002a /* '*' */:
            skip()
            return

        case 0x002f /* '/' */:
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
        case 0x000a /* '\n' */:
        case 0x000d /* '\r' */:
        case 0x2028 /* '\u2028' */:
        case 0x2029 /* '\u2029' */:
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
        case 0x007b /* '{' */:
        case 0x005b /* '[' */:
            return newToken(Token.punctuator, skip())

        case 0x006e /* 'n' */:
            skip()
            literal(LITERAL_ULL)
            return newToken(Token.null, null)

        case 0x0074 /* 't' */:
            skip()
            literal(LITERAL_RUE)
            return newToken(Token.boolean, true)

        case 0x0066 /* 'f' */:
            skip()
            literal(LITERAL_ALSE)
            return newToken(Token.boolean, false)

        case 0x002d /* '-' */:
        case 0x002b /* '+' */:
            if (skip() === 0x002d /* '-' */) {
                sign = -1
            }

            lexState = LexState.sign
            return

        case 0x002e /* '.' */:
            buffer = read()
            lexState = LexState.decimalPointLeading
            return

        case 0x0030 /* '0' */:
            buffer = read()
            lexState = LexState.zero
            return

        case 0x0031 /* '1' */:
        case 0x0032 /* '2' */:
        case 0x0033 /* '3' */:
        case 0x0034 /* '4' */:
        case 0x0035 /* '5' */:
        case 0x0036 /* '6' */:
        case 0x0037 /* '7' */:
        case 0x0038 /* '8' */:
        case 0x0039 /* '9' */:
            buffer = read()
            lexState = LexState.decimalInteger
            return

        case 0x0049 /* 'I' */:
            skip()
            literal(LITERAL_NFINITY)
            return newToken(Token.numeric, Infinity)

        case 0x004e /* 'N' */:
            skip()
            literal(LITERAL_AN)
            return newToken(Token.numeric, NaN)

        case 0x0022 /* '"' */:
        case 0x0027 /* "'" */:
            doubleQuote = (skip() === 0x0022 /* '"' */)
            buffer = ''
            lexState = LexState.string
            return
        }

        throw invalidChar(read())
    },

    [LexState.identifierNameStartEscape] () {
        if (c !== 0x0075 /* 'u' */) {
            throw invalidChar(read())
        }

        skip()
        const u = unicodeEscape()
        switch (u) {
        case 0x0024 /* '$' */:
        case 0x005f /* '_' */:
            break

        default:
            if (!util.isIdStartChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += String.fromCodePoint(u)
        lexState = LexState.identifierName
    },

    [LexState.identifierName] () {
        switch (c) {
        case 0x0024 /* '$' */:
        case 0x005f /* '_' */:
        case 0x200c /* '\u200C' */:
        case 0x200d /* '\u200D' */:
            buffer += read()
            return

        case 0x005c /* '\\' */:
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
        if (c !== 0x0075 /* 'u' */) {
            throw invalidChar(read())
        }

        skip()
        const u = unicodeEscape()
        switch (u) {
        case 0x0024 /* '$' */:
        case 0x005f /* '_' */:
        case 0x200c /* '\u200C' */:
        case 0x200d /* '\u200D' */:
            break

        default:
            if (!util.isIdContinueChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += String.fromCodePoint(u)
        lexState = LexState.identifierName
    },

    [LexState.sign] () {
        switch (c) {
        case 0x002e /* '.' */:
            buffer = read()
            lexState = LexState.decimalPointLeading
            return

        case 0x0030 /* '0' */:
            buffer = read()
            lexState = LexState.zero
            return

        case 0x0031 /* '1' */:
        case 0x0032 /* '2' */:
        case 0x0033 /* '3' */:
        case 0x0034 /* '4' */:
        case 0x0035 /* '5' */:
        case 0x0036 /* '6' */:
        case 0x0037 /* '7' */:
        case 0x0038 /* '8' */:
        case 0x0039 /* '9' */:
            buffer = read()
            lexState = LexState.decimalInteger
            return

        case 0x0049 /* 'I' */:
            skip()
            literal(LITERAL_NFINITY)
            return newToken(Token.numeric, sign * Infinity)

        case 0x004e /* 'N' */:
            skip()
            literal(LITERAL_AN)
            return newToken(Token.numeric, NaN)
        }

        throw invalidChar(read())
    },

    [LexState.zero] () {
        switch (c) {
        case 0x002e /* '.' */:
            buffer += read()
            lexState = LexState.decimalPoint
            return

        case 0x0065 /* 'e' */:
        case 0x0045 /* 'E' */:
            buffer += read()
            lexState = LexState.decimalExponent
            return

        case 0x0078 /* 'x' */:
        case 0x0058 /* 'X' */:
            buffer += read()
            lexState = LexState.hexadecimal
            return
        }

        return newToken(Token.numeric, sign * 0)
    },

    [LexState.decimalInteger] () {
        switch (c) {
        case 0x002e /* '.' */:
            buffer += read()
            lexState = LexState.decimalPoint
            return

        case 0x0065 /* 'e' */:
        case 0x0045 /* 'E' */:
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
        case 0x0065 /* 'e' */:
        case 0x0045 /* 'E' */:
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
        case 0x0065 /* 'e' */:
        case 0x0045 /* 'E' */:
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
        case 0x002b /* '+' */:
        case 0x002d /* '-' */:
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
        case 0x005c /* '\\' */:
            skip()
            const e = escape()
            if (e !== undefined) { buffer += String.fromCodePoint(e) }
            return

        case 0x0022 /* '"' */:
            if (doubleQuote) {
                skip()
                return newToken(Token.string, buffer)
            }

            buffer += read()
            return

        case 0x0027 /* "'" */:
            if (!doubleQuote) {
                skip()
                return newToken(Token.string, buffer)
            }

            buffer += read()
            return

        case 0x000a /* '\n' */:
        case 0x000d /* '\r' */:
            throw invalidChar(read())

        case 0x2028 /* '\u2028' */:
        case 0x2029 /* '\u2029' */:
            separatorChar(c)
            break

        case undefined:
            throw invalidChar(read())
        }

        buffer += read()
    },

    [LexState.start] () {
        switch (c) {
        case 0x007b /* '{' */:
        case 0x005b /* '[' */:
            return newToken(Token.punctuator, skip())

        // This code is unreachable since the default lexState handles eof.
        // case undefined:
        //     return newToken(Token.eof)
        }

        lexState = LexState.value
    },

    [LexState.beforePropertyName] () {
        switch (c) {
        case 0x0024 /* '$' */:
        case 0x005f /* '_' */:
            buffer = read()
            lexState = LexState.identifierName
            return

        case 0x005c /* '\\' */:
            skip()
            lexState = LexState.identifierNameStartEscape
            return

        case 0x007d /* '}' */:
            return newToken(Token.punctuator, skip())

        case 0x0022 /* '"' */:
        case 0x0027 /* "'" */:
            doubleQuote = (skip() === 0x0022 /* '"' */)
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
        if (c === 0x003a /* ':' */) {
            return newToken(Token.punctuator, skip())
        }

        throw invalidChar(read())
    },

    [LexState.beforePropertyValue] () {
        lexState = LexState.value
    },

    [LexState.afterPropertyValue] () {
        switch (c) {
        case 0x002c /* ',' */:
        case 0x007d /* '}' */:
            return newToken(Token.punctuator, skip())
        }

        throw invalidChar(read())
    },

    [LexState.beforeArrayValue] () {
        if (c === 0x005d /* ']' */) {
            return newToken(Token.punctuator, skip())
        }

        lexState = LexState.value
    },

    [LexState.afterArrayValue] () {
        switch (c) {
        case 0x002c /* ',' */:
        case 0x005d /* ']' */:
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
            throw invalidChar(String.fromCodePoint(p))
        }
    }
}

function escape () {
    const c = peek()
    switch (c) {
    case 0x0062 /* 'b' */:
        skip()
        return 0x0008 /* '\b' */

    case 0x0066 /* 'f' */:
        skip()
        return 0x000c /* '\f' */

    case 0x006e /* 'n' */:
        skip()
        return 0x000a /* '\n' */

    case 0x0072 /* 'r' */:
        skip()
        return 0x000d /* '\r' */

    case 0x0074 /* 't' */:
        skip()
        return 0x0009 /* '\t' */

    case 0x0076 /* 'v' */:
        skip()
        return 0x000b /* '\v' */

    case 0x0030 /* '0' */:
        skip()
        if (util.isDigit(peek())) {
            throw invalidChar(read())
        }

        return 0x0000 /* '\0' */

    case 0x0078 /* 'x' */:
        skip()
        return hexEscape()

    case 0x0075 /* 'u' */:
        skip()
        return unicodeEscape()

    case 0x000a /* '\n' */:
    case 0x2028 /* '\u2028' */:
    case 0x2029 /* '\u2029' */:
        skip()
        return undefined

    case 0x000d /* '\r' */:
        skip()
        if (peek() === 0x000a /* '\n' */) {
            skip()
        }

        return undefined

    case 0x0031 /* '1' */:
    case 0x0032 /* '2' */:
    case 0x0033 /* '3' */:
    case 0x0034 /* '4' */:
    case 0x0035 /* '5' */:
    case 0x0036 /* '6' */:
    case 0x0037 /* '7' */:
    case 0x0038 /* '8' */:
    case 0x0039 /* '9' */:
        throw invalidChar(read())

    case undefined:
        throw invalidChar(read())
    }

    return skip()
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

    return parseInt(buffer, 16)
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

    return parseInt(buffer, 16)
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
            // if (token.value !== 0x007d /* '}' */) {
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
        // if (token.type !== Token.punctuator || token.value !== 0x003a /* ':' */) {
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

        if (token.type === Token.punctuator && token.value === 0x005d /* ']' */) {
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
        case 0x002c /* ',' */:
            parseState = ParseState.beforePropertyName
            return

        case 0x007d /* '}' */:
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
        case 0x002c /* ',' */:
            parseState = ParseState.beforeArrayValue
            return

        case 0x005d /* ']' */:
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
        case 0x007b /* '{' */:
            value = {}
            break

        case 0x005b /* '[' */:
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
            Object.defineProperty(parent, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true,
            })
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

function formatChar (n) {
    const c = typeof n === 'string' ? n.codePointAt(0) : n

    const replacements = {
        0x0027 /* "'" */: "\\'",
        0x0022 /* '"' */: '\\"',
        0x005c /* '\\' */: '\\\\',
        0x0008 /* '\b' */: '\\b',
        0x000c /* '\f' */: '\\f',
        0x000a /* '\n' */: '\\n',
        0x000d /* '\r' */: '\\r',
        0x0009 /* '\t' */: '\\t',
        0x000b /* '\v' */: '\\v',
        0x0000 /* '\0' */: '\\0',
        0x2028 /* '\u2028' */: '\\u2028',
        0x2029 /* '\u2029' */: '\\u2029',
    }

    if (replacements[c]) {
        return replacements[c]
    }

    if (c < 0x0020 /* ' ' */) {
        const hexString = c.toString(16)
        return '\\x' + ('00' + hexString).substring(hexString.length)
    }

    return String.fromCodePoint(c)
}

function syntaxError (message) {
    const err = new SyntaxError(message)
    err.lineNumber = line
    err.columnNumber = column
    return err
}
