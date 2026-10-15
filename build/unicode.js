/* eslint-disable camelcase */

import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
import regenerate from 'regenerate'

const unicodeVersion = '18.0.0'

async function codePoints (category) {
    const module = await import(`@unicode/unicode-${unicodeVersion}/General_Category/${category}/code-points.mjs`)
    return module.default
}

const Space_Separator = regenerate()
    .add(await codePoints('Space_Separator'))
    .remove('\t', '\v', '\f', ' ', '\u00A0', '\uFEFF')

const ID_Start = regenerate()
    .add(await codePoints('Uppercase_Letter'))
    .add(await codePoints('Lowercase_Letter'))
    .add(await codePoints('Titlecase_Letter'))
    .add(await codePoints('Modifier_Letter'))
    .add(await codePoints('Other_Letter'))
    .add(await codePoints('Letter_Number'))
    .remove('$', '_')
    .removeRange('A', 'Z')
    .removeRange('a', 'z')

const ID_Continue = regenerate()
    .add(ID_Start)
    .add(await codePoints('Nonspacing_Mark'))
    .add(await codePoints('Spacing_Mark'))
    .add(await codePoints('Decimal_Number'))
    .add(await codePoints('Connector_Punctuation'))
    .remove('$', '_')
    .removeRange('0', '9')
    .removeRange('A', 'Z')
    .removeRange('a', 'z')

const outPath = fileURLToPath(new URL('../lib/unicode.js', import.meta.url))

const data = {
    Space_Separator,
    ID_Start,
    ID_Continue,
}

let source = '// This is a generated file. Do not edit.\n'
source += Object.keys(data).map(key => `export const ${key} = /${data[key]}/\n`).join('')

fs.writeFileSync(outPath, source)
