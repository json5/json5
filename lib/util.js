import * as unicode from './unicode.js'

export function isSpaceSeparator (c) {
    return typeof c === 'string' && unicode.Space_Separator.test(c)
}

export function isIdStartChar (c) {
    return typeof c === 'string' && (
        (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c === '$') || (c === '_') ||
        unicode.ID_Start.test(c)
    )
}

export function isIdContinueChar (c) {
    return typeof c === 'string' && (
        (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') ||
        (c === '$') || (c === '_') ||
        (c === '\u200C') || (c === '\u200D') ||
        unicode.ID_Continue.test(c)
    )
}

export function isDigit (c) {
    return typeof c === 'string' && /[0-9]/.test(c)
}

export function isHexDigit (c) {
    return typeof c === 'string' && /[0-9A-Fa-f]/.test(c)
}
