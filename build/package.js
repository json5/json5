import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
import * as JSON5 from '../lib/index.js'

const root = new URL('../', import.meta.url)
const pkg = JSON.parse(fs.readFileSync(new URL('package.json', root), 'utf8'))

let pkg5 = '// This is a generated file. Do not edit.\n'
pkg5 += JSON5.stringify(pkg, null, 2)

fs.writeFileSync(fileURLToPath(new URL('package.json5', root)), pkg5)
