
const FS = require('fs')
const JSON5 = require('../../lib/json5')

describe('testing external function', () => {

  const specTxt = FS.readFileSync('./__tests__/functions/external_function.json5')
  const json = JSON5.parse(specTxt)

  it('function(a, b) {} should be matched with function string', () => {
    expect(json.helo)
      .toEqual('function ( a,b ){ console.log(a, b);  console.log(a, b);  return a * b;   }')
  })

  it('(a, b) => {} should be matched with function string', () => {
    expect(json.world)
      .toEqual('( a,b,c ) => {   return a + b + c;   }')
  })

  it('function(a, b) {} with nesting parentheses should be matched with function string', () => {
    expect(json.nesting_parentheses)
      .toEqual('function (  a,b ){   return { a: b }   }')
  })
})