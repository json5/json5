import {parse} from './parse.js'
import {stringify} from './stringify.js'

const JSON5 = {parse, stringify}

// The 'module.exports' export makes require('json5') return the JSON5 object
// instead of the module namespace.
export {parse, stringify, JSON5 as default, JSON5 as 'module.exports'}
