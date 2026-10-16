// Compile-only check of the CommonJS type declarations (tsc --noEmit --strict --module node20).
import JSON5 = require('json5')

const a: number = JSON5.parse<{x: number}>('{x:1}').x
const b: string = JSON5.stringify({x: 1}, null, 2)

// reviver
const e = JSON5.parse('{n:1}', (key, value) => value)

// stringify overloads: replacer array + options object
const f: string = JSON5.stringify({a: 1, b: 2}, ['a'])
const opts: JSON5.StringifyOptions = {space: 2, quote: '"'}
const g: string = JSON5.stringify({a: 1}, opts)

void [a, b, e, f, g]
