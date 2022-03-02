const {whitespace, SINGLE_QUOTE, DOUBLE_QUOTE} = require('./shared')

const parseAST = require('./parse-ast')
const {
    stringifyValue,
    stringifyProperty,
    stringifyString,
} = require('./stringify-utils')

module.exports = function patch (str, value) {
    const counts = {}
    counts[SINGLE_QUOTE] = 0
    counts[DOUBLE_QUOTE] = 0

    const indentString = guessIndentString(str)

    const root = parseAST(str, {
        onValue: node => {
            if (node.type === 'Literal' && typeof node.value === 'string') {
                counts[node.raw[0]] += 1
            }
        },
    })

    const quote =
        counts[SINGLE_QUOTE] > counts[DOUBLE_QUOTE]
            ? SINGLE_QUOTE
            : DOUBLE_QUOTE

    const newlines =
        /\n/.test(str.slice(root.start, root.end)) ||
        (root.type === 'ArrayExpression' && root.elements.length === 0) ||
        (root.type === 'ObjectExpression' && root.properties.length === 0)

    return (
        str.slice(0, root.start) +
        patchValue(root, value, str, '', indentString, quote, newlines) +
        str.slice(root.end)
    )
}

function patchValue (
    node,
    value,
    str,
    indentation,
    indentString,
    quote,
    newlines
) {
    const type = typeof value

    if (type === 'string') {
        if (node.type === 'Literal' && typeof node.value === 'string') {
            // preserve quote style
            return stringifyString(value, node.raw[0])
        }

        return stringifyString(value, quote)
    }

    if (type === 'number') {
        return patchNumber(node.raw, value)
    }

    if (type === 'boolean' || value === null) {
        return String(value)
    }

    if (Array.isArray(value)) {
        if (node.type === 'ArrayExpression') {
            return patchArray(
                node,
                value,
                str,
                indentation,
                indentString,
                quote,
                newlines
            )
        }

        return stringifyValue(
            value,
            quote,
            indentation,
            indentString,
            newlines
        )
    }

    if (type === 'object') {
        if (node.type === 'ObjectExpression') {
            return patchObject(
                node,
                value,
                str,
                indentation,
                indentString,
                quote,
                newlines
            )
        }

        return stringifyValue(
            value,
            quote,
            indentation,
            indentString,
            newlines
        )
    }

    throw new Error(`Cannot stringify ${type}s`)
}

function patchNumber (raw, value) {
    const matchRadix = /^([-+])?0([boxBOX])/.exec(raw)

    if (matchRadix && value % 1 === 0) {
        return (
            (matchRadix[1] === '+' && value >= 0 ? '+' : value < 0 ? '-' : '') +
            '0' +
            matchRadix[2] +
            Math.abs(value).toString(
                matchRadix[2] === 'b' || matchRadix[2] === 'B'
                    ? 2
                    : matchRadix[2] === 'o' || matchRadix[2] === 'O'
                        ? 8
                        : matchRadix[2] === 'x' || matchRadix[2] === 'X'
                            ? 16
                            : null
            )
        )
    }

    const match = /^([-+])?(\.)?/.exec(raw)

    if (match && match[0].length > 0) {
        return (
            (match[1] === '+' && value >= 0 ? '+' : value < 0 ? '-' : '') +
            (match[2]
                ? String(Math.abs(value)).replace(/^0/, '')
                : String(Math.abs(value)))
        )
    }

    return String(value)
}

