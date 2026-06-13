import { describe, it, expect } from 'vitest'
import { filterSuites } from '@/lib/filterSuites'

const s = (slug: string, maxGuests: number, featured = false) =>
  ({ slug, maxGuests, featured }) as any

const all = [s('a', 2), s('b', 4, true), s('c', 5), s('d', 4)]

describe('filterSuites', () => {
  it('returns all when filter is "all"', () => {
    expect(filterSuites(all, { capacity: 'all', featuredOnly: false })).toHaveLength(4)
  })
  it('filters by capacity bucket (4 = exactly 4)', () => {
    expect(filterSuites(all, { capacity: 4, featuredOnly: false }).map((x) => x.slug)).toEqual(['b', 'd'])
  })
  it('"5+" returns 5 and above', () => {
    expect(filterSuites(all, { capacity: '5+', featuredOnly: false }).map((x) => x.slug)).toEqual(['c'])
  })
  it('featuredOnly keeps only featured', () => {
    expect(filterSuites(all, { capacity: 'all', featuredOnly: true }).map((x) => x.slug)).toEqual(['b'])
  })
})
