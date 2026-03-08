"use client";
import React, { useState } from 'react';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaPinterest, FaSnapchat, FaTiktok,
  FaApple, FaAndroid,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaCcDiscover,
  FaArrowRight, FaCheckCircle, FaPhone, FaWhatsapp, FaShieldAlt,
} from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

// ============================================================
// 🎨 THEME — change colors here only
// ============================================================
const THEME = {
  // Page background
  footerBg:           "#FFFFFF",    // Pure White
  sectionAltBg:       "#F5F5F5",    // Soft Gray — alternating band

  // Dividers
  divider:            "#E8E8E8",

  // Newsletter band
  newsletterBg:       "#0A3D2E",    // Deep Emerald
  newsletterBorder:   "#ffffff14",
  newsletterHeading:  "#FFFFFF",
  newsletterSub:      "#A8C4B8",
  newsletterLabel:    "#00B86B",    // ZOVA Green

  // Newsletter inputs
  inputBg:            "#ffffff0D",
  inputBorder:        "#ffffff22",
  inputText:          "#FFFFFF",
  inputPlaceholder:   "#6B9E8A",

  // Newsletter submit buttons
  btnBg:              "#00B86B",
  btnHover:           "#0F7A4F",
  whatsappBg:         "#25D366",
  whatsappHover:      "#1ebe5d",
  successText:        "#00B86B",

  // Brand column
  logoAccent:         "#00B86B",    // ZOVA Green on "VA"
  logoText:           "#111111",    // Dark Charcoal
  taglineText:        "#666666",    // Medium Gray
  bodyText:           "#666666",

  // Navigation links
  navHeading:         "#111111",
  navLink:            "#666666",
  navLinkHover:       "#00B86B",

  // Social icons
  socialBg:           "#F5F5F5",
  socialBorder:       "#E8E8E8",
  socialIcon:         "#666666",
  socialHoverBg:      "#00B86B",
  socialHoverIcon:    "#FFFFFF",

  // App store buttons
  appBg:              "#111111",    // Dark Charcoal
  appHoverBg:         "#00B86B",
  appText:            "#FFFFFF",

  // Payment tiles
  paymentBg:          "#F5F5F5",
  paymentBorder:      "#E8E8E8",
  paymentIcon:        "#666666",

  // Trust badge strip
  trustBg:            "#F0FBF5",    // Faint green tint
  trustBorder:        "#D4EAE0",
  trustText:          "#0A3D2E",
  trustIcon:          "#00B86B",

  // Bottom bar
  bottomBg:           "#111111",    // Dark Charcoal
  bottomText:         "#999999",
  bottomLinkHover:    "#00B86B",
  copyrightText:      "#666666",

  // Back to top
  backTopBg:          "#00B86B",
  backTopHover:       "#0F7A4F",
  backTopText:        "#FFFFFF",
};
// ============================================================

