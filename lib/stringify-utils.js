const {entirelyValidIdentifier} = require('./shared')
const escapeable = {
    "'": "'",
    '"': '"',
    '\\': '\\',
    '\b': 'b',
    '\f': 'f',
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\v': 'v',
    '\0': '0',
    '\u2028': 'u2028',
    '\u2029': 'u2029',
}

const escapeableRegex = /['"\\\b\f\n\r\t\v\0\u2028\u2029]/g
const stringifyString = (str, quote = '"') => {
    const otherQuote = quote === '"' ? "'" : '"'
    return (
        quote +
        str.replace(escapeableRegex, char =>
            char === otherQuote ? char : '\\' + escapeable[char]
        ) +
        quote
    )
}

module.exports.stringifyString = stringifyString

const stringifyProperty = (
    key,
    value,
    quote,
    indentation,
    indentString,
    newlines
) => {
    return (
        (entirelyValidIdentifier.test(key)
            ? key
            : stringifyString(key, quote)) +
        ': ' +
        stringifyValue(value, quote, indentation, indentString, newlines)
    )
}

module.exports.stringifyProperty = stringifyProperty

function stringifyValue (value, quote, indentation, indentString, newlines) {
    const type = typeof value

    if (type === 'string') {
        return stringifyString(value, quote)
    }

    if (type === 'number' || type === 'boolean' || value === null) { return String(value) }

    if (Array.isArray(value)) {
        const elements = value.map(element =>
            stringifyValue(
                element,
                quote,
                indentation + indentString,
                indentString,
                true
            )
        )

        if (newlines) {
            return (
                `[\n${indentation + indentString}` +
                elements.join(`,\n${indentation + indentString}`) +
                `\n${indentation}]`
            )
        }

        return `[ ${elements.join(', ')} ]`
    }

    if (type === 'object') {
        const keys = Object.keys(value)
        const properties = keys.map(key =>
            stringifyProperty(
                key,
                value[key],
                quote,
                indentation + indentString,
                indentString,
                newlines
            )
        )

        if (newlines) {
            return (
                `{${indentation + indentString}` +
                properties.join(`,${indentation + indentString}`) +
                `${indentation}}`
            )
        }

        return `{ ${properties.join(', ')} }`
    }

    throw new Error(`Cannot stringify ${type}`)
}

module.exports.stringifyValue = stringifyValue
