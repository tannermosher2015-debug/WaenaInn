'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Hero date + guest picker. Routes to /suites, carrying guests as a capacity pre-filter. */
export function HeroSearch({ maxGuests = 6 }: { maxGuests?: number }) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  function search() {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    params.set('guests', String(guests))
    router.push(`/suites?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-sand/95 p-3 text-espresso shadow-soft backdrop-blur sm:flex-row sm:items-end">
      <label className="flex-1 text-xs font-medium">
        Check-in
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="mt-1 w-full rounded-lg border border-taupe bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="flex-1 text-xs font-medium">
        Check-out
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="mt-1 w-full rounded-lg border border-taupe bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs font-medium sm:w-24">
        Guests
        <input
          type="number"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-taupe bg-white px-3 py-2 text-sm"
        />
      </label>
      <button
        onClick={search}
        className="rounded-full bg-clay px-7 py-2.5 text-sm font-medium text-sand transition hover:brightness-110"
      >
        Search suites
      </button>
    </div>
  )
}
