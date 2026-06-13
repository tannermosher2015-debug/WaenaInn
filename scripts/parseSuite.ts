/**
 * parseSuite.ts — HTML parsing utilities for the Waena Inn content scrape.
 *
 * Two functions:
 *  - parseSuiteCards(html): Extracts minimal card data from the home / all-listings page.
 *    Used to build a list of listing IDs to visit individually.
 *  - parseListingPage(html): Extracts full suite data from an individual listing page via
 *    the embedded JSON-LD <script type="application/ld+json"> block.
 */

export interface RawSuite {
  name: string
  photoUrls: string[]
  priceText?: string
  ratingText?: string
  guestsText?: string
  description?: string
  href?: string
  listingId?: string
  reviewCount?: number
}

// ---------------------------------------------------------------------------
// parseSuiteCards — home / all-listings page
// ---------------------------------------------------------------------------

/**
 * Parses the rendered HTML of the listings index page.
 * Each listing card is anchored by href="/listings/<id>".
 * We extract:
 *   - href (and listingId)
 *   - The first `src="..."` image found inside that card region
 *   - The suite name from the <h4> element
 *   - The rating from the rating badge
 *
 * Because this page uses styled-components with hashed class names, we use
 * positional regex parsing rather than class selectors.
 */
export function parseSuiteCards(html: string): RawSuite[] {
  // Find all listing card start positions
  const hrefRe = /href="\/listings\/(\d+)"/g
  const results: RawSuite[] = []

  const allMatches: Array<{ id: string; idx: number }> = []
  let m: RegExpExecArray | null
  while ((m = hrefRe.exec(html)) !== null) {
    allMatches.push({ id: m[1], idx: m.index })
  }

  for (let i = 0; i < allMatches.length; i++) {
    const { id, idx } = allMatches[i]
    const nextIdx = allMatches[i + 1]?.idx ?? html.length
    const cardHtml = html.slice(idx, nextIdx)

    // Extract suite name from <h4>
    const nameMatch = /<h4[^>]*>([^<]+)<\/h4>/.exec(cardHtml)
    const name = nameMatch ? nameMatch[1].trim() : ''

    // Extract image src URLs (the canonical `src="..."` attribute)
    const srcRe = /\bsrc="(https:\/\/[^"]+)"/g
    const photoUrls: string[] = []
    let imgM: RegExpExecArray | null
    while ((imgM = srcRe.exec(cardHtml)) !== null) {
      photoUrls.push(imgM[1])
    }

    // Extract rating
    // Rating badge looks like: >4.85<!-- -->&nbsp;★<
    const ratingMatch = /([\d.]+)(?:<!-- -->)?(?:&nbsp;)?(?:â˜…|★)/.exec(cardHtml)
    const ratingText = ratingMatch ? ratingMatch[1] : undefined

    // Extract guests
    const guestsMatch = /(\d+)\s*guests?/i.exec(cardHtml)
    const guestsText = guestsMatch ? guestsMatch[1] : undefined

    if (!name || photoUrls.length === 0) continue

    results.push({
      name,
      photoUrls,
      ratingText,
      guestsText,
      href: `/listings/${id}`,
      listingId: id,
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// parseListingPage — individual listing page
// ---------------------------------------------------------------------------

interface JsonLdVacationRental {
  name?: string
  description?: string
  image?: string[]
  containsPlace?: {
    occupancy?: number
    amenityFeature?: Array<{ name: string }>
  }
  aggregateRating?: {
    ratingValue?: number
    reviewCount?: number
  }
  offers?: {
    price?: number
    priceCurrency?: string
  }
  identifier?: number
  url?: string
}

/**
 * Parses an individual listing page and returns a RawSuite using the
 * JSON-LD structured data block (application/ld+json).
 *
 * Returns null if no JSON-LD block is found.
 */
export function parseListingPage(html: string): RawSuite | null {
  // Extract JSON-LD block
  const jsonLdRe = /<script\s+type="application\/ld\+json">([\s\S]+?)<\/script>/g
  let m: RegExpExecArray | null
  let data: JsonLdVacationRental | null = null

  while ((m = jsonLdRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]) as JsonLdVacationRental
      // We want the VacationRental block (has "offers" and "containsPlace")
      if (parsed.offers && parsed.containsPlace) {
        data = parsed
        break
      }
    } catch {
      // malformed JSON block, skip
    }
  }

  if (!data) return null

  const name = data.name ?? ''
  const description = data.description ?? ''
  const photoUrls = data.image ?? []
  const priceText = data.offers?.price != null ? String(data.offers.price) : undefined
  const ratingText = data.aggregateRating?.ratingValue != null
    ? String(data.aggregateRating.ratingValue)
    : undefined
  const reviewCount = data.aggregateRating?.reviewCount ?? 0
  const guestsText = data.containsPlace?.occupancy != null
    ? String(data.containsPlace.occupancy)
    : undefined
  const listingId = data.identifier != null ? String(data.identifier) : undefined
  const href = data.url ?? undefined

  if (!name || photoUrls.length === 0) return null

  return {
    name,
    description,
    photoUrls,
    priceText,
    ratingText,
    guestsText,
    href,
    listingId,
    reviewCount,
  }
}
