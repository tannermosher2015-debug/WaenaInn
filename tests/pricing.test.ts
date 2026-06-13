import { describe, it, expect } from 'vitest'
import { quote } from '@/lib/pricing'

describe('quote', () => {
  it('computes nights × rate + cleaning + tax', () => {
    const q = quote({ pricePerNight: 100, cleaningFee: 75, nights: 3, taxRate: 0.1775 })
    expect(q.subtotal).toBe(300)
    expect(q.cleaningFee).toBe(75)
    expect(q.taxableBase).toBe(375)
    expect(q.tax).toBe(66.56)      // 375 * 0.1775 = 66.5625 → 66.56
    expect(q.total).toBe(441.56)
    expect(q.amountCents).toBe(44156)
  })
  it('rounds tax to cents (half-up)', () => {
    const q = quote({ pricePerNight: 99.99, cleaningFee: 0, nights: 1, taxRate: 0.1775 })
    expect(q.tax).toBe(17.75)      // 99.99 * 0.1775 = 17.748225 → 17.75
  })
  it('throws on zero nights', () => {
    expect(() => quote({ pricePerNight: 100, cleaningFee: 0, nights: 0, taxRate: 0.1775 })).toThrow()
  })
})
