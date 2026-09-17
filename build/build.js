// Builds the distributable entries from the ES module sources in lib/ with
// esbuild: the CommonJS entry served by the `require` export condition, a
// minified ESM bundle, and the minified UMD-style browser global.
import {build} from 'esbuild'
import {mkdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const root = new URL('../', import.meta.url)
const entry = fileURLToPath(new URL('lib/index.js', root))
const out = file => fileURLToPath(new URL(`dist/${file}`, root))

mkdirSync(new URL('dist/', root), {recursive: true})

// The named exports (parse, stringify) stay on module.exports so that
// `require('json5')` and `import {parse} from 'json5'` resolve to the same
// shape (#240).
await build({
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    outfile: out('index.cjs'),
})

await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    target: 'es2015',
    minify: true,
    outfile: out('index.min.mjs'),
})

// esbuild emits the iife as `var JSON5 = (() => {…})()` with the default
// export on JSON5.default; expose it as the global directly.
await build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    globalName: 'JSON5',
    target: 'es2015',
    minify: true,
    outfile: out('index.min.js'),
    footer: {js: 'if(typeof JSON5!=="undefined"&&JSON5.default)JSON5=JSON5.default;'},
})

console.log('build: dist/index.cjs + dist/index.min.mjs + dist/index.min.js')
