import { z } from 'zod'

export const SuiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string(),
  description: z.string(),
  photos: z.array(z.string()).min(1),
  pricePerNight: z.number().nonnegative(),
  cleaningFee: z.number().nonnegative().default(0),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  beds: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative().default(0),
  amenities: z.array(z.string()),
  airbnbUrl: z.url().optional(),
  featured: z.boolean().default(false),
  blockedDates: z.array(z.string()).default([]),
})

export type Suite = z.infer<typeof SuiteSchema>
