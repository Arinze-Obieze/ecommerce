"use client";
import React from 'react';
import Link from 'next/link';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaPinterest, FaSnapchat, FaTiktok,
  FaApple, FaAndroid,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaCcDiscover,
} from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

// ─── BRAND THEME (Zova) ───────────────────────────────────────────────────────
const THEME = {
  footerBg:        "#FFFFFF",
  sectionAltBg:    "#F5F1EA",   // Soft Linen
  divider:         "#E8E4DC",
  logoAccent:      "#2E6417",   // Zova Forest
  logoText:        "#191B19",   // Onyx Black
  taglineText:     "#2E6417",
  bodyText:        "#6B6B6B",
  navHeading:      "#191B19",
  navLink:         "#6B6B6B",
  navLinkHover:    "#2E6417",
  socialBg:        "#F5F1EA",
  socialBorder:    "#E8E4DC",
  socialIcon:      "#6B6B6B",
  socialHoverBg:   "#2E6417",
  socialHoverIcon: "#FFFFFF",
  appBg:           "#191B19",   // Onyx Black
  appHoverBg:      "#2E6417",   // Zova Forest
  appText:         "#FFFFFF",
  paymentBg:       "#F5F1EA",
  paymentBorder:   "#E8E4DC",
  paymentIcon:     "#6B6B6B",
  trustBg:         "#EDF5E6",   // light green tint
  trustBorder:     "#B8D4A0",
  trustText:       "#2E6417",
  trustIcon:       "#2E6417",
  bottomBg:        "#191B19",   // Onyx Black
  bottomText:      "#888888",
  bottomLinkHover: "#EC9C00",   // Gold Harvest
  copyrightText:   "#888888",
  backTopBg:       "#EC9C00",   // Gold Harvest
  backTopHover:    "#d48c00",
  backTopText:     "#FFFFFF",
  headingUnderline:"#EC9C00",   // Gold Harvest accent under section headings
};

const NAV_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "About Us",              href: "/about"                },
      { label: "Fashion Blogger",       href: "/fashion-blogger"      },
      { label: "Social Responsibility", href: "/social-responsibility" },
      { label: "Careers",               href: "/careers"              },
      { label: "Student Discount",      href: "/student-discount"     },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping Info",  href: "/shipping-info"  },
      { label: "Free Returns",   href: "/return-policy"  },
      { label: "How To Order",   href: "/how-to-order"   },
      { label: "How To Track",   href: "/how-to-track"   },
      { label: "Size Guide",     href: "/size-guide"     },
      { label: "Refund Policy",  href: "/return-policy"  },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",     href: "/privacy-policy"       },
      { label: "Cookie Policy",      href: "/cookie-policy"        },
      { label: "Terms & Conditions", href: "/terms-and-conditions"  },
      { label: "IP Notice",          href: "/ip-notice"            },
      { label: "Ad Choice",          href: "/ad-choice"            },
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
  { icon: "🔒", text: "SSL Secured Checkout"      },
  { icon: "✅", text: "Verified Sellers Only"      },
  { icon: "🚚", text: "Free Returns on All Orders" },
  { icon: "💬", text: "24/7 Customer Support"      },
];

const BOTTOM_LINKS = [
  { label: "Privacy Center",     href: "/privacy-policy"       },
  { label: "Cookie Policy",      href: "/cookie-policy"        },
  { label: "Terms & Conditions", href: "/terms-and-conditions"  },
  { label: "IP Notice",          href: "/ip-notice"            },
  { label: "Ad Choice",          href: "/ad-choice"            },
];

export default function Footer() {
  const pathname = usePathname();
  if (['/login', '/signup', '/register', '/forgot-password', '/reset-password'].includes(pathname)) return null;

  return (
    <footer style={{ backgroundColor: THEME.footerBg, fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Trust badges strip ── */}
      <div style={{ backgroundColor: THEME.trustBg, borderTop: `1px solid ${THEME.trustBorder}`, borderBottom: `1px solid ${THEME.trustBorder}` }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="text-lg">{icon}</span>
                <span className="text-xs font-semibold" style={{ color: THEME.trustText }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div style={{ backgroundColor: THEME.footerBg, borderTop: `1px solid ${THEME.divider}` }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-10">

            {/* Brand column */}
            <div className="col-span-2 flex flex-col gap-7">
              <div>
                <p className="text-2xl font-black tracking-tight" style={{ color: THEME.logoText }}>
                  ZO<span style={{ color: THEME.logoAccent }}>VA</span>
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-0.5" style={{ color: THEME.taglineText }}>
                  Where Trust Meets the Market.
                </p>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: THEME.bodyText, maxWidth: 220 }}>
                  Premium fashion for those who move with intention. Quality you feel, style you keep.
                </p>
              </div>

              {/* Social */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: THEME.navHeading }}>Follow Us</p>
                <div className="flex flex-wrap gap-2">
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
                <div className="flex gap-2 flex-wrap">
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
              <div key={section.title} className="col-span-1">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.18em] mb-4 pb-3"
                  style={{ color: THEME.navHeading, borderBottom: `2px solid ${THEME.headingUnderline}`, display: 'inline-block' }}
                >
                  {section.title}
                </p>
                <ul className="space-y-3 mt-1">
                  {section.links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm transition-colors"
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
            <div className="col-span-1">
              <p
                className="text-[10px] font-black uppercase tracking-[0.18em] mb-4 pb-3"
                style={{ color: THEME.navHeading, borderBottom: `2px solid ${THEME.headingUnderline}`, display: 'inline-block' }}
              >
                We Accept
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
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
              <p className="text-[11px] mt-4 flex items-center gap-1.5 font-medium" style={{ color: THEME.bodyText }}>
                🔒 SSL secured checkout
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ backgroundColor: THEME.bottomBg }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: THEME.copyrightText }}>
            &copy; 2009&ndash;2026 <span style={{ color: THEME.backTopBg, fontWeight: 700 }}>ZOVA</span>. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
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
        className="fixed bottom-8 right-8 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-40 transition-colors"
        style={{ backgroundColor: THEME.backTopBg, color: THEME.backTopText }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.backTopHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.backTopBg)}
      >
        <FiArrowUp className="w-4 h-4" />
      </button>

    </footer>
  );
}