function patchArray (
    node,
    value,
    str,
    indentation,
    indentString,
    quote
) {
    if (value.length === 0) {
        return node.elements.length === 0
            ? str.slice(node.start, node.end)
            : '[]'
    }

    const precedingWhitespace = getPrecedingWhitespace(str, node.start)
    const empty = precedingWhitespace === ''
    const newline = empty || /\n/.test(precedingWhitespace)

    if (node.elements.length === 0) {
        return stringifyValue(value, quote, indentation, indentString, newline)
    }

    let i = 0
    let c = node.start
    let patched = ''
    const newlinesInsideValue =
        str.slice(node.start, node.end).split('\n').length > 1

    for (; i < value.length; i += 1) {
        const element = node.elements[i]

        if (element) {
            patched +=
                str.slice(c, element.start) +
                patchValue(
                    element,
                    value[i],
                    str,
                    indentation,
                    indentString,
                    quote,
                    newlinesInsideValue
                )

            c = element.end
        } else {
            // append new element
            if (newlinesInsideValue) {
                patched +=
                    `,\n${indentation + indentString}` +
                    stringifyValue(
                        value[i],
                        quote,
                        indentation,
                        indentString,
                        true
                    )
            } else {
                patched +=
                    `, ` +
                    stringifyValue(
                        value[i],
                        quote,
                        indentation,
                        indentString,
                        false
                    )
            }
        }
    }

    if (i < node.elements.length) {
        c = node.elements[node.elements.length - 1].end
    }

    patched += str.slice(c, node.end)
    return patched
}

function patchObject (node, value, str, indentation, indentString, quote) {
    const keys = Object.keys(value)

    if (keys.length === 0) {
        return node.properties.length === 0
            ? str.slice(node.start, node.end)
            : '{}'
    }

    const existingProperties = {}
    node.properties.forEach(prop => {
        existingProperties[prop.key.name] = prop
    })

    const precedingWhitespace = getPrecedingWhitespace(str, node.start)
    const empty = precedingWhitespace === ''
    const newline = empty || /\n/.test(precedingWhitespace)

    if (node.properties.length === 0) {
        return stringifyValue(value, quote, indentation, indentString, newline)
    }

    let i = 0
    let c = node.start
    let patched = ''
    const newlinesInsideValue = /\n/.test(str.slice(node.start, node.end))

    let started = false
    const intro = str.slice(node.start, node.properties[0].start)

    for (; i < node.properties.length; i += 1) {
        const property = node.properties[i]
        const propertyValue = value[property.key.name]

        indentation = getIndentation(str, property.start)

        if (propertyValue !== undefined) {
            patched += started
                ? str.slice(c, property.value.start)
                : intro + str.slice(property.key.start, property.value.start)

            patched += patchValue(
                property.value,
                propertyValue,
                str,
                indentation,
                indentString,
                quote,
                newlinesInsideValue
            )

            started = true
        }

        c = property.end
    }

    // append new properties
    keys.forEach(key => {
        if (key in existingProperties) return

        const propertyValue = value[key]

        patched +=
            (started
                ? ',' + (newlinesInsideValue ? indentation : ' ')
                : intro) +
            stringifyProperty(
                key,
                propertyValue,
                quote,
                indentation,
                indentString,
                newlinesInsideValue
            )
        started = true
    })

    patched += str.slice(c, node.end)
    return patched
}

function getIndentation (str, i) {
    while (i > 0 && !whitespace.test(str[i - 1])) i -= 1
    const end = i

    while (i > 0 && whitespace.test(str[i - 1])) i -= 1
    return str.slice(i, end)
}

function getPrecedingWhitespace (str, i) {
    const end = i

    while (i > 0 && whitespace.test(str[i])) i -= 1
    return str.slice(i, end)
}

function guessIndentString (str) {
    const lines = str.split('\n')

    let tabs = 0
    let spaces = 0
    let minSpaces = 8

    lines.forEach(line => {
        const match = /^(?: +|\t+)/.exec(line)
        if (!match) return

        const whitespace = match[0]
        if (whitespace.length === line.length) return

        if (whitespace[0] === '\t') {
            tabs += 1
        } else {
            spaces += 1
            if (whitespace.length > 1 && whitespace.length < minSpaces) {
                minSpaces = whitespace.length
            }
        }
    })

    if (spaces > tabs) {
        let result = ''
        while (minSpaces--) result += ' '
        return result
    } else {
        return '\t'
    }
}
