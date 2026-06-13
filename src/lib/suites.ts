import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import { SuiteSchema, type Suite } from './suites.schema'

const DIR = path.join(process.cwd(), 'content', 'suites')

export function getAllSuites(): Suite[] {
  if (!fs.existsSync(DIR)) return []
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => SuiteSchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))))
    .sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }))
}

export function getSuite(slug: string): Suite | undefined {
  return getAllSuites().find((s) => s.slug === slug)
}
