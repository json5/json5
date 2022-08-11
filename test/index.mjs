/* eslint-disable import/no-duplicates, node/no-unsupported-features/es-syntax */

import JSON5Modules from '..'
import JSON5CommonJS from '../lib/index.js'

import t from 'tap'

t.strictSame(JSON5Modules, JSON5CommonJS, 'modules export and CommonJS export are the same')
