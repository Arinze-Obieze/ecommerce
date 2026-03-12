"use client";
import Link from "next/link";
import Head from "next/head";

export const B = {
  green:       "#00B86B",
  greenDark:   "#0A3D2E",
  greenMid:    "#0F7A4F",
  greenLight:  "#F0FBF5",
  greenBorder: "#D4EAE0",
  greenSub:    "#A8C4B8",
  white:       "#FFFFFF",
  cream:       "#F7FDF9",
  charcoal:    "#111111",
  g50:         "#F9FAFB",
  g100:        "#F3F4F6",
  g200:        "#E5E7EB",
  g400:        "#9CA3AF",
  g600:        "#4B5563",
  g800:        "#1F2937",
};

const LEGAL_NAV = [
  { label: "Privacy Policy",     href: "/privacy-policy"      },
  { label: "Cookie Policy",      href: "/cookie-policy"       },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "IP Notice",          href: "/ip-notice"           },
  { label: "Ad Choice",          href: "/ad-choice"           },
];

export function Section({ title, id, children }) {
  return (
    <section id={id} style={{ marginBottom: 40, scrollMarginTop: 24 }}>
      <h2 style={{
        fontSize: 18, fontWeight: 700, color: B.charcoal,
        marginBottom: 14, paddingBottom: 10,
        borderBottom: `2px solid ${B.greenBorder}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ width: 4, height: 20, background: B.green, borderRadius: 2, display: "inline-block", flexShrink: 0 }} />
        {title}
      </h2>
      <div style={{ fontSize: 14, color: B.g600, lineHeight: 1.85 }}>{children}</div>
    </section>
  );
}

export function P({ children, style = {} }) {
  return <p style={{ marginBottom: 12, ...style }}>{children}</p>;
}

export function Ul({ items }) {
  return (
    <ul style={{ marginBottom: 12, paddingLeft: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: B.greenLight, border: `1px solid ${B.greenBorder}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: B.green, flexShrink: 0, marginTop: 2 }}>✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function InfoBox({ children, icon = "ℹ️" }) {
  return (
    <div style={{ padding: "14px 18px", borderRadius: 10, background: B.greenLight, border: `1px solid ${B.greenBorder}`, display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 13, color: B.greenDark, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function LegalLayout({ title, icon, subtitle, lastUpdated, tocItems, children, currentHref }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          .toc-link { transition: color 0.15s, padding-left 0.15s; }
          .toc-link:hover { color: #00B86B !important; padding-left: 4px; }
          .legal-nav-link { transition: all 0.15s; }
          .legal-nav-link:hover { background: #F0FBF5 !important; color: #00B86B !important; }
          .legal-nav-link.active { background: #00B86B !important; color: #fff !important; }
        `}</style>
      </Head>

      <div style={{ background: B.cream, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

        {/* ── HERO ── */}
        <div style={{ background: `linear-gradient(150deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "56px 24px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,184,107,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,184,107,0.1)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: "rgba(0,184,107,0.2)", border: "1px solid rgba(0,184,107,0.35)", marginBottom: 18, fontSize: 11, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1.2, textTransform: "uppercase" }}>
              ⚖️ Legal & Policies
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,184,107,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{icon}</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: B.white, lineHeight: 1.15 }}>{title}</h1>
            </div>
            <p style={{ fontSize: 15, color: B.greenSub, lineHeight: 1.7, maxWidth: 560, marginBottom: 16 }}>{subtitle}</p>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Last updated: {lastUpdated} &nbsp;·&nbsp; ZOVA Limited &nbsp;·&nbsp; Onitsha, Anambra State, Nigeria</div>
          </div>
        </div>

        {/* ── LEGAL NAV STRIP ── */}
        <div style={{ background: B.white, borderBottom: `1px solid ${B.greenBorder}`, padding: "12px 24px", overflowX: "auto" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 8, minWidth: "max-content" }}>
            {LEGAL_NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`legal-nav-link${currentHref === href ? " active" : ""}`}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, textDecoration: "none",
                  border: `1px solid ${B.greenBorder}`,
                  background: currentHref === href ? B.green : B.white,
                  color: currentHref === href ? B.white : B.g600,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 72px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>

          {/* Sidebar TOC */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: B.white, borderRadius: 14, border: `1px solid ${B.greenBorder}`, padding: "20px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: B.green, marginBottom: 14 }}>Contents</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {tocItems.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="toc-link"
                    style={{ fontSize: 12, color: B.g600, textDecoration: "none", padding: "5px 0", fontWeight: 500, lineHeight: 1.4, display: "block" }}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${B.greenBorder}` }}>
                <a href="mailto:legal@zova.ng" style={{ fontSize: 12, color: B.green, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  ✉️ legal@zova.ng
                </a>
                <a href="https://wa.me/234XXXXXXXXXX" style={{ fontSize: 12, color: B.green, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  📲 WhatsApp Us
                </a>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div>
            {children}

            {/* Footer note */}
            <div style={{ marginTop: 48, padding: "20px 24px", borderRadius: 14, background: B.white, border: `1px solid ${B.greenBorder}`, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: B.g400, lineHeight: 1.7 }}>
                This document is part of the ZOVA Legal Framework. For questions, contact{" "}
                <a href="mailto:legal@zova.ng" style={{ color: B.green, fontWeight: 600 }}>legal@zova.ng</a>
                {" "}or visit our{" "}
                <Link href="/about" style={{ color: B.green, fontWeight: 600 }}>About page</Link>.
                <br />
                &copy; 2026 ZOVA Limited. All rights reserved. RC Number: [pending] &nbsp;|&nbsp; Onitsha Main Market, Anambra State, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}