// Builds the distributable entries from the ES module sources in lib/ with
// esbuild. The sources only have named exports; the default export (the
// `JSON5` object) and the `'module.exports'` interop export are added here.
import {build} from 'esbuild'
import {mkdirSync, rmSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const out = file => `${root}dist/${file}`

rmSync(out(''), {recursive: true, force: true})
mkdirSync(out(''), {recursive: true})

const entry = ({interop}) => ({
    contents: [
        "import {parse, stringify} from './lib/index.js'",
        'const JSON5 = {parse, stringify}',
        interop
            ? "export {parse, stringify, JSON5 as default, JSON5 as 'module.exports'}"
            : 'export {parse, stringify, JSON5 as default}',
        '',
    ].join('\n'),
    resolveDir: root,
    sourcefile: 'index.js',
})

// Node.js entry for the `module-sync` and `import` conditions. The
// `'module.exports'` export lets require() return the JSON5 object directly.
await build({
    stdin: entry({interop: true}),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    outfile: out('index.mjs'),
})

// CommonJS entry for the `require` condition on runtimes without require(esm).
// Built from a CommonJS entry so that module.exports is a plain object without
// an `__esModule` marker: `require('json5')` gives `{parse, stringify}`, and
// transpiled default imports (esModuleInterop, Babel) wrap it as expected.
await build({
    stdin: {
        contents: "const {parse, stringify} = require('./lib/index.js')\nmodule.exports = {parse, stringify}\n",
        resolveDir: root,
        sourcefile: 'index.cjs',
    },
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    outfile: out('index.cjs'),
})

await build({
    stdin: entry({interop: false}),
    bundle: true,
    format: 'esm',
    target: 'es2015',
    minify: true,
    outfile: out('index.min.mjs'),
})

await build({
    entryPoints: [`${root}lib/index.js`],
    bundle: true,
    format: 'iife',
    globalName: 'JSON5',
    target: 'es2015',
    minify: true,
    outfile: out('index.min.js'),
})

console.log('build: dist/index.mjs + dist/index.cjs + dist/index.min.mjs + dist/index.min.js')
