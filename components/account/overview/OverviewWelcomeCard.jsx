"use client";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";

export default function OverviewWelcomeCard({ userName, email, initials }) {
  return (
    <div className="zova-account-welcome-card p-5 sm:p-7">
      <div className="flex min-w-0 w-full items-center gap-[18px] sm:w-auto">
        <div className="zova-account-avatar">{initials}</div>
        <div className="min-w-0">
          <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--zova-text-muted)]">
            Welcome back
          </p>
          <h1 className="m-0 break-words text-[22px] font-extrabold tracking-[-0.025em] text-[var(--zova-text-strong)]">
            {userName}
          </h1>
          <p className="m-0 mt-1 break-words text-[13px] text-[var(--zova-text-body)]">{email}</p>
        </div>
      </div>

      <Link href="/shop" className="zova-account-button is-primary w-full justify-center px-5 py-2.5 text-[13px] sm:w-auto">
        <FiShoppingBag size={14} />
        Continue Shopping
      </Link>
    </div>
  );
}
