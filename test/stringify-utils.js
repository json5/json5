const {stringifyProperty, stringifyString, stringifyValue} = require('../lib/stringify-utils')
const assert = require('assert')

require('tap').mochaGlobals()

describe('stringify-utils', () => {
    describe('stringifyString', () => {
        it('places a quote at beginning and end', () => {
            let result = stringifyString('')

            assert.strictEqual(result[0], '"')
            assert.strictEqual(result[1], '"')

            result = stringifyString('', "'")

            assert.strictEqual(result[0], "'")
            assert.strictEqual(result[1], "'")
        })

        it('replaces escapeable text', () => {
            let result = stringifyString('\n')

            assert.strictEqual(result, '"\\n"')
        })

        it('escapes quotes', () => {
            let result = stringifyString('""\'\'')

            assert.strictEqual(result, `"\\"\\"''"`)
        })
    })

    describe('stringifyProperty', () => {
        it('stringify property with letters', () => {
            const result = stringifyProperty(
                'property',
                'value',
                "'"
            )

            assert.strictEqual(result, "property: 'value'")
        })
    })

    describe('stringifyValue', () => {
        it('stringifies a string', () => {
            const result = stringifyValue('test')

            assert.strictEqual(result, '"test"')
        })

        it('stringifies a number', () => {
            const result = stringifyValue(3)

            assert.strictEqual(result, '3')
        })

        it('stringifies a boolean', () => {
            const result = stringifyValue(true)

            assert.strictEqual(result, 'true')
        })

        it('stringifies an array', () => {
            const result = stringifyValue([1, 2])

            assert.strictEqual(result, '[ 1, 2 ]')
        })

        it('stringifies an array on multiple lines', () => {
            const result = stringifyValue([1, 2], "'", null, null, true)

            assert.strictEqual(result, '[\n01,\n02\nnull]')
        })

        it('stringifies an object', () => {
            const result = stringifyValue({a: 2})

            assert.strictEqual(result, '{ a: 2 }')
        })

        it('stringifies an object on multiple lines', () => {
            const result = stringifyValue({a: 2, b: 3}, "'", null, null, true)

            assert.strictEqual(result, '{0a: 2,0b: 3null}')
        })

        it('throws if value is a function', () => {
            assert.throws(() => {
                stringifyValue(() => {})
            })
        })
    })
})
