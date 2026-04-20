import './globals.css'
import AppProviders from '@/components/providers/AppProviders'
import SiteChrome from '@/components/layout/SiteChrome'

export const metadata = {
  title: 'ZOVA | Verified Fashion, Made Easy',
  description: 'Where trust meets the market. Shop verified fashion from trusted sellers.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-(--zova-linen) text-(--zova-ink)">
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  )
}
