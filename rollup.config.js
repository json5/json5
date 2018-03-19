const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const uglify = require('rollup-plugin-uglify')
const pkg = require('./package.json')

module.exports = {
    input: 'lib/index.js',
    output: {
        file: pkg.browser,
        format: 'umd',
        name: 'JSON5',
    },
    plugins: [
        resolve(),
        commonjs(),
        uglify(),
    ],
}
