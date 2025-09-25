import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI in Northern BC - RSVP Event',
    short_name: 'AI Event RSVP',
    description: 'RSVP for AI in Northern BC: Information Session - Terrace, BC',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981', // brand-sage color
    icons: [
      {
        src: '/VERGREE.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['business', 'education', 'technology'],
    lang: 'en-CA',
    orientation: 'portrait-primary',
  }
}
