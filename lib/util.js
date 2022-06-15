const unicode = require('../lib/unicode')

module.exports = {
    isSpaceSeparator (c) {
        switch (c) {
            case 0x1680:
            case 0x2000:
            case 0x2001:
            case 0x2002:
            case 0x2003:
            case 0x2004:
            case 0x2005:
            case 0x2006:
            case 0x2007:
            case 0x2008:
            case 0x2009:
            case 0x200A:
            case 0x202F:
            case 0x205F:
            case 0x3000:
                return true
        }
        return false
    },

    isIdStartChar (c) {
        if (!c) return false
        if (
            (c >= 97 /* 'a' */ && c <= 122 /* 'z' */) ||
            (c >= 65 /* 'A' */ && c <= 90 /* 'Z' */) ||
            (c === 36 /* '$' */) ||
            (c === 95 /* '_' */)
        )
            return true
        const s = String.fromCodePoint(c)
        return unicode.ID_Start.test(s)
    },

    isIdContinueChar (c) {
        if (!c) return false
        if (
            (c >= 97 /* 'a' */ && c <= 122 /* 'z' */) ||
            (c >= 65 /* 'A' */ && c <= 90 /* 'Z' */) ||
            (c >= 48 /* '0' */ && c <= 57 /* '9' */) ||
            (c === 36 /* '$' */) || (c === 95 /* '_' */) ||
            (c === 8204 /* '\u200C' */) || (c === 8205 /* '\u200D' */)
        )
            return true
        const s = String.fromCodePoint(c)
        return unicode.ID_Continue.test(s)
    },

    isDigit (c) {
        return (c >= 48 /* '0' */ && c <= 57 /* '9' */)
    },

    isHexDigit (c) {
        return (c >= 48 /* '0' */ && c <= 57 /* '9' */) ||
               (c >= 97 /* 'a' */ && c <= 102 /* 'f' */) ||
               (c >= 65 /* 'A' */ && c <= 70 /* 'F' */)
    },
}
