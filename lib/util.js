import * as unicode from './unicode.js'

export function isSpaceSeparator (c) {
    return unicode.Space_Separator.test(c)
}

export function isIdStartChar (c, cp) {
    if (cp < 0x80) {
        return (
            (cp >= 0x61 && cp <= 0x7A) || // a-z
            (cp >= 0x41 && cp <= 0x5A) || // A-Z
            cp === 0x24 || // $
            cp === 0x5F // _
        )
    }

    return unicode.ID_Start.test(c)
}

export function isIdContinueChar (c, cp) {
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
        unicode.ID_Continue.test(c)
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
