"use client";

import { LocationProvider } from '@/contexts/location/LocationContext';
import { FilterProvider } from '@/contexts/filter/FilterContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { CartProvider } from '@/contexts/cart/CartContext';
import { WishlistProvider } from '@/contexts/wishlist/WishlistContext';
import { ToastProvider } from '@/contexts/toast/ToastContext';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <LocationProvider>
              <FilterProvider>
                {children}
              </FilterProvider>
            </LocationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
