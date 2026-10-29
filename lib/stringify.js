import * as util from './util.js'

export function stringify (value, replacer, space) {
    const stack = []
    let indent = ''
    let propertyList
    let replacerFunc
    let gap = ''
    let quote

    if (
        replacer != null &&
        typeof replacer === 'object' &&
        !Array.isArray(replacer)
    ) {
        space = replacer.space
        quote = replacer.quote
        replacer = replacer.replacer

        if (quote != null && quote !== "'" && quote !== '"') {
            throw new TypeError(`JSON5: quote must be "'" or '"'`)
        }
    }

    if (typeof replacer === 'function') {
        replacerFunc = replacer
    } else if (Array.isArray(replacer)) {
        propertyList = []
        // Like JSON.stringify, read the length once and visit each index
        // instead of using the iterator, so getters, proxies, and overridden
        // iterators can't change which keys are included.
        const length = toLength(replacer.length)
        for (let i = 0; i < length; i++) {
            const v = replacer[i]
            let item

            if (typeof v === 'string') {
                item = v
            } else if (
                typeof v === 'number' ||
                isStringObject(v) ||
                isNumberObject(v)
            ) {
                item = String(v)
            }

            if (item !== undefined && propertyList.indexOf(item) < 0) {
                propertyList.push(item)
            }
        }
    }

    if (typeof space === 'number' || isNumberObject(space)) {
        space = Number(space)
    } else if (typeof space === 'string' || isStringObject(space)) {
        space = String(space)
    }

    if (typeof space === 'number') {
        if (space > 0) {
            space = Math.min(10, Math.floor(space))
            gap = '          '.substring(0, space)
        }
    } else if (typeof space === 'string') {
        gap = space.substring(0, 10)
    }

    return serializeProperty('', {'': value})

    function serializeProperty (key, holder) {
        let value = holder[key]
        if (value != null) {
            const toJSON5 = value.toJSON5
            if (typeof toJSON5 === 'function') {
                value = Reflect.apply(toJSON5, value, [key])
            } else {
                const toJSON = value.toJSON
                if (typeof toJSON === 'function') {
                    value = Reflect.apply(toJSON, value, [key])
                }
            }
        }

        if (replacerFunc) {
            value = replacerFunc.call(holder, key, value)
        }

        if (isNumberObject(value)) {
            value = Number(value)
        } else if (isStringObject(value)) {
            value = String(value)
        } else if (isBooleanObject(value)) {
            value = Boolean.prototype.valueOf.call(value)
        } else if (isBigIntObject(value)) {
            value = BigInt.prototype.valueOf.call(value)
        }

        switch (value) {
        case null: return 'null'
        case true: return 'true'
        case false: return 'false'
        }

        if (typeof value === 'string') {
            return quoteString(value, false)
        }

        if (typeof value === 'number') {
            return String(value)
        }

        if (typeof value === 'bigint') {
            throw new TypeError('Do not know how to serialize a BigInt')
        }

        if (typeof value === 'object') {
            return Array.isArray(value) ? serializeArray(value) : serializeObject(value)
        }

        return undefined
    }

    function quoteString (value) {
        let singleQuotes = 0
        let doubleQuotes = 0
        let product = ''

        for (let i = 0; i < value.length; i++) {
            const c = value[i]
            switch (c) {
            case "'":
                singleQuotes++
                product += c
                continue

            case '"':
                doubleQuotes++
                product += c
                continue

            case '\0':
                if (util.isDigit(value.charCodeAt(i + 1))) {
                    product += '\\x00'
                    continue
                }
            }

            const replacement = getReplacement(c)
            if (replacement) {
                product += replacement
                continue
            }

            if (c < ' ') {
                let hexString = c.charCodeAt(0).toString(16)
                product += '\\x' + ('00' + hexString).substring(hexString.length)
                continue
            }

            // Escape lone surrogates like JSON.stringify does, so the output is
            // well-formed and reads back as the same code unit instead of U+FFFD.
            if (isLoneSurrogate(value, i)) {
                product += '\\u' + c.charCodeAt(0).toString(16)
                continue
            }

            product += c
        }

        const quoteChar = quote || (singleQuotes <= doubleQuotes ? "'" : '"')

        product = product.replaceAll(quoteChar, '\\' + quoteChar)

        return quoteChar + product + quoteChar
    }

    function serializeObject (value) {
        if (stack.indexOf(value) >= 0) {
            throw TypeError('Converting circular structure to JSON5')
        }

        stack.push(value)

        let stepback = indent
        indent = indent + gap

        let keys = propertyList || Object.keys(value)
        let partial = []
        for (const key of keys) {
            const propertyString = serializeProperty(key, value)
            if (propertyString !== undefined) {
                let member = serializeKey(key) + ':'
                if (gap !== '') {
                    member += ' '
                }
                member += propertyString
                partial.push(member)
            }
        }

        let final
        if (partial.length === 0) {
            final = '{}'
        } else {
            let properties
            if (gap === '') {
                properties = partial.join(',')
                final = '{' + properties + '}'
            } else {
                let separator = ',\n' + indent
                properties = partial.join(separator)
                final = '{\n' + indent + properties + ',\n' + stepback + '}'
            }
        }

        stack.pop()
        indent = stepback
        return final
    }

    function serializeKey (key) {
        if (key.length === 0) {
            return quoteString(key, true)
        }

        const firstCodePoint = key.codePointAt(0)
        const firstChar = String.fromCodePoint(firstCodePoint)
        if (!util.isIdStartChar(firstChar, firstCodePoint)) {
            return quoteString(key, true)
        }

        for (let i = firstChar.length; i < key.length;) {
            const cp = key.codePointAt(i)
            const char = String.fromCodePoint(cp)
            if (!util.isIdContinueChar(char, cp)) {
                return quoteString(key, true)
            }

            i += char.length
        }

        return key
    }

    function serializeArray (value) {
        if (stack.indexOf(value) >= 0) {
            throw TypeError('Converting circular structure to JSON5')
        }

        stack.push(value)

        let stepback = indent
        indent = indent + gap

        let partial = []
        const length = value.length
        for (let i = 0; i < length; i++) {
            const propertyString = serializeProperty(String(i), value)
            partial.push((propertyString !== undefined) ? propertyString : 'null')
        }

        let final
        if (partial.length === 0) {
            final = '[]'
        } else {
            if (gap === '') {
                let properties = partial.join(',')
                final = '[' + properties + ']'
            } else {
                let separator = ',\n' + indent
                let properties = partial.join(separator)
                final = '[\n' + indent + properties + ',\n' + stepback + ']'
            }
        }

        stack.pop()
        indent = stepback
        return final
    }
}

