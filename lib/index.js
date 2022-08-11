const parse = require('./parse')
const stringify = require('./stringify')

const JSON5 = {
    parse,
    stringify,
}

Object.defineProperty(JSON5, 'default', {
    enumerable: false,
    value: JSON5,
})

module.exports = JSON5
