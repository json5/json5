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
            (c >= 0x0061 /* 'a' */ && c <= 0x007a /* 'z' */) ||
            (c >= 0x0041 /* 'A' */ && c <= 0x005a /* 'Z' */) ||
            (c === 0x0024 /* '$' */) ||
            (c === 0x005f /* '_' */)
        ) { return true }
        const s = String.fromCodePoint(c)
        return unicode.ID_Start.test(s)
    },

    isIdContinueChar (c) {
        if (!c) return false
        if (
            (c >= 0x0061 /* 'a' */ && c <= 0x007a /* 'z' */) ||
            (c >= 0x0041 /* 'A' */ && c <= 0x005a /* 'Z' */) ||
            (c >= 0x0030 /* '0' */ && c <= 0x0039 /* '9' */) ||
            (c === 0x0024 /* '$' */) || (c === 0x005f /* '_' */) ||
            (c === 0x200c /* '\u200C' */) || (c === 0x200d /* '\u200D' */)
        ) { return true }
        const s = String.fromCodePoint(c)
        return unicode.ID_Continue.test(s)
    },

    isDigit (c) {
        return (c >= 0x0030 /* '0' */ && c <= 0x0039 /* '9' */)
    },

    isHexDigit (c) {
        return (c >= 0x0030 /* '0' */ && c <= 0x0039 /* '9' */) ||
               (c >= 0x0061 /* 'a' */ && c <= 0x0066 /* 'f' */) ||
               (c >= 0x0041 /* 'A' */ && c <= 0x0046 /* 'F' */)
    },
}
