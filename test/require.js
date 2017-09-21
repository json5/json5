import assert from 'assert'

describe('require(*.json5)', () => {
    it('parses a JSON5 document', () => {
        require('../lib/register')
        assert.deepStrictEqual({a: 1, b: 2}, require('./test.json5'))
    })
})
