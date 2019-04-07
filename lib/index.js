const parseModule = require('./parse')
const stringify = require('./stringify')

const parse = parseModule.parse
const findPointer = parseModule.find
const JSON5 = {
    parse,
    stringify,
    findPointer,
}

module.exports = JSON5
