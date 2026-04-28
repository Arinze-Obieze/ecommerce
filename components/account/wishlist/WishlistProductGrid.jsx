"use client";

import ProductCard from "@/components/catalog/ProductCard";
import ProductImpressionTracker from "@/components/catalog/ProductImpressionTracker";

export default function WishlistProductGrid({ products, surface, variant = "compact" }) {
  return (
    <div className={`zova-account-grid ${variant === "page" ? "is-wishlist-page" : "is-wishlist-compact"}`}>
      {products.map((product, index) => (
        <ProductImpressionTracker
          key={product.id}
          product={product}
          surface={surface}
          position={index + 1}
          metadata={{ sortStrategy: "wishlist" }}
        >
          <ProductCard product={product} />
        </ProductImpressionTracker>
      ))}
    </div>
  );
}
