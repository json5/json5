const assert = require('assert')
const sinon = require('sinon')

describe('require(*.json5)', () => {
    it('parses a JSON5 document', () => {
        require('../lib/register')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    })

    it('is backward compatible with v0.5.1, but gives a deprecation warning', () => {
        const mock = sinon.mock(console)
        mock.expects('warn').once().withExactArgs("'json5/require' is deprecated. Please use 'json5/register' instead.")
        require('../lib/require')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
        mock.verify()
    })

    it('throws on invalid JSON5', () => {
        require('../lib/register')
        assert.throws(() => { require('./invalid.json5') }, SyntaxError)
    })
})
