import * as unicode from './unicode.js'

export class ValueSourceWrapper {
    constructor (value, source) {
        this.value = value
        this.source = source
    }
}

export function isSpaceSeparator (c) {
    return c === 0x1680 || // OGHAM SPACE MARK
        (0x2000 <= c && c <= 0x200A) || // spaces of various kinds
        c === 0x202F || // NARROW NO-BREAK SPACE
        c === 0x205F || // MEDIUM MATHEMATICAL SPACE
        c === 0x3000 // IDEOGRAPHIC SPACE
}

export function isIdStartChar (c) {
    return !!c && (
        c === 0x24 || c === 0x5F ||
        (0x41 <= c && c <= 0x5A) ||
        (0x61 <= c && c <= 0x7A) ||
        unicode.ID_Start.test(String.fromCodePoint(c))
    )
}

export function isIdContinueChar (c) {
    return !!c && (
        c === 0x24 || c === 0x5F ||
        (0x30 <= c && c <= 0x39) ||
        (0x41 <= c && c <= 0x5A) ||
        (0x61 <= c && c <= 0x7A) ||
        c === 0x200C || c === 0x200D ||
        unicode.ID_Continue.test(String.fromCodePoint(c))
    )
}

export function isDigit (cp) {
    return cp >= 0x30 && cp <= 0x39
}

export function isHexDigit (cp) {
    return (
        (cp >= 0x30 && cp <= 0x39) || // 0-9
        (cp >= 0x41 && cp <= 0x46) || // A-F
        (cp >= 0x61 && cp <= 0x66) // a-f
    )
}

export function setObjectProperty (obj, key, value) {
    Reflect.defineProperty(obj, key, {value, writable: true, enumerable: true, configurable: true})
}

export const getCodePointLength = c => c >= 65536 ? 2 : 1
