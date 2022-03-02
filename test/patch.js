const assert = require('assert')
const JSON5 = require('../lib')

require('tap').mochaGlobals()

describe('patch(text, object)', () => {
    it('updates a property', () => {
        const obj = {a: 2}
        const patched = JSON5.patch('{ a: 1 }', obj)

        assert.deepStrictEqual(JSON5.parse(patched), obj)
    })

    it('adds a new property', () => {
        const obj = {a: 1, d: 3}
        const patched = JSON5.patch('{ a: 1 }', obj)

        assert.deepStrictEqual(JSON5.parse(patched), obj)
    })

    it('removes a property', () => {
        const obj = {a: 1}
        const patched = JSON5.patch('{ a: 1, d: 4 }', obj)

        assert.deepStrictEqual(JSON5.parse(patched), obj)
    })

    it('keeps a comment at the start', () => {
        const obj = {a: 1}
        const patched = JSON5.patch(`
// this is a comment
{ a: 1, d: 4 }
`, obj)

        assert.deepStrictEqual(patched.split('\n')[1], '// this is a comment')
    })

    it('keeps a comment at the end', () => {
        const obj = {a: 1}
        const patched = JSON5.patch(`
{ a: 1, d: 4 }
// this is a comment
`, obj)

        assert.deepStrictEqual(patched.split('\n')[2], '// this is a comment')
    })

    it('keeps a comment in between properties', () => {
        const obj = {a: 1, d: 5}
        const patched = JSON5.patch(`
{
    a: 1,
// this is a comment
    d: 4 }
`, obj)

        assert.deepStrictEqual(patched.split('\n')[3], '// this is a comment')
    })

    it('keeps a comment on array element', () => {
        const obj = {a: 1, b: [1, 2, 3, 4], d: 5}
        const patched = JSON5.patch(`
{
    a: 1,
    b: [
        1,
        2, // this is a comment
        3
    ],
    d: 4 }
`, obj)

        assert.deepStrictEqual(JSON5.parse(patched), obj)
        assert.deepStrictEqual(patched.split('\n')[5], '        2, // this is a comment')
    })
})
