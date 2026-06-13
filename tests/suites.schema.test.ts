import { describe, it, expect } from 'vitest'
import { SuiteSchema } from '@/lib/suites.schema'

const valid = {
  id: '14', name: 'Maui Private Suite — Unit 14', slug: 'unit-14',
  summary: 'Central Wailuku suite', description: 'A comfortable private suite...',
  photos: ['/suites/unit-14/1.jpg'],
  pricePerNight: 140, cleaningFee: 75,
  maxGuests: 4, bedrooms: 1, bathrooms: 1, beds: 1,
  rating: 4.8, reviewCount: 23,
  amenities: ['Air conditioning', 'Free WiFi'],
  blockedDates: [],
}

describe('SuiteSchema', () => {
  it('accepts a valid suite', () => {
    expect(SuiteSchema.parse(valid)).toMatchObject({ slug: 'unit-14', pricePerNight: 140 })
  })
  it('rejects negative price', () => {
    expect(() => SuiteSchema.parse({ ...valid, pricePerNight: -1 })).toThrow()
  })
  it('defaults blockedDates to empty array', () => {
    const { blockedDates, ...noBlocked } = valid
    expect(SuiteSchema.parse(noBlocked).blockedDates).toEqual([])
  })
})
