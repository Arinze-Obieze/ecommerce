import './globals.css'
import './animations.css'
import './components.css'
import './auth.css'
import { headers } from 'next/headers'
import AppProviders from '@/components/providers/AppProviders'
import SiteChrome from '@/components/layout/SiteChrome'

export const metadata = {
  title: 'ZOVA | Verified Fashion, Made Easy',
  description: 'Where trust meets the market. Shop verified fashion from trusted sellers.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get('x-nonce') || undefined

  return (
    <html lang="en">
      <body
        nonce={nonce}
        className="font-sans antialiased bg-(--zova-linen) text-(--zova-ink)"
      >
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  )
}
