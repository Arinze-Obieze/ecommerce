"use client";

import BackToTopButton from "@/components/layout/footer/BackToTopButton";
import FooterBottomBar from "@/components/layout/footer/FooterBottomBar";
import FooterBrandPanel from "@/components/layout/footer/FooterBrandPanel";
import FooterNavColumn from "@/components/layout/footer/FooterNavColumn";
import FooterPayments from "@/components/layout/footer/FooterPayments";
import FooterTrustBar from "@/components/layout/footer/FooterTrustBar";
import {
  APP_LINKS,
  BOTTOM_LINKS,
  NAV_SECTIONS,
  PAYMENT_ICONS,
  SOCIAL_LINKS,
  TRUST_BADGES,
} from "@/components/layout/footer/footer.constants";

export default function Footer() {
  return (
    <footer className="zova-footer">
      <FooterTrustBar items={TRUST_BADGES} />

      <div className="zova-footer-main-surface">
        <div className="zova-footer-main mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="zova-footer-grid grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-10 lg:grid-cols-7">
            <FooterBrandPanel socialLinks={SOCIAL_LINKS} appLinks={APP_LINKS} />

            {NAV_SECTIONS.map((section) => (
              <FooterNavColumn key={section.title} title={section.title} links={section.links} />
            ))}

            <FooterPayments icons={PAYMENT_ICONS} />
          </div>
        </div>
      </div>

      <FooterBottomBar links={BOTTOM_LINKS} />
      <BackToTopButton />
    </footer>
  );
}
