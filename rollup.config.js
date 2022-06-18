const commonjs = require('@rollup/plugin-commonjs')
const {nodeResolve} = require('@rollup/plugin-node-resolve')
const {terser} = require('rollup-plugin-terser')
const pkg = require('./package.json')

const base = {
  input: pkg.main,
  output: {
    file: pkg.browser,
    format: 'umd',
    name: 'JSON5',
    sourcemap: true,
  },
  plugins: [nodeResolve(), commonjs()],
}

module.exports = [
  // UMD
  base,
  // UMD Minified
  {
    ...base,
    output: {
      ...base.output,
      file: base.output.file.replace(/\.js$/, '.min.js'),
    },
    plugins: [...base.plugins, terser()],
  },
]
