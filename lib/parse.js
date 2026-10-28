import {
    getCodePointLength, isDigit, isHexDigit, isIdContinueChar, isIdStartChar,
    isSpaceSeparator, setObjectProperty, ValueSourceWrapper
} from "./util.js";


let stateCount = 0
// Integer parse states (instead of strings) based on https://github.com/json5/json5/pull/278, by @romgrk
const ParseState = {
    start: stateCount++,
    beforeArrayValue: stateCount++,
    beforePropertyName: stateCount++,
    beforePropertyValue: stateCount++,
    afterArrayValue: stateCount++,
    afterPropertyName: stateCount++,
    afterPropertyValue: stateCount++,
    end: stateCount++,
}

const LexState = {
    default: stateCount++,
    comment: stateCount++,
    decimalExponent: stateCount++,
    decimalExponentInteger: stateCount++,
    decimalExponentSign: stateCount++,
    decimalFraction: stateCount++,
    decimalInteger: stateCount++,
    decimalPoint: stateCount++,
    decimalPointLeading: stateCount++,
    hexadecimal: stateCount++,
    hexadecimalInteger: stateCount++,
    identifierName: stateCount++,
    identifierNameEscape: stateCount++,
    identifierNameStartEscape: stateCount++,
    multiLineComment: stateCount++,
    multiLineCommentAsterisk: stateCount++,
    sign: stateCount++,
    singleLineComment: stateCount++,
    string: stateCount++,
    value: stateCount++,
    zero: stateCount,
}

const TAB                      = 0x0009
const LF                       = 0x000A
const VT                       = 0x000B
const FF                       = 0x000C
const CR                       = 0x000D
const SPACE                    = 0x0020
const DOLLAR                   = 0x0024
const SINGLE_QUOTE             = 0x0027
const ASTERISK                 = 0x002A
const PLUS                     = 0x002B
const COMMA                    = 0x002C
const DOT                      = 0x002E
const SLASH                    = 0x002F
const QUOTE                    = 0x0022
const HYPHEN                   = 0x002D
const ZERO                     = 0x0030
const ONE                      = 0x0031
const TWO                      = 0x0032
const THREE                    = 0x0033
const FOUR                     = 0x0034
const FIVE                     = 0x0035
const SIX                      = 0x0036
const SEVEN                    = 0x0037
const EIGHT                    = 0x0038
const NINE                     = 0x0039
const COLON                    = 0x003A
const UPPER_E                  = 0x0045
const UPPER_I                  = 0x0049
const UPPER_N                  = 0x004E
const UPPER_X                  = 0x0058
const LEFT_BRACKET             = 0x005B
const RIGHT_BRACKET            = 0x005D
const BACKSLASH                = 0x005C
const UNDERSCORE               = 0x005F
const LOWER_b                  = 0x0062
const LOWER_e                  = 0x0065
const LOWER_f                  = 0x0066
const LOWER_n                  = 0x006E
const LOWER_r                  = 0x0072
const LOWER_t                  = 0x0074
const LOWER_u                  = 0x0075
const LOWER_v                  = 0x0076
const LOWER_x                  = 0x0078
const LEFT_BRACE               = 0x007B
const RIGHT_BRACE              = 0x007D
const NB_SPACE                 = 0x00A0
const ZERO_WIDTH_NON_JOINER    = 0x200C
const ZERO_WIDTH_JOINER        = 0x200D
const LINE_SEPARATOR           = 0x2028
const PARAGRAPH_SEPARATOR      = 0x2029
const ZERO_WIDTH_NOBREAK_SPACE = 0xFEFF

// Parsing using codepoints instead of characters based on https://github.com/json5/json5/pull/278, by @romgrk
// const toChar = String.fromCodePoint

const TOKEN_EOF = 0
const TOKEN_PUNCTUATOR = 1
const TOKEN_NULL = 2
const TOKEN_BOOLEAN = 3
const TOKEN_NUMERIC = 4
const TOKEN_STRING = 5
const TOKEN_IDENTIFIER = 6

