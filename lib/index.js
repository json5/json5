const parse = require('./parse')
const stringify = require('./stringify')
const patch = require('./patch')

const JSON5 = {
    parse,
    patch,
    stringify,
}

module.exports = JSON5
