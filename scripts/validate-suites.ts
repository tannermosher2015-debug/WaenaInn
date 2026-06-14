/**
 * validate-suites.ts — reads every content/suites/*.json and parses it through SuiteSchema.
 * Prints OK <count> on success, or lists failing files.
 */
import fs from 'node:fs'
import path from 'node:path'
import { SuiteSchema } from '../src/lib/suites.schema'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'suites')

const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json')).sort()
let ok = 0
let failed = 0

for (const file of files) {
  const fullPath = path.join(CONTENT_DIR, file)
  const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
  const result = SuiteSchema.safeParse(raw)
  if (result.success) {
    ok++
  } else {
    console.error(`FAIL ${file}:`, result.error.issues)
    failed++
  }
}

if (failed === 0) {
  console.log(`OK ${ok} / ${files.length} suites passed schema validation`)
} else {
  console.error(`FAILED: ${failed} files did not pass schema validation`)
  process.exit(1)
}
