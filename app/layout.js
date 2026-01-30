import { LocationProvider } from '@/contexts/LocationContext'
import { FilterProvider } from '@/contexts/FilterContext'
import { AuthProvider } from '@/components/AuthProvider'
import { CartProvider } from '@/contexts/CartContext'
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
          <CartProvider>
            <LocationProvider>
              <FilterProvider>
                <Header/>
                {children}
              </FilterProvider>
            </LocationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

