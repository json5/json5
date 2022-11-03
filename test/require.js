const assert = require('assert')
const sinon = require('sinon')

const t = require('tap')

t.test('require(*.json5)', t => {
    t.test('parses a JSON5 document', t => {
        require('../lib/register')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
        t.end()
    })

    t.test('is backward compatible with v0.5.1, but gives a deprecation warning', t => {
        const mock = sinon.mock(console)
        mock.expects('warn').once().withExactArgs("'json5/require' is deprecated. Please use 'json5/register' instead.")
        require('../lib/require')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
        mock.verify()
        t.end()
    })

    t.test('throws on invalid JSON5', t => {
        require('../lib/register')
        assert.throws(() => { require('./invalid.json5') }, SyntaxError)
        t.end()
    })

    t.end()
})
