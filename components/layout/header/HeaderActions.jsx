"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiHeart, FiShoppingCart } from "react-icons/fi";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/contexts/cart/CartContext";
import { useWishlist } from "@/contexts/wishlist/WishlistContext";
import UserMenu from "@/components/layout/header/UserMenu";

function HeaderDivider({ mobileHidden = false }) {
  return (
    <div className={`${mobileHidden ? "hidden lg:block" : "hidden md:block"} zova-header-divider mx-1`} />
  );
}

function CurrencySelector() {
  return (
    <button type="button" className="zova-header-control is-pill hidden lg:inline-flex">
      <span>₦</span>
      <span>NGN</span>
      <FiChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

function WishlistButton() {
  const router = useRouter();
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();

  return (
    <button
      type="button"
      aria-label="Wishlist"
      className="zova-header-control"
      onClick={() => router.push(user ? "/wishlist" : "/login")}
    >
      <FiHeart className="h-5 w-5 md:h-[22px] md:w-[22px]" />
      {wishlistItems.size > 0 ? (
        <span className="zova-header-counter">{wishlistItems.size}</span>
      ) : null}
    </button>
  );
}

function CartButton() {
  const { cartCount } = useCart();

  return (
    <Link href="/cart" aria-label="Cart" className="zova-header-control">
      <FiShoppingCart className="h-5 w-5 md:h-[22px] md:w-[22px]" />
      {cartCount > 0 ? <span className="zova-header-counter">{cartCount}</span> : null}
    </Link>
  );
}

export default function HeaderActions({ user, signOut, adminRole }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <CurrencySelector />
      <HeaderDivider mobileHidden />
      <WishlistButton />
      <CartButton />
      <HeaderDivider />
      <UserMenu user={user} signOut={signOut} adminRole={adminRole} />
    </div>
  );
}
