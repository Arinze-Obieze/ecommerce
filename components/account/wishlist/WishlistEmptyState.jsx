"use client";

import Link from "next/link";
import { FiHeart, FiShoppingBag } from "react-icons/fi";

export default function WishlistEmptyState({
  ctaLabel = "Start Shopping",
  ctaHref = "/shop",
  description = "Save items you love and come back to them whenever you're ready.",
}) {
  return (
    <div className="zova-account-empty">
      <div className="zova-account-empty-icon">
        <FiHeart size={26} />
      </div>
      <h3 className="zova-account-empty-title">Your wishlist is empty</h3>
      <p className="zova-account-empty-copy">{description}</p>
      <Link href={ctaHref} className="zova-account-button is-primary" style={{ padding: "13px 28px" }}>
        <FiShoppingBag size={15} />
        {ctaLabel}
      </Link>
    </div>
  );
}
