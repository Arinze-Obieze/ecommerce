"use client";

import Link from "next/link";

export default function FooterNavColumn({ title, links }) {
  return (
    <div className="zova-footer-section col-span-1">
      <p className="zova-footer-heading">{title}</p>
      <ul className="zova-footer-link-list mt-1 space-y-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} className="zova-footer-link text-sm">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
