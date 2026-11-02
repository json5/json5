import * as unicode from './unicode.js'

export function isSpaceSeparator (cp) {
    return (
        cp === 0x1680 ||
        (cp >= 0x2000 && cp <= 0x200A) ||
        cp === 0x202F ||
        cp === 0x205F ||
        cp === 0x3000
    )
}

export function isIdStartChar (cp) {
    if (cp < 0x80) {
        return (
            (cp >= 0x61 && cp <= 0x7A) || // a-z
            (cp >= 0x41 && cp <= 0x5A) || // A-Z
            cp === 0x24 || // $
            cp === 0x5F // _
        )
    }

    const c = String.fromCodePoint(cp)
    return unicode.ID_Start.test(c)
}

export function isIdContinueChar (cp) {
    if (cp < 0x80) {
        return (
            (cp >= 0x61 && cp <= 0x7A) || // a-z
            (cp >= 0x41 && cp <= 0x5A) || // A-Z
            (cp >= 0x30 && cp <= 0x39) || // 0-9
            cp === 0x24 || // $
            cp === 0x5F // _
        )
    }

    return (
        cp === 0x200C ||
        cp === 0x200D ||
        unicode.ID_Continue.test(String.fromCodePoint(cp))
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
