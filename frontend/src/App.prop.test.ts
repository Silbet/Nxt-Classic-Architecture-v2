import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('fast-check setup verification', () => {
  it('verifies fast-check is working', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        expect(n + 0).toBe(n)
        return true
      }),
      { numRuns: 10 }
    )
  })
})
