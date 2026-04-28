"use client";

import Link from "next/link";

export default function FooterBottomBar({ links }) {
  return (
    <div className="zova-footer-bottom">
      <div className="zova-footer-bottom-shell zova-footer-bottom mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:px-6 md:flex-row">
        <p className="text-center text-xs text-[#888888] md:text-left">
          &copy; 2026 <span className="font-bold text-[var(--zova-accent-emphasis)]">ZOVA</span>.
          {" "}All Rights Reserved.
        </p>
        <div className="zova-footer-bottom-links flex flex-wrap justify-center gap-x-4 gap-y-2">
          {links.map(({ label, href }) => (
            <Link key={label} href={href} className="zova-footer-bottom-link text-xs">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
