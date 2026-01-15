import { LocationProvider } from '@/contexts/LocationContext'
import { FilterProvider } from '@/contexts/FilterContext'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'
import Header from '@/components/header'

export const metadata = {
  title: 'Shop Clothing',
  description: 'Shop quality clothes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>
          <LocationProvider>
            <FilterProvider>
              <Header/>
              {children}
            </FilterProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

