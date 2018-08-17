const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const terser = require('rollup-plugin-terser').terser
const pkg = require('./package.json')

module.exports = [
    // Non-minified
    {
        input: 'lib/index.js',
        output: {
            file: pkg.browser,
            format: 'umd',
            name: 'JSON5',
        },
        plugins: [
            resolve(),
            commonjs(),
        ],
    },
    // Minified
    {
        input: 'lib/index.js',
        output: {
            file: pkg.browser.replace(/\.js$/, '.min.js'),
            format: 'umd',
            name: 'JSON5',
        },
        plugins: [
            resolve(),
            commonjs(),
            terser(),
        ],
    },
]
