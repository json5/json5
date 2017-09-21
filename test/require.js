import assert from 'assert'

describe('require(*.json5)', () => {
    it('parses a JSON5 document', () => {
        require('../lib/register')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    })

    it('is backward compatible with v0.5.1', () => {
        require('../lib/require')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    })

    it('throws on invalid JSON5', () => {
        require('../lib/register')
        assert.throws(() => { require('./invalid.json5') }, SyntaxError)
    })
})
