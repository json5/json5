import parse from './parse.js'
import stringify from './stringify.js'

const JSON5 = {
    parse,
    stringify,
}

export {parse, stringify, JSON5 as default, JSON5 as 'module.exports'}