// JSON.stringify decides whether an object is a Number, String, Boolean, or
// BigInt object by checking for an internal slot, such as [[StringData]], not by
// checking its prototype. `instanceof` alone gets this wrong in two cases:
//
// - `Object.create(String.prototype)` passes `instanceof String` but has no
//   [[StringData]], so it should be serialized as a plain object.
// - A String object from another realm (e.g. an iframe or `node:vm`) has
//   [[StringData]] but fails `instanceof String`, because its prototype is that
//   realm's `String.prototype`.
//
// JavaScript can't read an internal slot directly, but each built-in `valueOf`
// method throws a TypeError when its `this` value doesn't have the slot, so
// calling it is a reliable check.
function hasInternalSlot (value, type) {
    if (value === null || typeof value !== 'object') {
        return false
    }

    // Throwing is slow, so rule out most objects before calling `valueOf`.
    //
    // Most objects are plain objects or arrays from this realm, so an object
    // that inherits from this realm's `Object.prototype` but not from
    // `type.prototype` is skipped. This misses a wrapper object whose prototype
    // has been replaced with something like `Object.prototype`.
    if (value instanceof Object && !(value instanceof type)) {
        return false
    }

    // Other objects, like null-prototype objects and objects from another
    // realm, are skipped unless their `Object.prototype.toString` tag matches
    // the type, like `[object String]`. The tag comes from the internal slot for
    // Number, String, and Boolean objects, and from
    // `BigInt.prototype[Symbol.toStringTag]` for BigInt objects. This misses a
    // wrapper object that overrides `Symbol.toStringTag`, and a null-prototype
    // BigInt object. These cases are unlikely to happen in practice.
    if (Object.prototype.toString.call(value) !== `[object ${type.name}]`) {
        return false
    }

    try {
        type.prototype.valueOf.call(value)
        return true
    } catch {
        return false
    }
}

function isNumberObject (value) {
    return hasInternalSlot(value, Number)
}

function isStringObject (value) {
    return hasInternalSlot(value, String)
}

function isBooleanObject (value) {
    return hasInternalSlot(value, Boolean)
}

function isBigIntObject (value) {
    return hasInternalSlot(value, BigInt)
}

function getReplacement (c) {
    switch (c) {
    case '\\': return '\\\\'
    case '\b': return '\\b'
    case '\f': return '\\f'
    case '\n': return '\\n'
    case '\r': return '\\r'
    case '\t': return '\\t'
    case '\v': return '\\v'
    case '\0': return '\\0'
    case '\u2028': return '\\u2028'
    case '\u2029': return '\\u2029'
    }

    return undefined
}

function isHighSurrogate (code) {
    return code >= 0xD800 && code <= 0xDBFF
}

function isLowSurrogate (code) {
    return code >= 0xDC00 && code <= 0xDFFF
}

function isLoneSurrogate (string, index) {
    const code = string.charCodeAt(index)
    if (isHighSurrogate(code)) {
        return !isLowSurrogate(string.charCodeAt(index + 1))
    }

    if (isLowSurrogate(code)) {
        return !isHighSurrogate(string.charCodeAt(index - 1))
    }

    return false
}

// ToLength from the ECMAScript spec. Only a Proxy can return a length that
// isn't already a valid array length.
function toLength (value) {
    // Math.trunc converts with ToNumber, so a BigInt or Symbol throws a
    // TypeError, just like JSON.stringify.
    const length = Math.trunc(value)

    // NaN, -0, and negative numbers become 0.
    if (!(length > 0)) {
        return 0
    }

    return Math.min(length, Number.MAX_SAFE_INTEGER)
}