export function parse (source, reviver, options) {
    let parseState = ParseState.start
    let stack = []
    let lastPos = 0
    let pos = 0
    let line = 1
    let column = 0
    let tokenType = undefined
    let tokenValue = undefined
    let key = undefined
    let root = undefined
    let bigint = false
    let lexState
    let buffer
    let doubleQuote
    let sign
    let cp

    // parse(text, options): an object in the reviver position is the options.
    if (reviver != null &&
        typeof reviver === 'object' &&
        !Array.isArray(reviver)
    ) {
        options = reviver
        reviver = undefined
    }

    if (options != null && options.bigint != null) {
        if (typeof options.bigint !== 'boolean') {
            throw new TypeError('JSON5: bigint must be a boolean')
        }

        bigint = options.bigint
    }

    do {
        lex()
        processParseState(parseState)
    } while (tokenType !== TOKEN_EOF)

    if (typeof reviver === 'function') {
        return internalize({'': root}, '', reviver)
    }

    return root

    function internalize (holder, name, reviver) {
        const value = holder[name]
        if (value != null && typeof value === 'object' && !(value instanceof ValueSourceWrapper)) {
            // Like JSON.parse, ignore rejected property updates but propagate errors
            // thrown by the reviver or by proxy traps.
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    const key = String(i)
                    const replacement = internalize(value, key, reviver)
                    if (replacement === undefined) {
                        Reflect.deleteProperty(value, key)
                    } else {
                        setObjectProperty(value, key, replacement)
                    }
                }
            } else {
                for (const key in value) {
                    const replacement = internalize(value, key, reviver)
                    if (replacement === undefined) {
                        Reflect.deleteProperty(value, key)
                    } else {
                        setObjectProperty(value, key, replacement)
                    }
                }
            }
        }

        if (value instanceof ValueSourceWrapper) {
            return reviver.call(holder, name, value.value, {source: value.source})
        }

        return reviver.call(holder, name, value)
    }

    function lex () {
        lexState = LexState.default
        buffer = ''
        doubleQuote = false
        sign = 1

        for (;;) {
            cp = source[pos] && source.codePointAt(pos)

            if (processLexState(lexState)) {
                return
            }
        }
    }

    function peekCodePoint () {
        return source.codePointAt(pos)
    }

    function read () {
        const cp = source[pos] && source.codePointAt(pos)

        if (cp === undefined) {
            column++
            return undefined
        }

        if (cp === LF) {
            line++
            column = 0
        } else {
            column += getCodePointLength(cp)
        }

        if (cp) {
            pos += getCodePointLength(cp);
        }

        return cp
    }

    function readChar () {
        const cp = read();
        return cp && String.fromCodePoint(cp)
    }

    function processLexState (state) {
        switch (state) {
        case LexState.default:
            switch (cp) {
            case TAB:
            case VT:
            case FF:
            case SPACE:
            case NB_SPACE:
            case ZERO_WIDTH_NOBREAK_SPACE:
            case LF:
            case CR:
            case LINE_SEPARATOR:
            case PARAGRAPH_SEPARATOR:
                read()
                return

            case SLASH:
                read()
                lexState = LexState.comment
                return

            case undefined:
                read()
                return newToken(TOKEN_EOF)
            }

            if (isSpaceSeparator(cp)) {
                read()
                return
            }

            return processLexState(parseState)

        case LexState.comment:
            switch (cp) {
            case ASTERISK:
                read()
                lexState = LexState.multiLineComment
                return

            case SLASH:
                read()
                lexState = LexState.singleLineComment
                return
            }

            throw invalidChar(readChar())

        case LexState.multiLineComment:
            switch (cp) {
            case ASTERISK:
                read()
                lexState = LexState.multiLineCommentAsterisk
                return

            case undefined:
                throw invalidChar(readChar())
            }

            read()
            return

        case LexState.multiLineCommentAsterisk:
            switch (cp) {
            case ASTERISK:
                read()
                return

            case SLASH:
                read()
                lexState = LexState.default
                return

            case undefined:
                throw invalidChar(readChar())
            }

            read()
            lexState = LexState.multiLineComment
            return

        case LexState.singleLineComment:
            switch (cp) {
            case LF:
            case CR:
            case LINE_SEPARATOR:
            case PARAGRAPH_SEPARATOR:
                read()
                lexState = LexState.default
                return

            case undefined:
                read()
                return newToken(TOKEN_EOF)
            }

            read()
            return

        case LexState.value:
            switch (cp) {
            case LEFT_BRACE:
            case LEFT_BRACKET:
                return newToken(TOKEN_PUNCTUATOR, readChar())

            case LOWER_n:
                read()
                literal('ull')
                return newPrimitiveToken(TOKEN_NULL, null)

            case LOWER_t:
                read()
                literal('rue')
                return newPrimitiveToken(TOKEN_BOOLEAN, true)

            case LOWER_f:
                read()
                literal('alse')
                return newPrimitiveToken(TOKEN_BOOLEAN, false)

            case HYPHEN:
            case PLUS:
                if (cp === HYPHEN) {
                    sign = -1
                }

                read()
                lexState = LexState.sign
                return

            case DOT:
                buffer = readChar()
                lexState = LexState.decimalPointLeading
                return

            case ZERO:
                buffer = readChar()
                lexState = LexState.zero
                return

            case ONE:
            case TWO:
            case THREE:
            case FOUR:
            case FIVE:
            case SIX:
            case SEVEN:
            case EIGHT:
            case NINE:
                buffer = readChar()
                lexState = LexState.decimalInteger
                return

            case UPPER_I:
                read()
                literal('nfinity')
                return newPrimitiveToken(TOKEN_NUMERIC, Infinity)

            case UPPER_N:
                read()
                literal('aN')
                return newPrimitiveToken(TOKEN_NUMERIC, NaN)

            case QUOTE:
            case SINGLE_QUOTE:
                doubleQuote = (cp === QUOTE)
                read()
                buffer = ''
                lexState = LexState.string
                return
            }

            throw invalidChar(readChar())

        case LexState.identifierNameStartEscape: {
            if (cp !== LOWER_u) {
                throw invalidChar(readChar())
            }

            read()
            const u = unicodeEscape()
            if (!isIdStartChar(u.codePointAt(0))) {
                throw invalidIdentifier()
            }

            buffer += u
            lexState = LexState.identifierName
            return
        }

        case LexState.identifierName:
            switch (cp) {
            case DOLLAR:
            case UNDERSCORE:
            case ZERO_WIDTH_NON_JOINER:
            case ZERO_WIDTH_JOINER:
                buffer += readChar()
                return

            case BACKSLASH:
                read()
                lexState = LexState.identifierNameEscape
                return
            }

            if (isIdContinueChar(cp)) {
                buffer += readChar()
                return
            }

            return newToken(TOKEN_IDENTIFIER, buffer)

        case LexState.identifierNameEscape: {
            if (cp !== LOWER_u) {
                throw invalidChar(readChar())
            }

            read()
            const u = unicodeEscape()
            if (!isIdContinueChar(u.codePointAt(0))) {
                throw invalidIdentifier()
            }

            buffer += u
            lexState = LexState.identifierName
            return
        }

        case LexState.sign:
            switch (cp) {
            case DOT:
                buffer = readChar()
                lexState = LexState.decimalPointLeading
                return

                case ZERO:
                buffer = readChar()
                lexState = LexState.zero
                return

            case ONE:
            case TWO:
            case THREE:
            case FOUR:
            case FIVE:
            case SIX:
            case SEVEN:
            case EIGHT:
            case NINE:
                buffer = readChar()
                lexState = LexState.decimalInteger
                return

            case UPPER_I:
                read()
                literal('nfinity')
                return newPrimitiveToken(TOKEN_NUMERIC, sign * Infinity)

            case UPPER_N:
                read()
                literal('aN')
                return newPrimitiveToken(TOKEN_NUMERIC, NaN)
            }

            throw invalidChar(readChar())

        case LexState.zero:
            switch (cp) {
            case DOT:
                buffer += readChar()
                lexState = LexState.decimalPoint
                return

            case LOWER_e:
            case UPPER_E:
                buffer += readChar()
                lexState = LexState.decimalExponent
                return

            case LOWER_x:
            case UPPER_X:
                buffer += readChar()
                lexState = LexState.hexadecimal
                return
            }

            return newPrimitiveToken(TOKEN_NUMERIC, sign < 0 ? -0 : 0)

        case LexState.decimalInteger:
            switch (cp) {
            case DOT:
                buffer += readChar()
                lexState = LexState.decimalPoint
                return

            case LOWER_e:
            case UPPER_E:
                buffer += readChar()
                lexState = LexState.decimalExponent
                return
            }

            if (isDigit(cp)) {
                buffer += readChar()
                return
            }

            return newPrimitiveToken(TOKEN_NUMERIC, integerLiteral())

        case LexState.decimalPointLeading:
            if (isDigit(cp)) {
                buffer += readChar()
                lexState = LexState.decimalFraction
                return
            }

            throw invalidChar(readChar())

        case LexState.decimalPoint:
            switch (cp) {
            case LOWER_e:
            case UPPER_E:
                buffer += readChar()
                lexState = LexState.decimalExponent
                return
            }

            if (isDigit(cp)) {
                buffer += readChar()
                lexState = LexState.decimalFraction;
                return
            }

            return newPrimitiveToken(TOKEN_NUMERIC, sign * Number(buffer))

        case LexState.decimalFraction:
            switch (cp) {
            case LOWER_e:
            case UPPER_E:
                buffer += readChar()
                lexState = LexState.decimalExponent
                return
            }

            if (isDigit(cp)) {
                buffer += readChar()
                return
            }

            return newPrimitiveToken(TOKEN_NUMERIC, sign * Number(buffer))

        case LexState.decimalExponent:
            switch (cp) {
            case PLUS:
            case HYPHEN:
                buffer += readChar()
                lexState = LexState.decimalExponentSign
                return
            }

            if (isDigit(cp)) {
                buffer += readChar()
                lexState = LexState.decimalExponentInteger;
                return
            }

            throw invalidChar(readChar())

        case LexState.decimalExponentSign:
            if (isDigit(cp)) {
                buffer += readChar()
                lexState = LexState.decimalExponentInteger
                return
            }

            throw invalidChar(readChar())

        case LexState.decimalExponentInteger:
            if (isDigit(cp)) {
                buffer += readChar()
                return
            }

            return newToken(TOKEN_NUMERIC, sign * Number(buffer))

        case LexState.hexadecimal:
            if (isHexDigit(cp)) {
                buffer += readChar()
                lexState = LexState.hexadecimalInteger
                return
            }

            throw invalidChar(readChar())

        case LexState.hexadecimalInteger:
            if (isHexDigit(cp)) {
                buffer += readChar()
                return
            }

            return newPrimitiveToken(TOKEN_NUMERIC, integerLiteral())

        case LexState.string:
            switch (cp) {
            case BACKSLASH:
                read()
                buffer += escape()
                return

            case QUOTE:
                if (doubleQuote) {
                    read()
                    return newPrimitiveToken(TOKEN_STRING, buffer)
                }

                buffer += readChar()
                return

            case SINGLE_QUOTE:
                if (!doubleQuote) {
                    read()
                    return newPrimitiveToken(TOKEN_STRING, buffer)
                }

                buffer += readChar()
                return

            case LF:
            case CR:
            case undefined:
                throw invalidChar(readChar())
            }

            buffer += readChar()
            return

        case ParseState.start:
            switch (cp) {
            case LEFT_BRACE:
            case LEFT_BRACKET:
                return newToken(TOKEN_PUNCTUATOR, readChar())
            }

            lexState = LexState.value;
            return

        case ParseState.beforePropertyName:
            switch (cp) {
            case DOLLAR:
            case UNDERSCORE:
                buffer = readChar()
                lexState = LexState.identifierName
                return

            case BACKSLASH:
                readChar()
                lexState = LexState.identifierNameStartEscape
                return

            case RIGHT_BRACE:
                return newToken(TOKEN_PUNCTUATOR, readChar())

            case QUOTE:
            case SINGLE_QUOTE:
                doubleQuote = (cp === QUOTE)
                read()
                lexState = LexState.string
                return
            }

            if (isIdStartChar(cp)) {
                buffer += readChar()
                lexState = LexState.identifierName;
                return
            }

            throw invalidChar(readChar())

        case ParseState.afterPropertyName:
            if (cp === COLON) {
                return newToken(TOKEN_PUNCTUATOR, readChar())
            }

            throw invalidChar(readChar())

        case ParseState.beforePropertyValue:
            lexState = LexState.value
            return

        case ParseState.afterPropertyValue:
            switch (cp) {
                case COMMA:
                case RIGHT_BRACE:
                    return newToken(TOKEN_PUNCTUATOR, readChar())
            }

            throw invalidChar(readChar())

        case ParseState.beforeArrayValue:
            if (cp === RIGHT_BRACKET) {
                return newToken(TOKEN_PUNCTUATOR, readChar())
            }

            lexState = LexState.value
            return

        case ParseState.afterArrayValue:
            switch (cp) {
            case COMMA:
            case RIGHT_BRACKET:
                return newToken(TOKEN_PUNCTUATOR, readChar())
            }

            throw invalidChar(readChar())

        case ParseState.end:
            throw invalidChar(readChar())
        }
    }

    function newToken (type, value) {
        lastPos = pos
        tokenType = type
        tokenValue = value
        return true
    }

    function newPrimitiveToken (type, value) {
        const savedLastPos = lastPos
        newToken(type, value)

        if (reviver?.length > 2 && parseState !== ParseState.beforePropertyName) {
            tokenValue = new ValueSourceWrapper(value, source.slice(savedLastPos, pos).trim())
        }

        return true
    }

    function literal (s) {
        for (let i = 0; i < s.length; i++) {
            if (peekCodePoint() !== s.charCodeAt(i)) {
                throw invalidChar(readChar())
            }

            read()
        }
    }

    function escape () {
        switch (peekCodePoint()) {
        case LOWER_b:
            read()
            return '\b'

        case LOWER_f:
            read()
            return '\f'

        case LOWER_n:
            read()
            return '\n'

        case LOWER_r:
            read()
            return '\r'

        case LOWER_t:
            read()
            return '\t'

        case LOWER_v:
            read()
            return '\v'

        case ZERO:
            read()
            if (isDigit(peekCodePoint())) {
                throw invalidChar(readChar())
            }

            return '\0'

        case LOWER_x:
            read()
            return hexEscape()

        case LOWER_u:
            read()
            return unicodeEscape()

        case LF:
        case LINE_SEPARATOR:
        case PARAGRAPH_SEPARATOR:
            read()
            return ''

        case CR:
            read()
            if (peekCodePoint() === 0x0A) {
                read()
            }

            return ''

        case ONE:
        case TWO:
        case THREE:
        case FOUR:
        case FIVE:
        case SIX:
        case SEVEN:
        case EIGHT:
        case NINE:
        case undefined:
            throw invalidChar(readChar())
        }

        return readChar()
    }

    function hexEscape () {
        let buffer = ''

        if (!isHexDigit(peekCodePoint())) {
            throw invalidChar(readChar())
        }

        buffer += readChar()

        if (!isHexDigit(peekCodePoint())) {
            throw invalidChar(readChar())
        }

        buffer += readChar()

        return String.fromCodePoint(parseInt(buffer, 16))
    }

    function unicodeEscape () {
        let buffer = ''
        let count = 4

        while (count-- > 0) {
            if (!isHexDigit(peekCodePoint())) {
                throw invalidChar(readChar())
            }

            buffer += readChar()
        }

        return String.fromCodePoint(parseInt(buffer, 16))
    }

    function processParseState (state) {
        switch (state) {
        case ParseState.start:
            if (tokenType === TOKEN_EOF) {
                throw invalidEOF()
            }

            push()
            return

        case ParseState.beforePropertyName:
            switch (tokenType) {
            case TOKEN_IDENTIFIER:
            case TOKEN_STRING:
                key = tokenValue
                parseState = ParseState.afterPropertyName
                return

            case TOKEN_PUNCTUATOR:
                pop()
                return

            case TOKEN_EOF:
                throw invalidEOF()
            }

            return

        case ParseState.afterPropertyName:
            if (tokenType === TOKEN_EOF) {
                throw invalidEOF()
            }

            parseState = ParseState.beforePropertyValue
            return

        case ParseState.beforePropertyValue:
            if (tokenType === TOKEN_EOF) {
                throw invalidEOF()
            }

            push()
            return

        case ParseState.beforeArrayValue: {
            if (tokenType === TOKEN_EOF) {
                throw invalidEOF()
            }

            if (tokenType === TOKEN_PUNCTUATOR && tokenValue === ']') {
                pop()
                return
            }

            push()
            return
        }

        case ParseState.afterPropertyValue:
            if (tokenType === TOKEN_EOF) {
                throw invalidEOF()
            }

            switch (tokenValue) {
            case ',':
                parseState = ParseState.beforePropertyName
                return

            case '}':
                pop()
            }

            return

        case ParseState.afterArrayValue:
            if (tokenType === TOKEN_EOF) {
                throw invalidEOF()
            }

            switch (tokenValue) {
            case ',':
                parseState = ParseState.beforeArrayValue
                return

            case ']':
                pop()
            }

            return

        case ParseState.end:
            return
        }
    }

    function push () {
        let value

        switch (tokenType) {
        case TOKEN_PUNCTUATOR:
            switch (tokenValue) {
            case '{':
                value = {}
                break

            case '[':
                value = []
                break
            }

            break

        case TOKEN_NULL:
        case TOKEN_BOOLEAN:
        case TOKEN_NUMERIC:
        case TOKEN_STRING:
            value = tokenValue
            break
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

        if (value !== null && typeof value === 'object' && !(value instanceof ValueSourceWrapper)) {
            stack.push(value)

            if (Array.isArray(value)) {
                parseState = ParseState.beforeArrayValue;
            } else {
                parseState = ParseState.beforePropertyName;
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

    function invalidChar (c) {
        if (c === undefined) {
            return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
        }

        return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
    }

    function invalidEOF () {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
    }

    function invalidIdentifier () {
        column -= 5
        return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`)
    }

    function formatChar (c) {
        const replacements = {
            "'": "\\'",
            '"': '\\"',
            '\\': '\\\\',
            '\b': '\\b',
            '\f': '\\f',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '\v': '\\v',
            '\0': '\\0',
            '\u2028': '\\u2028',
            '\u2029': '\\u2029',
        }

        if (replacements[c]) {
            return replacements[c]
        }

        if (c < ' ') {
            const hexString = c.charCodeAt(0).toString(16)
            return '\\x' + ('00' + hexString).substring(hexString.length)
        }

        return c
    }

    // Integer literals outside the safe integer range lose precision as numbers. With
    // the `bigint` option they are returned as BigInts instead (see #292).
    function integerLiteral () {
        const value = sign * Number(buffer)
        if (bigint && !Number.isSafeInteger(value)) {
            return sign < 0 ? -BigInt(buffer) : BigInt(buffer)
        }

        return value
    }

    function syntaxError (message) {
        const err = new SyntaxError(message)
        err.lineNumber = line
        err.columnNumber = column
        return err
    }
}
