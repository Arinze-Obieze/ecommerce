import { LocationProvider } from '@/contexts/LocationContext'
import { FilterProvider } from '@/contexts/FilterContext'
import { AuthProvider } from '@/components/AuthProvider'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { ToastProvider } from '@/contexts/ToastContext'
import './globals.css'
import ConditionalFooter from '@/components/ConditionalFooter'   // ← changed
import ConditionalHeader from '@/components/ConditionalHeader'   // ← changed
import AnalyticsPageTracker from '@/components/AnalyticsPageTracker'

export const metadata = {
  title: 'Shop Clothing',
  description: 'Shop quality clothes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-gray-900">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <LocationProvider>
                  <FilterProvider>
                    <AnalyticsPageTracker />
                    <ConditionalHeader />  {/* ← changed */}
                    {children}
                    <ConditionalFooter /> {/* ← changed */}
                  </FilterProvider>
                </LocationProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}