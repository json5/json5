const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const buble = require('rollup-plugin-buble')
const terser = require('rollup-plugin-terser').terser
const pkg = require('./package.json')

module.exports = [
    // ES5 Non-minified
    {
        input: 'build/es5.js',
        output: [
            {
                file: pkg.browser,
                format: 'umd',
                name: 'JSON5',
            },
            {
                // Legacy path
                file: 'dist/index.js',
                format: 'umd',
                name: 'JSON5',
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            buble({transforms: {dangerousForOf: true}}),
        ],
    },
    // ES5 Minified
    {
        input: 'build/es5.js',
        output: [
            {
                file: pkg.browser.replace(/\.js$/, '.min.js'),
                format: 'umd',
                name: 'JSON5',
            },
            {
                // Legacy path
                file: 'dist/index.min.js',
                format: 'umd',
                name: 'JSON5',
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            buble({transforms: {dangerousForOf: true}}),
            terser(),
        ],
    },
    // ES6 Modules Non-minified
    {
        input: 'lib/index.mjs',
        output: [
            {
                file: pkg.browser.replace(/\.umd\.js$/, '.esm.js'),
                format: 'esm',
            },
            {
                // Legacy path
                file: 'dist/index.mjs',
                format: 'esm',
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
        ],
    },
    // ES6 Modules Minified
    {
        input: 'lib/index.mjs',
        output: [
            {
                file: pkg.browser.replace(/\.umd\.js$/, '.esm.min.mjs'),
                format: 'esm',
            },
            {
                // Legacy path
                file: 'dist/index.min.mjs',
                format: 'esm',
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            terser(),
        ],
    },
]
