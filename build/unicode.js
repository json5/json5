/* eslint-disable camelcase */

import fs from 'node:fs'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import regenerate from 'regenerate'

const require = createRequire(import.meta.url)

const Space_Separator = regenerate()
    .add(require('unicode-10.0.0/General_Category/Space_Separator/code-points'))
    .remove('\t', '\v', '\f', ' ', ' ', '﻿')

const ID_Start = regenerate()
    .add(require('unicode-10.0.0/General_Category/Uppercase_Letter/code-points'))
    .add(require('unicode-10.0.0/General_Category/Lowercase_Letter/code-points'))
    .add(require('unicode-10.0.0/General_Category/Titlecase_Letter/code-points'))
    .add(require('unicode-10.0.0/General_Category/Modifier_Letter/code-points'))
    .add(require('unicode-10.0.0/General_Category/Other_Letter/code-points'))
    .add(require('unicode-10.0.0/General_Category/Letter_Number/code-points'))
    .remove('$', '_')
    .removeRange('A', 'Z')
    .removeRange('a', 'z')

const ID_Continue = regenerate()
    .add(ID_Start)
    .add(require('unicode-10.0.0/General_Category/Nonspacing_Mark/code-points'))
    .add(require('unicode-10.0.0/General_Category/Spacing_Mark/code-points'))
    .add(require('unicode-10.0.0/General_Category/Decimal_Number/code-points'))
    .add(require('unicode-10.0.0/General_Category/Connector_Punctuation/code-points'))
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
