"use client";

import WishlistSection from "@/components/account/wishlist/WishlistSection";

export default function WishlistPage() {
  return (
    <div className="zova-account-page">
      <main className="zova-account-shell sm:px-6 lg:px-8 lg:py-12">
        <WishlistSection
          surface="wishlist_page"
          variant="page"
          title="Wishlist"
          description="Keep your saved finds in one polished shortlist so you can compare, revisit, and shop with confidence when the moment feels right."
          emptyDescription="Tap the heart on any product to save it here and come back whenever you're ready."
        />
      </main>
    </div>
  );
}
