const locate = require('../lib/locate-character')
const assert = require('assert')

require('tap').mochaGlobals()

describe('locate-character', () => {
    it('throws if third option is a number', () => {
        assert.throws(() => {
            locate(null, null, 2)
        },
        err => (
            /^locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument/.test(err.message)
        ))
    })

    it('returns a result object with first match location', () => {
        const result = locate(`it is a beautiful day.
            really beautiful
        `, 'beautiful')

        assert.deepStrictEqual(result, {
            line: 0,
            column: 8,
            character: 8,
        })
    })

    it('returns a result object inside of line offset', () => {
        const result = locate(`it is a beautiful day.
            really beautiful
        `, 'beautiful', {offsetLine: 2})

        assert.deepStrictEqual(result, {
            line: 2,
            column: 8,
            character: 8,
        })
    })

    it('returns a result object inside of offset', () => {
        const result = locate(`beautiful
beautiful
beautiful                beautiful

beautiful`, 'beautiful', {offsetLine: 2, startIndex: 12, offsetColumn: 12})

        assert.deepStrictEqual(result, {
            line: 4,
            column: 12,
            character: 20,
        })
    })
})