const NAV_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "About Us",               href: "#" },
      { label: "Fashion Blogger",        href: "#" },
      { label: "Social Responsibility",  href: "#" },
      { label: "Careers",                href: "#" },
      { label: "Student Discount",       href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping Info",  href: "#" },
      { label: "Free Returns",   href: "#" },
      { label: "How To Order",   href: "#" },
      { label: "How To Track",   href: "#" },
      { label: "Size Guide",     href: "#" },
      { label: "Refund Policy",  href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",      href: "#" },
      { label: "Cookie Policy",       href: "#" },
      { label: "Terms & Conditions",  href: "#" },
      { label: "IP Notice",           href: "#" },
      { label: "Ad Choice",           href: "#" },
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
  { icon: "🔒", text: "SSL Secured Checkout"     },
  { icon: "✅", text: "Verified Sellers Only"     },
  { icon: "🚚", text: "Free Returns on All Orders"},
  { icon: "💬", text: "24/7 Customer Support"     },
];

const BOTTOM_LINKS = [
  "Privacy Center", "Cookie Policy", "Terms & Conditions", "IP Notice", "Ad Choice",
];

// ── Newsletter input row ──────────────────────────────────────
function SubscribeRow({ type, placeholder, value, onChange, onSubmit, success, SubmitIcon, submitBg, submitHover }) {
  const [hovering, setHovering] = useState(false);
  return (
    <form onSubmit={onSubmit}>
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ border: `1px solid ${THEME.inputBorder}`, backgroundColor: THEME.inputBg }}
      >
        {type === 'tel' && (
          <select
            className="text-xs border-r outline-none px-2"
            style={{
              backgroundColor: 'transparent',
              borderColor: THEME.inputBorder,
              color: THEME.inputText,
              minWidth: 60,
            }}
          >
            <option>+234</option>
            <option>+1</option>
            <option>+44</option>
          </select>
        )}
        <input
          type={type === 'tel' ? 'tel' : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
          style={{ color: THEME.inputText }}
        />
        <button
          type="submit"
          className="px-4 flex items-center justify-center transition-colors"
          style={{ backgroundColor: hovering ? submitHover : submitBg }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <SubmitIcon className="text-white text-sm" />
        </button>
      </div>
      {success && (
        <p className="text-xs mt-2 flex items-center gap-1" style={{ color: THEME.successText }}>
          <FaCheckCircle /> You're in!
        </p>
      )}
    </form>
  );
}

// ── Main Footer ───────────────────────────────────────────────
export default function Footer() {
  const pathname = usePathname();
  if (['/login', '/signup', '/register', '/forgot-password', '/reset-password'].includes(pathname)) return null;

  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [emailOk,  setEmailOk]  = useState(false);
  const [phoneOk,  setPhoneOk]  = useState(false);
  const [waOk,     setWaOk]     = useState(false);

  const flash = (setter) => { setter(true); setTimeout(() => setter(false), 3000); };

  return (
    <footer style={{ backgroundColor: THEME.footerBg, fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Trust badges strip ────────────────────────── */}
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

      {/* ── Newsletter band ───────────────────────────── */}
      <div style={{ backgroundColor: THEME.newsletterBg }}>
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Headline */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] mb-2" style={{ color: THEME.newsletterLabel }}>
                Stay in the loop
              </p>
              <h2 className="text-3xl font-black leading-tight" style={{ color: THEME.newsletterHeading }}>
                Never miss a drop.
              </h2>
              <p className="text-sm mt-1" style={{ color: THEME.newsletterSub }}>
                Exclusive offers, new arrivals & style inspo — your way.
              </p>
            </div>
            {/* Decorative pill */}
            <div
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold self-start md:self-auto"
              style={{ backgroundColor: "#00B86B22", border: "1px solid #00B86B44", color: "#00B86B" }}
            >
              🎁 Get 10% off your first order
            </div>
          </div>

          {/* Three input rows */}
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: THEME.newsletterSub }}>
                📧 Email
              </p>
              <SubscribeRow
                type="email" placeholder="your@email.com"
                value={email} onChange={setEmail}
                onSubmit={(e) => { e.preventDefault(); if (email) { flash(setEmailOk); setEmail(''); } }}
                success={emailOk} SubmitIcon={FaArrowRight}
                submitBg={THEME.btnBg} submitHover={THEME.btnHover}
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: THEME.newsletterSub }}>
                📱 SMS
              </p>
              <SubscribeRow
                type="tel" placeholder="Phone number"
                value={phone} onChange={setPhone}
                onSubmit={(e) => { e.preventDefault(); if (phone) { flash(setPhoneOk); setPhone(''); } }}
                success={phoneOk} SubmitIcon={FaPhone}
                submitBg={THEME.btnBg} submitHover={THEME.btnHover}
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: THEME.newsletterSub }}>
                💬 WhatsApp
              </p>
              <SubscribeRow
                type="tel" placeholder="WhatsApp number"
                value={whatsapp} onChange={setWhatsapp}
                onSubmit={(e) => { e.preventDefault(); if (whatsapp) { flash(setWaOk); setWhatsapp(''); } }}
                success={waOk} SubmitIcon={FaWhatsapp}
                submitBg={THEME.whatsappBg} submitHover={THEME.whatsappHover}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main body ─────────────────────────────────── */}
      <div style={{ backgroundColor: THEME.footerBg, borderTop: `1px solid ${THEME.divider}` }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-10">

            {/* Brand column */}
            <div className="col-span-2 flex flex-col gap-7">

              {/* Logo */}
              <div>
                <p className="text-2xl font-black tracking-tight" style={{ color: THEME.logoText }}>
                  ZO<span style={{ color: THEME.logoAccent }}>VA</span>
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-0.5" style={{ color: THEME.logoAccent }}>
                  Verified Quality. Zero Surprises.
                </p>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: THEME.bodyText, maxWidth: 220 }}>
                  Premium fashion for those who move with intention. Quality you feel, style you keep.
                </p>
              </div>

              {/* Social */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: THEME.navHeading }}>
                  Follow Us
                </p>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(({ Icon, label }) => (
                    <a
                      key={label} href="#" aria-label={label}
                      onClick={(e) => e.preventDefault()}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{ backgroundColor: THEME.socialBg, border: `1px solid ${THEME.socialBorder}`, color: THEME.socialIcon }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = THEME.socialHoverBg;
                        e.currentTarget.style.borderColor = THEME.socialHoverBg;
                        e.currentTarget.style.color = THEME.socialHoverIcon;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = THEME.socialBg;
                        e.currentTarget.style.borderColor = THEME.socialBorder;
                        e.currentTarget.style.color = THEME.socialIcon;
                      }}
                    >
                      <Icon className="text-sm" />
                    </a>
                  ))}
                </div>
              </div>

              {/* App downloads */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: THEME.navHeading }}>
                  Get The App
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[{ Icon: FaApple, label: 'App Store' }, { Icon: FaAndroid, label: 'Google Play' }].map(({ Icon, label }) => (
                    <a
                      key={label} href="#" onClick={(e) => e.preventDefault()}
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
                  style={{ color: THEME.navHeading, borderBottom: `2px solid ${THEME.logoAccent}`, display: 'inline-block' }}
                >
                  {section.title}
                </p>
                <ul className="space-y-3 mt-1">
                  {section.links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm transition-colors"
                        style={{ color: THEME.navLink }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = THEME.navLinkHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = THEME.navLink)}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Payment column */}
            <div className="col-span-1">
              <p
                className="text-[10px] font-black uppercase tracking-[0.18em] mb-4 pb-3"
                style={{ color: THEME.navHeading, borderBottom: `2px solid ${THEME.logoAccent}`, display: 'inline-block' }}
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

      {/* ── Bottom bar ────────────────────────────────── */}
      <div style={{ backgroundColor: THEME.bottomBg }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: THEME.copyrightText }}>
            © 2009–2026 <span style={{ color: THEME.backTopBg, fontWeight: 700 }}>ZOVA</span>. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            {BOTTOM_LINKS.map((link) => (
              <a
                key={link} href="#" onClick={(e) => e.preventDefault()}
                className="text-xs transition-colors"
                style={{ color: THEME.bottomText }}
                onMouseEnter={(e) => (e.currentTarget.style.color = THEME.bottomLinkHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = THEME.bottomText)}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Back to top ───────────────────────────────── */}
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