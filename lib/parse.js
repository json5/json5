const util = require('./util')
const {ValueSourceWrapper, setObjectProperty, getCodePointLength} = util

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
    zero: stateCount++,
}

/* eslint-disable no-multi-spaces */
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
/* eslint-enable no-multi-spaces */

// Parsing using codepoints instead of characters based on https://github.com/json5/json5/pull/278, by @romgrk
const toChar = String.fromCodePoint

function parse (text, reviver) {
    const source = String(text)

    if (typeof reviver !== 'function') {
        reviver = undefined
    }

    let parseState = ParseState.start
    let lexState
    let root
    const stack = []
    let c
    let lastPos = 0
    let pos = 0
    let line = 1
    let column = 0
    let token
    let key
    let buffer
    let quoteChar
    let sign

    const parseStates = getParseStates()
    const lexStates = getLexStates()

    do {
        token = lex()
        parseStates[parseState]()
    } while (token.type !== 'eof')

    if (reviver) {
        root = internalize({'': root}, '', reviver)
    }

    return root

    /* Functions using variable context of parse() function */

    function getParseStates () {
        return [
            start,
            beforeArrayValue,
            beforePropertyName,
            beforePropertyValue,
            afterArrayValue,
            afterPropertyName,
            afterPropertyValue,
            end,
        ]
    }

    function getLexStates () {
        return [
            lexStart,
            lexBeforeArrayValue,
            lexBeforePropertyName,
            lexBeforePropertyValue,
            lexAfterArrayValue,
            lexAfterPropertyName,
            lexAfterPropertyValue,
            lexEnd,
            lexDefault,
            comment,
            decimalExponent,
            decimalExponentInteger,
            decimalExponentSign,
            decimalFraction,
            decimalInteger,
            decimalPoint,
            decimalPointLeading,
            hexadecimal,
            hexadecimalInteger,
            identifierName,
            identifierNameEscape,
            identifierNameStartEscape,
            multiLineComment,
            multiLineCommentAsterisk,
            lexSign,
            singleLineComment,
            string,
            value,
            zero,
        ]
    }

    function internalize (holder, name, reviver) {
        let value = holder[name]

        if (value && typeof value === 'object' && !(value instanceof ValueSourceWrapper)) {
            // noinspection JSUnresolvedReference
            // Note: looping backward over array indices allows reviver to easily shrink parent array if desired
            const keys = Object.keys(value).reverse()
            let lastLength = value.length

            for (const key of keys) {
                const replacement = internalize(value, key, reviver)

                if (replacement === undefined) {
                    if (!Array.isArray(value) || lastLength === value.length) {
                        delete value[key]
                    } else {
                        lastLength = value.length
                    }
                } else {
                    setObjectProperty(value, key, replacement)
                }
            }
        }

        if (value instanceof ValueSourceWrapper) {
            const context = {source: value.source}
            value = value.value
            return reviver.call(holder, name, value, context)
        }

        return reviver.call(holder, name, value)
    }

    function lex () {
        lexState = LexState.default
        buffer = ''
        quoteChar = ''
        sign = 1

        for (;;) {
            c = peek()
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

    function read () {
        const c = peek()

        if (c === LF || c === CR || c === LINE_SEPARATOR || c === PARAGRAPH_SEPARATOR) {
            line++
            column = 0

            if (c === CR && source.codePointAt(pos + 1) === LF) {
                ++pos
            }
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

    function readChar () {
        return toChar(read())
    }

    function lexDefault () {
        switch (c) {
        case TAB:
        case LF:
        case VT:
        case FF:
        case CR:
        case SPACE:
        case NB_SPACE:
        case LINE_SEPARATOR:
        case PARAGRAPH_SEPARATOR:
        case ZERO_WIDTH_NOBREAK_SPACE:
            read()
            return

        case SLASH:
            read()
            lexState = LexState.comment
            return

        case undefined:
            read()
            return newToken('eof')
        }

        if (util.isSpaceSeparator(c)) {
            read()
            return
        }

        return lexStates[parseState]()
    }

    function comment () {
        switch (c) {
        case ASTERISK:
            read()
            lexState = LexState.multiLineComment
            return

        case SLASH:
            read()
            lexState = LexState.singleLineComment
            return
        }

        throw invalidChar(read())
    }

    function multiLineComment () {
        switch (c) {
        case ASTERISK:
            read()
            lexState = LexState.multiLineCommentAsterisk
            return

        case undefined:
            throw invalidChar(read())
        }

        read()
    }

    function multiLineCommentAsterisk () {
        switch (c) {
        case ASTERISK:
            read()
            return

        case SLASH:
            read()
            lexState = LexState.default
            return

        case undefined:
            throw invalidChar(read())
        }

        read()
        lexState = LexState.multiLineComment
    }

    function singleLineComment () {
        switch (c) {
        case LF:
        case CR:
        case LINE_SEPARATOR:
        case PARAGRAPH_SEPARATOR:
            read()
            lexState = LexState.default
            return

        case undefined:
            read()
            return newToken('eof')
        }

        read()
    }

    function value () {
        switch (c) {
        case LEFT_BRACKET:
        case LEFT_BRACE:
            return newToken('punctuator', read())

        case LOWER_n:
            literal('null')
            return newPrimitiveToken('null', null)

        case LOWER_t:
            literal('true')
            return newPrimitiveToken('boolean', true)

        case LOWER_f:
            literal('false')
            return newPrimitiveToken('boolean', false)

        case HYPHEN:
        case PLUS:
            if (read() === HYPHEN) {
                sign = -1
            }

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
            return parseSymbolicNumber('Infinity', Infinity)

        case UPPER_N:
            return parseSymbolicNumber('NaN', NaN)

        case SINGLE_QUOTE:
        case QUOTE:
            read()
            quoteChar = c
            buffer = ''
            lexState = LexState.string
            return
        }

        throw invalidChar(read())
    }

    function identifierNameStartEscape () {
        if (c !== LOWER_u) {
            throw invalidChar(read())
        }

        read()
        const u = unicodeEscape()

        switch (u) {
        case DOLLAR:
        case UNDERSCORE:
            break

        default:
            if (!util.isIdStartChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += toChar(u)
        lexState = LexState.identifierName
    }

    function identifierName () {
        if (c === BACKSLASH) {
            read()
            lexState = LexState.identifierNameEscape
            return
        }

        if (util.isIdContinueChar(c)) {
            buffer += readChar()
            return
        }

        return newToken('identifier', buffer)
    }

    function identifierNameEscape () {
        if (c !== LOWER_u) {
            throw invalidChar(read())
        }

        read()
        const u = unicodeEscape()

        switch (u) {
        case DOLLAR:
        case UNDERSCORE:
        case ZERO_WIDTH_NON_JOINER:
        case ZERO_WIDTH_JOINER:
            break

        default:
            if (!util.isIdContinueChar(u)) {
                throw invalidIdentifier()
            }

            break
        }

        buffer += toChar(u)
        lexState = LexState.identifierName
    }

    function lexSign () {
        switch (c) {
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
            return parseSymbolicNumber('Infinity', sign * Infinity)

        case UPPER_N:
            return parseSymbolicNumber('NaN', NaN)
        }

        throw invalidChar(read())
    }

    function zero () {
        switch (c) {
        case DOT:
            buffer += readChar()
            lexState = LexState.decimalPoint
            return

        case UPPER_E:
        case LOWER_e:
            buffer += readChar()
            lexState = LexState.decimalExponent
            return

        case UPPER_X:
        case LOWER_x:
            buffer += readChar()
            lexState = LexState.hexadecimal
            return
        }

        lexState = LexState.decimalInteger
    }

    function decimalInteger () {
        switch (c) {
        case DOT:
            buffer += readChar()
            lexState = LexState.decimalPoint
            return

        case UPPER_E:
        case LOWER_e:
            buffer += readChar()
            lexState = LexState.decimalExponent
            return
        }

        if (util.isDigit(c)) {
            buffer += readChar()
            return
        }

        return newPrimitiveToken('numeric', sign * Number(buffer))
    }

    function decimalPointLeading () {
        if (util.isDigit(c)) {
            buffer += readChar()
            lexState = LexState.decimalFraction
            return
        }

        throw invalidChar(read())
    }

    function decimalPoint () {
        switch (c) {
        case UPPER_E:
        case LOWER_e:
            buffer += readChar()
            lexState = LexState.decimalExponent
            return
        }

        if (util.isDigit(c)) {
            buffer += readChar()
            lexState = LexState.decimalFraction
            return
        }

        return newPrimitiveToken('numeric', sign * Number(buffer))
    }

    function decimalFraction () {
        switch (c) {
        case UPPER_E:
        case LOWER_e:
            buffer += readChar()
            lexState = LexState.decimalExponent
            return
        }

        if (util.isDigit(c)) {
            buffer += readChar()
            return
        }

        return newPrimitiveToken('numeric', sign * Number(buffer))
    }

    function decimalExponent () {
        switch (c) {
        case PLUS:
        case HYPHEN:
            buffer += readChar()
            lexState = LexState.decimalExponentSign
            return
        }

        if (util.isDigit(c)) {
            buffer += readChar()
            lexState = LexState.decimalExponentInteger
            return
        }

        throw invalidChar(read())
    }

    function decimalExponentSign () {
        if (util.isDigit(c)) {
            buffer += readChar()
            lexState = LexState.decimalExponentInteger
            return
        }

        throw invalidChar(read())
    }

    function decimalExponentInteger () {
        if (util.isDigit(c)) {
            buffer += readChar()
            return
        }

        return newPrimitiveToken('numeric', sign * Number(buffer))
    }

    function hexadecimal () {
        if (util.isHexDigit(c)) {
            buffer += readChar()
            lexState = LexState.hexadecimalInteger
            return
        }

        throw invalidChar(read())
    }

    function hexadecimalInteger () {
        if (util.isHexDigit(c)) {
            buffer += readChar()
            return
        }

        return newPrimitiveToken('numeric', sign * Number(buffer))
    }

    function string () {
        return newPrimitiveToken('string', readString())
    }

    // Faster string reading based on https://github.com/json5/json5/pull/233, by @jlguardi
    function readString () {
        let from = pos
        let str = ''

        while (true) {
            const c = read()

            switch (c) {
            case BACKSLASH: // escape char
                str += source.substring(from, pos - 1)
                str += escape()
                from = pos
                break

            case quoteChar:
                return str + source.substring(from, pos - 1)

            case LF:
            case CR:
                throw invalidChar(c)

            case LINE_SEPARATOR:
            case PARAGRAPH_SEPARATOR:
                separatorChar(c)
                break

            case undefined:
                throw invalidChar(c)
            }
        }
    }

    function lexStart () {
        switch (c) {
        case LEFT_BRACKET:
        case LEFT_BRACE:
            return newToken('punctuator', read())
      // Shouldn't reach here with c being undefined, no need to return eof token.
        }

        lexState = LexState.value
    }

    function lexBeforePropertyName () {
        switch (c) {
        case DOLLAR:
        case UNDERSCORE:
            buffer = readChar()
            lexState = LexState.identifierName
            return

        case BACKSLASH:
            read()
            lexState = LexState.identifierNameStartEscape
            return

        case RIGHT_BRACE:
            return newToken('punctuator', read())

        case SINGLE_QUOTE:
        case QUOTE:
            read()
            quoteChar = c
            lexState = LexState.string
            return
        }

        if (util.isIdStartChar(c)) {
            buffer += readChar()
            lexState = LexState.identifierName
            return
        }

        throw invalidChar(read())
    }

    function lexAfterPropertyName () {
        if (c === COLON) {
            return newToken('punctuator', read())
        }

        throw invalidChar(read())
    }

    function lexBeforePropertyValue () {
        lexState = LexState.value
    }

    function lexAfterPropertyValue () {
        switch (c) {
        case COMMA:
        case RIGHT_BRACE:
            return newToken('punctuator', read())
        }

        throw invalidChar(read())
    }

    function lexBeforeArrayValue () {
        if (c === RIGHT_BRACKET) {
            return newToken('punctuator', read())
        }

        lexState = LexState.value
    }

    function lexAfterArrayValue () {
        switch (c) {
        case COMMA:
        case RIGHT_BRACKET:
            return newToken('punctuator', read())
        }

        throw invalidChar(read())
    }

    function lexEnd () {
    // Shouldn't reach here with c being undefined, no need to return eof token.
        throw invalidChar(read())
    }

    function newToken (type, value) {
        lastPos = pos

        return {type, value, line, column}
    }

    function newPrimitiveToken (type, value) {
        const savedLastPos = lastPos
        const token = newToken(type, value)

        if (reviver && reviver.length > 2 && parseState !== ParseState.beforePropertyName) {
            token.offset = savedLastPos
            token.source = source.slice(savedLastPos, pos).trim()
            token.value = new ValueSourceWrapper(value, token.source)
        }

        return token
    }

    function literal (s) {
        for (const c of s) {
            const p = peek()

            if (p !== c.codePointAt(0)) {
                throw invalidChar(read())
            }

            read()
        }
    }

    function escape () {
        const c = peek()
        switch (c) {
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
            if (util.isDigit(peek())) {
                throw invalidChar(read())
            }

            return '\0'

        case LOWER_x:
            read()
            return hexEscape()

        case LOWER_u:
            read()
            return toChar(unicodeEscape())

        case LF:
        case CR:
        case LINE_SEPARATOR:
        case PARAGRAPH_SEPARATOR:
            read()
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
            throw invalidChar(read())

        case undefined:
            throw invalidChar(read())
        }

        return readChar()
    }

    function hexEscape () {
        let buffer = ''
        let c = peek()

        if (!util.isHexDigit(c)) {
            throw invalidChar(read())
        }

        buffer += readChar()

        c = peek()
        if (!util.isHexDigit(c)) {
            throw invalidChar(read())
        }

        buffer += readChar()

        return toChar(parseInt(buffer, 16))
    }

    function unicodeEscape () {
        let buffer = ''
        let count = 4

        while (count-- > 0) {
            const c = peek()
            if (!util.isHexDigit(c)) {
                throw invalidChar(read())
            }

            buffer += readChar()
        }

        return parseInt(buffer, 16)
    }

    function start () {
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        push()
    }

    function beforePropertyName () {
        switch (token.type) {
        case 'identifier':
        case 'string':
            key = token.value
            parseState = ParseState.afterPropertyName
            return

        case 'punctuator':
        // Shouldn't be able to reach here with token values other than '}'.
            pop()
            return

        case 'eof':
            throw invalidEOF()
        }

    // Shouldn't be able to reach here with other tokens.
    }

    function afterPropertyName () {
    // Shouldn't be able to reach here with tokens other than type 'punctuator', value ':'.
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        parseState = ParseState.beforePropertyValue
    }

    function beforePropertyValue () {
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        push()
    }

    function beforeArrayValue () {
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        if (token.type === 'punctuator' && token.value === RIGHT_BRACKET) {
            pop()
            return
        }

        push()
    }

    function afterPropertyValue () {
    // Shouldn't be able to reach here with tokens other than type 'punctuator'.
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        switch (token.value) {
        case COMMA:
            parseState = ParseState.beforePropertyName
            return

        case RIGHT_BRACE:
            pop()
        }

    // Shouldn't be able to reach here with other tokens.
    }

    function afterArrayValue () {
    // Shouldn't be able to reach here with tokens other than type 'punctuator'.
        if (token.type === 'eof') {
            throw invalidEOF()
        }

        switch (token.value) {
        case COMMA:
            parseState = ParseState.beforeArrayValue
            return

        case RIGHT_BRACKET:
            pop()
        }

    // Shouldn't be able to reach here with other tokens.
    }

    function end () {
    // Shouldn't be able to reach here with tokens other than type 'eof'.
    }

    function parseSymbolicNumber (text, value) {
        literal(text)
        return newPrimitiveToken('numeric', value)
    }

    function push () {
        let value

        switch (token.type) {
        case 'punctuator':
            switch (token.value) {
            case LEFT_BRACE:
                value = {}
                break

            case LEFT_BRACKET:
                value = []
                break
            }

            break

        case 'null':
        case 'boolean':
        case 'numeric':
        case 'string':
            value = token.value
            break
        }

        if (root === undefined) {
            root = value
        } else {
            const parent = stack[stack.length - 1]
            if (Array.isArray(parent)) {
                parent.push(value)
            } else {
                setObjectProperty(parent, key, value)
            }
        }

        if (value !== null && typeof value === 'object' && !(value instanceof ValueSourceWrapper)) {
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

    function separatorChar (c) {
        console.warn(`JSON5: '${formatChar(c)}' in strings is not valid ECMAScript; consider escaping`)
    }

    function formatChar (c) {
        c = toChar(c)

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

    function syntaxError (message) {
        const err = new SyntaxError(message)
        err.lineNumber = line
        err.columnNumber = column
        return err
    }
}

module.exports = parse
