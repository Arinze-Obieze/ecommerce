"use client";

import { FiHeart } from "react-icons/fi";
import WishlistEmptyState from "@/components/account/wishlist/WishlistEmptyState";
import WishlistProductGrid from "@/components/account/wishlist/WishlistProductGrid";
import WishlistSkeletonGrid from "@/components/account/wishlist/WishlistSkeletonGrid";
import useWishlistProducts from "@/components/account/wishlist/useWishlistProducts";

export default function WishlistSection({
  title = "Wishlist",
  kicker = "My Account",
  description,
  surface,
  variant = "compact",
  emptyDescription,
  showCount = true,
}) {
  const { isWishlistLoading, wishlistCount, products, isLoading } = useWishlistProducts(surface);

  if (isWishlistLoading) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="zova-account-heading">
        <div>
          <p className="zova-account-kicker">{kicker}</p>
          <h2 className={variant === "page" ? "zova-account-hero-title" : "zova-account-title"}>{title}</h2>
          {description ? <p className="zova-account-subtitle">{description}</p> : null}
        </div>

        {showCount && wishlistCount > 0 ? (
          <span
            className="zova-account-pill"
            style={{
              gap: 6,
              background: "var(--zova-green-soft)",
              color: "var(--zova-primary-action)",
              border: "1px solid #b8d4a0",
            }}
          >
            <FiHeart size={13} />
            {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <WishlistSkeletonGrid count={variant === "page" ? 8 : 6} variant={variant} />
      ) : products.length > 0 ? (
        <WishlistProductGrid products={products} surface={surface} variant={variant} />
      ) : (
        <WishlistEmptyState description={emptyDescription} />
      )}
    </section>
  );
}
