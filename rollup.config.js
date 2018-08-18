const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const buble = require('rollup-plugin-buble')
const terser = require('rollup-plugin-terser').terser
const pkg = require('./package.json')

module.exports = [
    // Non-minified
    {
        input: 'build/es5.js',
        output: {
            file: pkg.browser,
            format: 'umd',
            name: 'JSON5',
        },
        plugins: [
            resolve(),
            commonjs(),
            buble({transforms: {dangerousForOf: true}}),
        ],
    },
    // Minified
    {
        input: 'build/es5.js',
        output: {
            file: pkg.browser.replace(/\.js$/, '.min.js'),
            format: 'umd',
            name: 'JSON5',
        },
        plugins: [
            resolve(),
            commonjs(),
            buble({transforms: {dangerousForOf: true}}),
            terser(),
        ],
    },
]
