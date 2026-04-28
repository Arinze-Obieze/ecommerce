"use client";

function SkeletonCard({ index }) {
  return (
    <div className="zova-account-skeleton-card animate-pulse" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="zova-account-skeleton-media" />
      <div className="zova-account-skeleton-body">
        <span className="zova-account-skeleton-line" style={{ width: "55%" }} />
        <span className="zova-account-skeleton-line" style={{ width: "82%" }} />
        <span className="zova-account-skeleton-line" style={{ width: "42%" }} />
        <span className="zova-account-skeleton-line" style={{ width: "100%", height: 34, marginTop: 14 }} />
      </div>
    </div>
  );
}

export default function WishlistSkeletonGrid({ count = 6, variant = "compact" }) {
  return (
    <div className={`zova-account-grid ${variant === "page" ? "is-wishlist-page" : "is-wishlist-compact"}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
}
