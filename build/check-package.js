import assert from 'assert'

import '../lib/register'
import pkg from '../package.json'
import pkg5 from '../package.json5'

assert.deepStrictEqual(pkg, pkg5, 'package.json and package.json5 do not match')
