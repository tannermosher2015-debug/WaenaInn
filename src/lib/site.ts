export const SITE = {
  name: 'Waena Inn',
  tagline: 'Boutique Lodging in Wailuku, Maui — Central & Comfortable',
  email: 'uncletonyshale@gmail.com',
  phone: '', // TODO(client): confirm phone or leave email-only
  address: '1325 Lower Main St, Wailuku, HI 96793',
  streetAddress: '1325 Lower Main St',
  city: 'Wailuku',
  region: 'HI',
  postalCode: '96793',
  mapQuery: '1325 Lower Main St, Wailuku, HI 96793', // exact street address → precise map pin
  googleUrl: 'https://www.google.com/maps/search/?api=1&query=1325+Lower+Main+St+Wailuku+HI+96793', // opens the listing / reviews
  url: 'https://waenainn.com', // TODO(client): confirm production domain
  nav: [
    { href: '/', label: 'Home' },
    { href: '/suites', label: 'Suites' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
