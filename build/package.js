import fs from 'fs'
import path from 'path'

import JSON5 from '../lib'

import pkg from '../package.json'

let pkg5 = '// This is a generated file. Do not edit.\n'
pkg5 += pkg5 = JSON5.stringify(pkg, null, 2)

fs.writeFileSync(path.resolve(__dirname, '..', 'package.json5'), pkg5)
