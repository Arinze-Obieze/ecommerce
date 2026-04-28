"use client";

import WishlistEmptyState from "@/components/account/wishlist/WishlistEmptyState";

export default function OrderHistoryEmpty() {
  return (
    <WishlistEmptyState
      description="When you place an order it will appear here."
      ctaLabel="Start Shopping"
      ctaHref="/shop"
    />
  );
}
