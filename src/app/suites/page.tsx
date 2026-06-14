import { getAllSuites } from '@/lib/suites'
import { filterSuites, type Capacity } from '@/lib/filterSuites'
import { SuitesGrid } from './SuitesGrid'

export const metadata = { title: 'Suites', alternates: { canonical: '/suites' } }

function toCapacity(guests?: string): Capacity {
  const n = Number(guests)
  if (n >= 5) return '5+'
  if (n === 4) return 4
  if (n === 3) return 3
  if (n === 2) return 2
  return 'all'
}

export default async function SuitesPage({
  searchParams,
}: {
  searchParams: Promise<{ guests?: string }>
}) {
  const { guests } = await searchParams
  const suites = getAllSuites()
  let initialCapacity = toCapacity(guests)
  // If the requested capacity has no matching suites, fall back to "all".
  if (
    initialCapacity !== 'all' &&
    filterSuites(suites, { capacity: initialCapacity, featuredOnly: false }).length === 0
  ) {
    initialCapacity = 'all'
  }
  return <SuitesGrid suites={suites} initialCapacity={initialCapacity} />
}
