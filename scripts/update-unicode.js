#!/usr/bin/env node

/**
 * @file Generates RegExp objects for matching certain tokens and writes them to
 * `lib/unicode.js`.
 */

const fs = require('fs')
const path = require('path')
const regenerate = require('regenerate')

const libDir = 'lib'

// Get all characters in the Unicode category Zs, excluding characters parsed
// directly.
const Space_Separator = regenerate()
  .add(require('unicode-10.0.0/General_Category/Space_Separator/code-points'))
  .remove('\t', '\v', '\f', ' ', '\u00A0', '\uFEFF')

// Get all characters in the Unicode categories Lu, Ll, Lt, Lm, Lo, and Nl,
// excluding characters parsed directly.
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

// Get all characters in the Unicode categories Lu, Ll, Lt, Lm, Lo, Nl, Mn, Mc,
// Nd, and Pc, excluding characters parsed directly.
const ID_Continue = regenerate()
  .add(ID_Start)
  .add(require('unicode-10.0.0/General_Category/Nonspacing_Mark/code-points'))
  .add(require('unicode-10.0.0/General_Category/Spacing_Mark/code-points'))
  .add(require('unicode-10.0.0/General_Category/Decimal_Number/code-points'))
  .add(
    require('unicode-10.0.0/General_Category/Connector_Punctuation/code-points'),
  )
  .remove('$', '_')
  .removeRange('0', '9')
  .removeRange('A', 'Z')
  .removeRange('a', 'z')

const outDir = libDir
const outPath = path.join(outDir, 'unicode.js')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir)
}

const data = {
  Space_Separator,
  ID_Start,
  ID_Continue,
}

let es6 = '// This is a generated file. Do not edit.\n'
es6 += Object.keys(data)
  .map(key => `module.exports.${key} = /${data[key]}/\n`)
  .join('')

fs.writeFileSync(outPath, es6)
