import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const babelConfig = babelrc()
babelConfig.presets.find(p => p[0] === 'env')[1].modules = false
babelConfig.plugins = babelConfig.plugins.filter(p => p !== 'add-module-exports')
babelConfig.plugins.push('external-helpers')

export default [
    {
        input: 'src/index.js',
        output: {
            file: pkg.browser,
            format: 'umd',
            name: 'JSON5',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel(babelConfig),
            uglify(),
        ],
    },
]
