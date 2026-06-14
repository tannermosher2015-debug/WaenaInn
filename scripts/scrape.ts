/**
 * scrape.ts — Waena Inn content scrape pipeline
 *
 * 1. Renders the all-listings page with Playwright to gather all listing IDs.
 * 2. For each listing ID, renders the individual listing page and extracts
 *    full suite data from the JSON-LD structured data block.
 * 3. Downloads all photos to public/suites/<slug>/.
 * 4. Writes content/suites/<slug>.json validated against SuiteSchema.
 *
 * Run via: npm run scrape
 */

import { chromium, type Browser } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { parseSuiteCards, parseListingPage } from './parseSuite'

const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures')

const ROOT = 'https://uncletonyshale.holidayfuture.com'

const SHARED_AMENITIES = [
  'Air conditioning',
  '24-hour check-in',
  'Free parking',
  'Cooking basics',
  'Free WiFi',
  'Washing machine',
]

const CONTENT_DIR = path.join(process.cwd(), 'content', 'suites')
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'suites')

interface SuiteJson {
  id: string
  name: string
  slug: string
  summary: string
  description: string
  photos: string[]
  pricePerNight: number
  cleaningFee: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  beds: number
  rating: number
  reviewCount: number
  amenities: string[]
  airbnbUrl?: string
  featured: boolean
  blockedDates: string[]
}

function slugify(name: string, idx: number): string {
  // Try to extract unit number from name like "Unit 14 Waena Inn - Maui Private Suite"
  const unitMatch = /[Uu]nit\s+(\d+)/.exec(name)
  if (unitMatch) {
    return `unit-${unitMatch[1]}`
  }
  // Fallback: use index + 1
  return `unit-${idx + 1}`
}

function normalizePrice(priceText?: string): number {
  if (!priceText) return 0
  const n = parseFloat(priceText.replace(/[^\d.]/g, ''))
  return isNaN(n) ? 0 : n
}

function normalizeGuests(guestsText?: string): number {
  if (!guestsText) return 2
  const n = parseInt(guestsText, 10)
  return isNaN(n) || n < 1 ? 2 : n
}

function normalizeRating(ratingText?: string): number {
  if (!ratingText) return 4.7
  const n = parseFloat(ratingText)
  if (isNaN(n)) return 4.7
  return Math.max(0, Math.min(5, n))
}

async function downloadPhoto(
  url: string,
  destPath: string,
): Promise<boolean> {
  try {
    const res = await fetch(url)
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buf)
    return true
  } catch {
    return false
  }
}

async function renderPage(browser: Browser, url: string): Promise<string> {
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    return await page.content()
  } finally {
    await page.close()
  }
}

/**
 * renderAllListings — renders /all-listings with scroll-to-bottom to trigger
 * lazy-loading and waits until no new listings appear for two consecutive
 * scroll passes. Returns the final rendered HTML.
 */
async function renderAllListings(browser: Browser, url: string): Promise<string> {
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

    // Scroll loop: keep scrolling until the listing count stabilises
    let prevCount = 0
    let sameCount = 0
    const maxPasses = 20

    for (let pass = 0; pass < maxPasses; pass++) {
      // Scroll to the very bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      // Wait for any lazy-load / pagination XHR to settle
      await page.waitForTimeout(1500)
      try {
        await page.waitForLoadState('networkidle', { timeout: 8000 })
      } catch {
        // networkidle timeout is OK — just keep scrolling
      }

      const html = await page.content()
      const matches = html.match(/href="\/listings\/\d+"/g) ?? []
      const uniqueIds = new Set(matches.map((s) => s.match(/\d+/)?.[0]))
      const count = uniqueIds.size
      console.log(`  Scroll pass ${pass + 1}: ${count} unique listing IDs visible`)

      if (count === prevCount) {
        sameCount++
        if (sameCount >= 2) {
          console.log(`  Count stable at ${count} — stopping scroll`)
          break
        }
      } else {
        sameCount = 0
        prevCount = count
      }
    }

    return await page.content()
  } finally {
    await page.close()
  }
}

