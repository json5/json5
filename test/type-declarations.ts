// Compile-only check of the ESM type declarations (tsc --noEmit --strict --module node20).
import JSON5, {parse, stringify} from 'json5'
import type {ParseOptions, StringifyOptions} from 'json5'

// default export carries parse/stringify
const a: number = JSON5.parse<{x: number}>('{x:1}').x
const b: string = JSON5.stringify({x: 1})

// named exports
const c: number = parse<{y: number}>('{y:2}').y
const d: string = stringify({y: 2}, null, 2)

// reviver
const e = parse('{n:1}', (key, value) => value)

// stringify overloads: replacer array + options object
const f: string = stringify({a: 1, b: 2}, ['a'])
const opts: StringifyOptions = {space: 2, quote: '"'}
const g: string = stringify({a: 1}, opts)

// parse options, with and without a reviver
const parseOpts: ParseOptions = {bigint: true}
const h = parse('12345678901234567890', parseOpts)
const i = parse('{n:1}', (key, value) => value, {bigint: true})

declare const maybeOpts: ParseOptions | undefined
const j = parse('1', maybeOpts)

void [a, b, c, d, e, f, g, h, i, j]
