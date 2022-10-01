const buble = require('@rollup/plugin-buble')
const commonjs = require('@rollup/plugin-commonjs')
const {nodeResolve} = require('@rollup/plugin-node-resolve')
const {terser} = require('rollup-plugin-terser')
const pkg = require('./package.json')

module.exports = [
  // ES5 Non-minified
  {
    input: 'scripts/es5.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'JSON5',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      buble({transforms: {dangerousForOf: true}}),
    ],
  },
  // ES5 Minified
  {
    input: 'scripts/es5.js',
    output: {
      file: pkg.browser.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: 'JSON5',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      buble({transforms: {dangerousForOf: true}}),
      terser(),
    ],
  },
]
