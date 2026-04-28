"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiUser } from "react-icons/fi";

function MenuLink({ href, children, onSelect, danger = false }) {
  return (
    <Link
      href={href}
      className={`zova-header-menu-item ${danger ? "is-danger" : ""}`}
      onClick={onSelect}
    >
      {children}
    </Link>
  );
}

export default function UserMenu({ user, signOut, adminRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = Boolean(adminRole);
  const displayName =
    adminRole === "super_admin"
      ? "Super Admin"
      : user?.user_metadata?.full_name || "Account";

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`zova-header-menu-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`zova-header-avatar ${isOpen ? "is-open" : ""}`}>
          <FiUser className="h-4 w-4" />
        </span>
        <span className="hidden lg:flex flex-col items-start gap-0.5 leading-none">
          <span className="text-xs font-bold text-[var(--zova-text-strong)]">
            {user ? displayName.split(" ")[0] : "Account"}
          </span>
          {isAdmin ? <span className="zova-header-user-badge">Admin</span> : null}
        </span>
        <FiChevronDown className={`zova-header-caret h-3.5 w-3.5 ${isOpen ? "is-open" : ""}`} />
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div className="zova-header-dropdown absolute right-0 z-50 mt-2">
            {user ? (
              <>
                <div className="zova-header-dropdown-section px-4 py-3.5">
                  <p className="truncate text-sm font-bold text-[var(--zova-text-strong)]">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--zova-text-body)]">
                    {user.email}
                  </p>
                </div>

                <div className="zova-header-dropdown-section py-1">
                  {isAdmin ? (
                    <>
                      <MenuLink href="/admin" onSelect={closeMenu}>Dashboard</MenuLink>
                      <MenuLink href="/admin/profile" onSelect={closeMenu}>Profile</MenuLink>
                    </>
                  ) : (
                    <>
                      <MenuLink href="/profile" onSelect={closeMenu}>Profile</MenuLink>
                      <MenuLink href="/profile?tab=orders" onSelect={closeMenu}>My Orders</MenuLink>
                      <MenuLink href="/wishlist" onSelect={closeMenu}>Wishlist</MenuLink>
                    </>
                  )}
                </div>

                <div className="zova-header-dropdown-section py-1">
                  <button
                    type="button"
                    className="zova-header-menu-item is-danger"
                    onClick={async () => {
                      await signOut();
                      closeMenu();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="py-1">
                <MenuLink href="/login" onSelect={closeMenu}>Login</MenuLink>
                <MenuLink href="/signup" onSelect={closeMenu}>Create Account</MenuLink>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
