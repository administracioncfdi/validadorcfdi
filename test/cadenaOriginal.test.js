import { expect } from 'chai'
import { generaCadena } from '../src/index'

describe('generaCadena', () => {
  it('should generate a correct cadena', () => {
    expect(generaCadena()).to.equal(true)
  })
})
