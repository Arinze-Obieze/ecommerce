"use client";
import Link from 'next/link';
import {
  CartDeliveryModal,
  CartEmptyState,
  CartItemsList,
  CartSuccessModal,
  CartSummaryPanel,
} from '@/features/cart/checkout/CartSections';
import useCartCheckout from '@/features/cart/checkout/useCartCheckout';

export default function CartPage() {
  const cartPage = useCartCheckout();

  if (cartPage.cart.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="zova-page py-8 md:py-16">
      <CartSuccessModal cartPage={cartPage} />
      <CartDeliveryModal cartPage={cartPage} />

      <div className="zova-shell max-w-6xl mx-auto">
        <div className="zova-section-header mb-8">
          <div>
            <span className="zova-eyebrow">Checkout ready</span>
            <h1 className="zova-title mt-3 text-3xl font-black text-(--zova-ink)">Your Bag</h1>
          <p className="mt-1 text-sm text-(--zova-text-muted)">Review your items before checkout</p>
          </div>
        </div>
        {cartPage.checkoutError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {cartPage.checkoutError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <CartItemsList cartPage={cartPage} />
          <CartSummaryPanel cartPage={cartPage} />
        </div>
      </div>
    </div>
  );
}
