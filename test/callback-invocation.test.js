import {test} from 'node:test'
import assert from 'node:assert/strict'
import * as JSON5 from '../lib/index.js'

for (const mode of ['null', 'throwing getter', 'function', 'no prototype']) {
    for (const operation of ['parse', 'stringify']) {
        test(`${operation}: invokes callbacks directly with ${mode} call property`, () => {
            const calls = []
            const callback = function (key, value) {
                calls.push({key, value, holder: this})
                return typeof value === 'number' ? value + 1 : value
            }
            if (mode === 'null') {
                callback.call = null
            } else if (mode === 'throwing getter') {
                Object.defineProperty(callback, 'call', {
                    get () { throw new Error('call must not be read') },
                })
            } else if (mode === 'function') {
                callback.call = () => { throw new Error('call must not be invoked') }
            } else {
                Object.setPrototypeOf(callback, null)
            }
            const input = {a: [1], b: {c: 2}}
            const result = operation === 'parse'
                ? JSON5.parse(JSON.stringify(input), callback)
                : JSON5.parse(JSON5.stringify(input, callback))
            assert.deepEqual(result, {a: [2], b: {c: 3}})
            assert.deepEqual(calls.map(call => call.key), operation === 'parse'
                ? ['0', 'a', 'c', 'b', '']
                : ['', 'a', '0', 'b', 'c'])
            const leaf = calls.find(call => call.key === '0')
            assert.equal(Array.isArray(leaf.holder), true)
            const nested = calls.find(call => call.key === 'c')
            assert.equal(Object.hasOwn(nested.holder, 'c'), true)
            const root = calls.find(call => call.key === '')
            assert.equal(root.holder[''], root.value)
        })
    }
}

for (const operation of ['parse', 'stringify']) {
    test(`${operation}: preserves callback exceptions`, () => {
        const error = new Error('callback failed')
        const callback = () => { throw error }
        callback.call = null
        assert.throws(() => operation === 'parse'
            ? JSON5.parse('{a: 1}', callback)
            : JSON5.stringify({a: 1}, callback), value => value === error)
    })
}

test('parse: direct callback invocation still deletes undefined results', () => {
    const callback = (key, value) => key === 'a' ? undefined : value
    callback.call = null
    assert.deepEqual(JSON5.parse('{a: 1, b: 2}', callback), {b: 2})
})

test('stringify: direct callback invocation still omits undefined results', () => {
    const callback = (key, value) => key === 'a' ? undefined : value
    callback.call = null
    assert.equal(JSON5.stringify({a: 1, b: 2}, callback), '{b:2}')
})
