import './globals.css'
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[var(--zova-linen)] text-[var(--zova-ink)]">
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  )
}
