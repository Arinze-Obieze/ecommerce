"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaPinterest, FaSnapchat, FaTiktok,
  FaApple, FaAndroid,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaCcDiscover,
} from 'react-icons/fa';
import { FiArrowUp, FiCheckCircle, FiHeadphones, FiShield } from 'react-icons/fi';

// Brand tokens — sourced from app/globals.css
const THEME = {
  footerBg:        '#FFFFFF',
  sectionAltBg:    'var(--zova-linen)',
  divider:         'var(--zova-border)',
  logoAccent:      'var(--zova-primary-action)',
  logoText:        'var(--zova-ink)',
  taglineText:     'var(--zova-primary-action)',
  bodyText:        'var(--zova-text-body)',
  navHeading:      'var(--zova-ink)',
  navLink:         'var(--zova-text-body)',
  navLinkHover:    'var(--zova-primary-action)',
  socialBg:        'var(--zova-linen)',
  socialBorder:    'var(--zova-border)',
  socialIcon:      'var(--zova-text-body)',
  socialHoverBg:   'var(--zova-primary-action)',
  socialHoverIcon: '#FFFFFF',
  appBg:           'var(--zova-ink)',
  appHoverBg:      'var(--zova-primary-action)',
  appText:         '#FFFFFF',
  paymentBg:       'var(--zova-linen)',
  paymentBorder:   'var(--zova-border)',
  paymentIcon:     'var(--zova-text-body)',
  trustBg:         'var(--zova-green-soft)',
  trustBorder:     '#B8D4A0',
  trustText:       'var(--zova-primary-action)',
  trustIcon:       'var(--zova-primary-action)',
  bottomBg:        'var(--zova-ink)',
  bottomText:      '#888888',
  bottomLinkHover: 'var(--zova-accent-emphasis)',
  copyrightText:   '#888888',
  backTopBg:       'var(--zova-accent-emphasis)',
  backTopHover:    'var(--zova-warning)',
  backTopText:     '#FFFFFF',
  headingUnderline:'var(--zova-accent-emphasis)',
};

const NAV_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "About Us",              href: "/about"                },
      { label: "Shop",                  href: "/shop"                 },
      { label: "Stores",                href: "/stores"               },
      { label: "Top Stores",            href: "/stores"               },
      { label: "Seller Profiles",       href: "/stores"               },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping Info",  href: "/shipping-info"  },
      { label: "Free Returns",   href: "/return-policy"  },
      { label: "How To Order",   href: "/how-to-order"   },
      { label: "How To Track",   href: "/how-to-track"   },
      { label: "Refund Policy",  href: "/return-policy"  },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",     href: "/legal/privacy-policy"      },
      { label: "Cookie Policy",      href: "/legal/cookie-policy"       },
      { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
      { label: "IP Notice",          href: "/legal/ip-notice"           },
      { label: "Ad Choice",          href: "/legal/ad-choice"           },
    ],
  },
];

const SOCIAL_LINKS = [
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaFacebook,  label: "Facebook"  },
  { Icon: FaTiktok,    label: "TikTok"    },
  { Icon: FaTwitter,   label: "Twitter"   },
  { Icon: FaYoutube,   label: "YouTube"   },
  { Icon: FaPinterest, label: "Pinterest" },
  { Icon: FaSnapchat,  label: "Snapchat"  },
];

const PAYMENT_ICONS = [FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaCcDiscover];

const TRUST_BADGES = [
  { Icon: FiShield, text: "Secure Checkout"      },
  { Icon: FiCheckCircle, text: "Verified Sellers"      },
  { icon: "🚚", text: "Free Returns" },
  { Icon: FiHeadphones, text: "Customer Support"      },
];

const BOTTOM_LINKS = [
  { label: "Privacy Center",     href: "/legal/privacy-policy"      },
  { label: "Cookie Policy",      href: "/legal/cookie-policy"       },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "IP Notice",          href: "/legal/ip-notice"           },
  { label: "Ad Choice",          href: "/legal/ad-choice"           },
];

