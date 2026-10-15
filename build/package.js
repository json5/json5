import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
import * as JSON5 from '../lib/index.js'
import pkg from '../package.json' with {type: 'json'}

let pkg5 = '// This is a generated file. Do not edit.\n'
pkg5 += JSON5.stringify(pkg, null, 2)

fs.writeFileSync(fileURLToPath(new URL('../package.json5', import.meta.url)), pkg5)
