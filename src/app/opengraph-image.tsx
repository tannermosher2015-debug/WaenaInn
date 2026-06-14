import { ImageResponse } from 'next/og'

export const alt = 'Waena Inn — Boutique Lodging in Wailuku, Maui'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Branded default share card (home + any route without its own image).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: '#2B201A',
          color: '#F6F1E9',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 8, color: '#B5683E' }}>WAILUKU, MAUI</div>
        <div style={{ fontSize: 110, fontWeight: 800, marginTop: 16, lineHeight: 1 }}>Waena Inn</div>
        <div style={{ fontSize: 40, marginTop: 28, color: '#D9CFC2', maxWidth: 900 }}>
          Boutique lodging in the heart of Maui — private suites, central and comfortable.
        </div>
        <div style={{ fontSize: 30, marginTop: 48, color: '#F6F1E9' }}>
          5.0 on Google. Self check-in. Free parking.
        </div>
      </div>
    ),
    { ...size },
  )
}
