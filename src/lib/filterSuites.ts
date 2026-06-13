import type { Suite } from './suites.schema'

export type Capacity = 'all' | 2 | 3 | 4 | '5+'
export interface SuiteFilter { capacity: Capacity; featuredOnly: boolean }

export function filterSuites(suites: Suite[], f: SuiteFilter): Suite[] {
  return suites.filter((s) => {
    if (f.featuredOnly && !s.featured) return false
    if (f.capacity === 'all') return true
    if (f.capacity === '5+') return s.maxGuests >= 5
    return s.maxGuests === f.capacity
  })
}
