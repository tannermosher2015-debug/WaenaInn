import { getAllSuites } from '@/lib/suites'
import { SuitesGrid } from './SuitesGrid'

export const metadata = { title: 'Suites' }
export default function SuitesPage() {
  return <SuitesGrid suites={getAllSuites()} />
}
