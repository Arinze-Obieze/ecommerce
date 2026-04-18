"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { label: "Overview",           href: "/legal"                },
  { label: "Privacy Policy",     href: "/legal/privacy-policy"      },
  { label: "Cookie Policy",      href: "/legal/cookie-policy"       },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "IP Notice",          href: "/legal/ip-notice"           },
  { label: "Ad Choice",          href: "/legal/ad-choice"           },
];

export function Section({ title, id, children }) {
  return (
    <section id={id} style={{ marginBottom: 40, scrollMarginTop: 80 }}>
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

export default function LegalLayout({ children }) {
  const pathname = usePathname();

  // Find the current page data from children if passed as props or just from metadata
  // Since this is a layout, we need to handle the content dynamically.
  // We'll wrap the logic to extract page-specific info from the child if possible, 
  // or just pass it down via a context or rely on the fact that children will be the page.
  
  // However, the original LegalLayout was a wrapper component used inside pages.
  // In App Router, we usually want the layout to be the shell.
  // But since the pages have different TOCs and titles, we might keep it as a wrapper
  // OR use a Context to pass metadata up.
  
  // Given the current structure, I'll keep it as a shared layout but with the responsive fixes.
  // I'll make it so it can be used as a standard layout.

  return (
    <div style={{ background: B.cream, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .toc-link { transition: color 0.15s, padding-left 0.15s; }
        .toc-link:hover { color: #00B86B !important; padding-left: 4px; }
        .legal-nav-link { transition: all 0.15s; }
        .legal-nav-link:hover { background: #F0FBF5 !important; color: #00B86B !important; }
        .legal-nav-link.active { background: #00B86B !important; color: #fff !important; }
        
        .legal-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 72px;
        }

        @media (min-width: 768px) {
          .legal-container {
            grid-template-columns: 240px 1fr;
          }
        }
        
        .sidebar-sticky {
          position: sticky;
          top: 24px;
          display: none;
        }
        
        @media (min-width: 768px) {
          .sidebar-sticky {
            display: block;
          }
        }

        .mobile-toc-trigger {
          display: block;
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .mobile-toc-trigger {
            display: none;
          }
        }
      `}</style>

      {/* ── LEGAL NAV STRIP ── */}
      <div style={{ background: B.white, borderBottom: `1px solid ${B.greenBorder}`, padding: "12px 24px", overflowX: "auto", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 8, minWidth: "max-content" }}>
          {LEGAL_NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`legal-nav-link${pathname === href ? " active" : ""}`}
              style={{
                padding: "7px 14px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                border: `1px solid ${B.greenBorder}`,
                background: pathname === href ? B.green : B.white,
                color: pathname === href ? B.white : B.g600,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="legal-container">
        {/* Child components will handle their own TOC and Sidebar if they want, 
            or we can try to centralise it. For now, let's keep it flexible. */}
        {children}
      </div>

      {/* Footer note */}
      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ padding: "32px 24px", borderRadius: 14, background: B.white, border: `1px solid ${B.greenBorder}`, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: B.g400, lineHeight: 1.7 }}>
            This document is part of the ZOVA Legal Framework. For questions, contact{" "}
            <a href="mailto:legal@zova.ng" style={{ color: B.green, fontWeight: 600 }}>legal@zova.ng</a>
            <br />
            &copy; 2026 ZOVA Limited. All rights reserved. RC Number: [pending] &nbsp;|&nbsp; Onitsha Main Market, Anambra State, Nigeria
          </p>
        </div>
      </footer>
    </div>
  );
}
