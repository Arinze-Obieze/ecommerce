"use client";

import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

function SocialLinks({ links }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--zova-text-strong)]">
        Follow Us
      </p>
      <div className="zova-footer-social-row flex flex-wrap gap-2">
        {links.map(({ Icon, label }) => (
          <a key={label} href="#" aria-label={label} className="zova-footer-action zova-footer-social">
            <Icon className="text-sm" />
          </a>
        ))}
      </div>
    </div>
  );
}

function AppLinks({ links }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--zova-text-strong)]">
        Get The App
      </p>
      <div className="zova-footer-app-row flex flex-wrap gap-2">
        {links.map(({ Icon, label }) => (
          <a key={label} href="#" className="zova-footer-action zova-footer-app">
            <Icon className="text-base" /> {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function FooterBrandPanel({ socialLinks, appLinks }) {
  return (
    <div className="zova-footer-brand-panel zova-footer-brand sm:col-span-2 lg:col-span-2">
      <div>
        <Link href="/" aria-label="ZOVA home" className="inline-flex">
          <BrandMark
            alt="ZOVA"
            priority
            className="h-[42px] w-[144px] sm:h-[46px] sm:w-[156px]"
          />
        </Link>
        <p className="zova-brand-kicker mt-3">Where trust meets the market</p>
        <p
          className="zova-footer-brand-copy mt-3 max-w-[260px] text-sm leading-relaxed text-[var(--zova-text-body)]"
        >
          Verified fashion from trusted sellers, with quality checks that keep shopping modern,
          clear, and dependable.
        </p>
      </div>

      <SocialLinks links={socialLinks} />
      <AppLinks links={appLinks} />
    </div>
  );
}