export default function Footer() {
  return (
    <footer className="zova-footer" style={{ backgroundColor: THEME.footerBg, fontFamily: "var(--zova-font-sans)" }}>
      <style>{`
        @media (max-width: 640px) {
          .zova-footer-main {
            padding-top: 28px !important;
            padding-bottom: 28px !important;
          }

          .zova-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 28px 18px !important;
          }

          .zova-footer-brand {
            grid-column: 1 / -1;
            align-items: center;
            text-align: center;
            gap: 18px !important;
          }

          .zova-footer-brand-copy {
            margin-left: auto;
            margin-right: auto;
            max-width: 280px !important;
          }

          .zova-footer-social,
          .zova-footer-apps,
          .zova-footer-payments {
            justify-content: center;
          }

          .zova-footer-section {
            min-width: 0;
          }

          .zova-footer-section-title {
            margin-bottom: 10px !important;
            padding-bottom: 7px !important;
            letter-spacing: 0.14em !important;
          }

          .zova-footer-link-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 0 !important;
          }

          .zova-footer-link-list li {
            margin: 0 !important;
          }

          .zova-footer-link {
            display: inline-block;
            line-height: 1.25;
          }

          .zova-footer-payment-column {
            grid-column: 1 / -1;
            text-align: center;
          }

          .zova-footer-bottom {
            padding-bottom: 22px !important;
          }

          .zova-footer-bottom-links {
            max-width: 300px;
            line-height: 1.45;
          }

          .zova-footer-backtop {
            width: 36px !important;
            height: 36px !important;
            right: 14px !important;
            bottom: 14px !important;
          }
        }

        @media (max-width: 380px) {
          .zova-footer-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }

          .zova-footer-section-title {
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>

      {/* ── Trust badges strip ── */}
      <div style={{ backgroundColor: THEME.trustBg, borderTop: `1px solid ${THEME.trustBorder}`, borderBottom: `1px solid ${THEME.trustBorder}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {TRUST_BADGES.map(({ Icon, icon, text }) => (
              <div
                key={text}
                className="flex items-center justify-center sm:justify-start gap-2.5 text-center sm:text-left rounded-lg bg-white/55 px-3 py-2"
                style={{ border: `1px solid ${THEME.trustBorder}` }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm"
                  style={{ backgroundColor: THEME.footerBg, color: THEME.trustIcon }}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : icon}
                </span>
                <span className="text-xs font-bold" style={{ color: THEME.trustText }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div style={{ backgroundColor: THEME.footerBg, borderTop: `1px solid ${THEME.divider}` }}>
        <div className="zova-footer-main max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="zova-footer-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-9 sm:gap-10">

            {/* Brand column */}
            <div className="zova-footer-brand sm:col-span-2 lg:col-span-2 flex flex-col gap-7">
              <div>
                <Link href="/" aria-label="ZOVA home" className="inline-flex">
                  <Image
                    src="/brand/logo.svg"
                    alt="ZOVA"
                    width={136}
                    height={40}
                    className="h-auto w-[136px]"
                    priority
                  />
                </Link>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-3" style={{ color: THEME.taglineText }}>
                  Where trust meets the market
                </p>
                <p className="zova-footer-brand-copy text-sm mt-3 leading-relaxed" style={{ color: THEME.bodyText, maxWidth: 260 }}>
                  Verified fashion from trusted sellers, with quality checks that keep shopping modern, clear, and dependable.
                </p>
              </div>

              {/* Social */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: THEME.navHeading }}>Follow Us</p>
                <div className="zova-footer-social flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(({ Icon, label }) => (
                    <a
                      key={label} href="#" aria-label={label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{ backgroundColor: THEME.socialBg, border: `1px solid ${THEME.socialBorder}`, color: THEME.socialIcon }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = THEME.socialHoverBg; e.currentTarget.style.borderColor = THEME.socialHoverBg; e.currentTarget.style.color = THEME.socialHoverIcon; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = THEME.socialBg; e.currentTarget.style.borderColor = THEME.socialBorder; e.currentTarget.style.color = THEME.socialIcon; }}
                    >
                      <Icon className="text-sm" />
                    </a>
                  ))}
                </div>
              </div>

              {/* App downloads */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: THEME.navHeading }}>Get The App</p>
                <div className="zova-footer-apps flex gap-2 flex-wrap">
                  {[{ Icon: FaApple, label: 'App Store' }, { Icon: FaAndroid, label: 'Google Play' }].map(({ Icon, label }) => (
                    <a
                      key={label} href="#"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150"
                      style={{ backgroundColor: THEME.appBg, color: THEME.appText }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.appHoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.appBg)}
                    >
                      <Icon className="text-base" /> {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Nav columns */}
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="zova-footer-section col-span-1">
                <p
                  className="zova-footer-section-title text-[10px] font-black uppercase tracking-[0.18em] mb-4 pb-3"
                  style={{ color: THEME.navHeading, borderBottom: `2px solid ${THEME.headingUnderline}`, display: 'inline-block' }}
                >
                  {section.title}
                </p>
                <ul className="zova-footer-link-list space-y-3 mt-1">
                  {section.links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="zova-footer-link text-sm transition-colors"
                        style={{ color: THEME.navLink }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = THEME.navLinkHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = THEME.navLink)}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Payment column */}
            <div className="zova-footer-payment-column col-span-1">
              <p
                className="zova-footer-section-title text-[10px] font-black uppercase tracking-[0.18em] mb-4 pb-3"
                style={{ color: THEME.navHeading, borderBottom: `2px solid ${THEME.headingUnderline}`, display: 'inline-block' }}
              >
                We Accept
              </p>
              <div className="zova-footer-payments flex flex-wrap gap-2 mt-1">
                {PAYMENT_ICONS.map((Icon, i) => (
                  <div
                    key={i}
                    className="w-12 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: THEME.paymentBg, border: `1px solid ${THEME.paymentBorder}` }}
                  >
                    <Icon className="text-xl" style={{ color: THEME.paymentIcon }} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-4 flex items-center gap-1.5 font-medium justify-center sm:justify-start" style={{ color: THEME.bodyText }}>
                <FiShield className="h-3.5 w-3.5" style={{ color: THEME.logoAccent }} />
                Secure payment processing
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ backgroundColor: THEME.bottomBg }}>
        <div className="zova-footer-bottom max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-center md:text-left" style={{ color: THEME.copyrightText }}>
            &copy; 2009&ndash;2026 <span style={{ color: THEME.backTopBg, fontWeight: 700 }}>ZOVA</span>. All Rights Reserved.
          </p>
          <div className="zova-footer-bottom-links flex flex-wrap justify-center gap-x-4 gap-y-2">
            {BOTTOM_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs transition-colors"
                style={{ color: THEME.bottomText }}
                onMouseEnter={(e) => (e.currentTarget.style.color = THEME.bottomLinkHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = THEME.bottomText)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Back to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className="zova-footer-backtop fixed bottom-5 right-5 sm:bottom-8 sm:right-8 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-40 transition-colors"
        style={{ backgroundColor: THEME.backTopBg, color: THEME.backTopText }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.backTopHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.backTopBg)}
      >
        <FiArrowUp className="w-4 h-4" />
      </button>

    </footer>
  );
}
