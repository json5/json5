
const FS = require('fs')
const JSON5 = require('../../lib/json5')


describe('testing inline function', () => {
  it('function(a, b) {} should be matched with function string', () => {
    expect(JSON5.parse('{ helo: function( a, b) { console.log(a, b);}}'))
      .toEqual({ helo: 'function (  a,b ){  console.log(a, b); }'})
  })

  it('(a, b) => {} should be matched with function string', () => {
    expect(JSON5.parse('{ helo: ( a, b) => { console.log(a, b);}}'))
      .toEqual({ helo: '(  a,b ) => {  console.log(a, b); }'})
  })
})
