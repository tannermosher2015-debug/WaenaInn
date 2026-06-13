import { describe, it, expect } from 'vitest'
import { nightsBetween, rangeHasBlocked, validateStay } from '@/lib/dates'

describe('dates', () => {
  it('counts nights', () => {
    expect(nightsBetween('2026-07-01', '2026-07-04')).toBe(3)
  })
  it('detects a blocked date inside the range', () => {
    expect(rangeHasBlocked('2026-07-01', '2026-07-04', ['2026-07-02'])).toBe(true)
    expect(rangeHasBlocked('2026-07-01', '2026-07-04', ['2026-07-09'])).toBe(false)
  })
  it('validateStay rejects checkout <= checkin', () => {
    expect(validateStay({ checkIn: '2026-07-04', checkOut: '2026-07-04', guests: 2, maxGuests: 4, blocked: [] }).ok).toBe(false)
  })
  it('validateStay rejects too many guests', () => {
    expect(validateStay({ checkIn: '2026-07-01', checkOut: '2026-07-03', guests: 9, maxGuests: 4, blocked: [] }).ok).toBe(false)
  })
  it('validateStay accepts a clean range', () => {
    expect(validateStay({ checkIn: '2026-07-01', checkOut: '2026-07-03', guests: 2, maxGuests: 4, blocked: [] }).ok).toBe(true)
  })
})