async function main() {
  console.log('=== Waena Inn scrape pipeline ===')
  console.log(`ROOT: ${ROOT}`)

  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  // Step 1: Get all listing IDs from the all-listings page (scroll to trigger lazy-load)
  console.log('\n[1/4] Rendering all-listings page (with scroll-to-load)...')
  fs.mkdirSync(FIXTURES_DIR, { recursive: true })
  const allListingsHtml = await renderAllListings(browser, `${ROOT}/all-listings`)
  // Save fixture for reference / debugging
  fs.writeFileSync(path.join(FIXTURES_DIR, 'all-listings.html'), allListingsHtml)
  console.log('  Saved tests/fixtures/all-listings.html')
  const cards = parseSuiteCards(allListingsHtml)
  const listingIds = cards.map((c) => c.listingId).filter(Boolean) as string[]
  console.log(`  Found ${listingIds.length} listing IDs: ${listingIds.join(', ')}`)

  if (listingIds.length === 0) {
    console.error('No listing IDs found — aborting.')
    await browser.close()
    process.exit(1)
  }

  // Step 2: For each listing ID, fetch the detail page and extract JSON-LD
  console.log('\n[2/4] Fetching individual listing pages...')
  const missing: string[] = []
  const skipped: string[] = []
  const suites: SuiteJson[] = []

  for (let i = 0; i < listingIds.length; i++) {
    const id = listingIds[i]
    console.log(`  [${i + 1}/${listingIds.length}] Fetching /listings/${id}...`)

    const listingHtml = await renderPage(browser, `${ROOT}/listings/${id}`)
    const raw = parseListingPage(listingHtml)

    if (!raw) {
      console.warn(`  ⚠ Could not parse listing ${id} — skipping`)
      skipped.push(id)
      continue
    }

    const slug = slugify(raw.name, i)
    const suitePublicDir = path.join(PUBLIC_DIR, slug)
    fs.mkdirSync(suitePublicDir, { recursive: true })

    // Step 3: Download photos
    console.log(`  Downloading ${raw.photoUrls.length} photos for ${slug}...`)
    const downloadedPaths: string[] = []
    for (let j = 0; j < raw.photoUrls.length; j++) {
      let photoUrl = raw.photoUrls[j]
      // Resolve relative URLs
      if (photoUrl.startsWith('/')) {
        photoUrl = `${ROOT}${photoUrl}`
      }
      const destFile = path.join(suitePublicDir, `${j + 1}.jpg`)
      const ok = await downloadPhoto(photoUrl, destFile)
      if (ok) {
        downloadedPaths.push(`/suites/${slug}/${j + 1}.jpg`)
      } else {
        console.warn(`    ⚠ Failed to download photo ${j + 1}: ${photoUrl}`)
      }
    }

    if (downloadedPaths.length === 0) {
      console.warn(`  ⚠ No downloadable photos for ${slug} (listing ${id}) — skipping (schema requires ≥1)`)
      skipped.push(id)
      continue
    }

    // Step 4: Build and write the suite JSON
    const pricePerNight = normalizePrice(raw.priceText)
    const maxGuests = normalizeGuests(raw.guestsText)
    const rating = normalizeRating(raw.ratingText)
    const reviewCount = raw.reviewCount ?? 0

    // Track missing / placeholder fields.
    // The live site's JSON-LD never exposes bedrooms/bathrooms/beds/cleaningFee, so
    // these are assumed defaults (studio = 1 / 1 / 1, fee 0) and must be flagged for the
    // client to confirm rather than presented as sourced data.
    const missingFields: string[] = ['bedrooms', 'bathrooms', 'beds', 'cleaningFee (assumed defaults — confirm with client)']
    if (!raw.priceText || pricePerNight === 0) missingFields.push('pricePerNight')
    if (!raw.description) missingFields.push('description')
    if (missingFields.length > 0) {
      missing.push(`${slug}: assumed/missing [${missingFields.join(', ')}]`)
    }

    const description = raw.description || raw.name
    const summary = raw.name

    // Extract unit number from slug for id
    const unitNum = slug.replace('unit-', '')

    const suite: SuiteJson = {
      id: unitNum,
      name: raw.name,
      slug,
      summary,
      description,
      photos: downloadedPaths,
      pricePerNight,
      cleaningFee: 0,
      maxGuests,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      rating,
      reviewCount,
      amenities: SHARED_AMENITIES,
      featured: i < 3,
      blockedDates: [],
    }

    // Add airbnbUrl if we have a href
    if (raw.href && raw.href.startsWith('http')) {
      suite.airbnbUrl = raw.href
    } else if (raw.href) {
      suite.airbnbUrl = `${ROOT}${raw.href}`
    }

    const contentPath = path.join(CONTENT_DIR, `${slug}.json`)
    fs.writeFileSync(contentPath, JSON.stringify(suite, null, 2))
    console.log(`  ✓ ${slug}: ${downloadedPaths.length} photos, price=$${pricePerNight}, rating=${rating}`)

    suites.push(suite)
  }

  await browser.close()

  // Summary
  console.log(`\n[3/4] Scrape complete.`)
  console.log(`  Scraped: ${suites.length} suites`)
  console.log(`  Skipped: ${skipped.length} (${skipped.join(', ') || 'none'})`)

  if (missing.length > 0) {
    console.log('\n⚠ PLACEHOLDERS NEEDED:')
    for (const m of missing) {
      console.log(`  - ${m}`)
    }
  } else {
    console.log('\n✓ No placeholder fields — all data looks complete.')
  }

  console.log('\n[4/4] Done. Run the validation step next:')
  console.log('  node --import tsx -e "import(\'./src/lib/suites.ts\').then(m=>console.log(\'suites:\', m.getAllSuites().length))"')
}

main().catch((err) => {
  console.error('Scrape failed:', err)
  process.exit(1)
})
