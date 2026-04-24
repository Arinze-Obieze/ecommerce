"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Microsoft Fluent UI inspired palette mixed with ZOVA brand
export const B = {
  green:       "#2E6417",
  greenDark:   "#1F4210",
  greenLight:  "#F0FBF5",
  greenBorder: "#D4EAE0",
  white:       "#FFFFFF",
  bg:          "#FAFAFA", // Fluent background
  surface:     "#FFFFFF",
  charcoal:    "#201F1E", // Fluent neutralPrimary (Text)
  textSubtle:  "#605E5C", // Fluent neutralSecondary
  border:      "#EDEBE9", // Fluent neutralLight
  borderDark:  "#C8C6C4", // Fluent neutralTertiary
  hoverBg:     "#F3F2F1", // Fluent neutralLighter
  pressedBg:   "#EDEBE9",
};

const LEGAL_NAV = [
  { label: "Overview",           href: "/legal"                },
  { label: "Privacy Policy",     href: "/legal/privacy-policy"      },
  { label: "Cookie Policy",      href: "/legal/cookie-policy"       },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "IP Notice",          href: "/legal/ip-notice"           },
  { label: "Ad Choice",          href: "/legal/ad-choice"           },
];

export default function LegalLayout({ children }) {
  const pathname = usePathname();

  return (
    <div style={{ background: B.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        
        .legal-page-shell,
        .legal-page-shell * { box-sizing: border-box; }
        .legal-page-shell h1,
        .legal-page-shell h2,
        .legal-page-shell h3,
        .legal-page-shell p,
        .legal-page-shell ul {
          margin-top: 0;
        }
        html { scroll-behavior: smooth; }
        
        .toc-link { 
          transition: all 0.15s ease-in-out; 
          border-left: 2px solid transparent; 
        }
        .toc-link:hover { 
          color: #201F1E !important; 
          background: #F3F2F1;
        }
        
        .legal-nav-link { 
          transition: all 0.1s ease-out; 
          position: relative;
        }
        .legal-nav-link:hover { 
          background: #F3F2F1 !important; 
          color: #201F1E !important; 
        }
        .legal-nav-link:active {
          background: #EDEBE9 !important;
        }
        .legal-nav-link.active { 
          color: #201F1E !important; 
          font-weight: 600 !important;
        }
        /* Fluent active indicator (bottom border) */
        .legal-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 12px;
          right: 12px;
          height: 3px;
          background: #2E6417; /* ZOVA Green accent */
          border-radius: 3px 3px 0 0;
        }
        
        .legal-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 16px 80px;
          overflow-wrap: anywhere;
          word-wrap: break-word;
        }

        @media (min-width: 768px) {
          .legal-container {
            grid-template-columns: 260px 1fr;
            gap: 48px;
            padding: 32px 24px 80px;
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

      {/* ── LEGAL NAV STRIP (Pivot menu style) ── */}
      <div style={{ background: B.surface, borderBottom: `1px solid ${B.border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", overflowX: "auto", padding: "0 12px" }}>
          {LEGAL_NAV.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`legal-nav-link${isActive ? " active" : ""}`}
                style={{
                  padding: "14px 16px", 
                  fontSize: 14, 
                  fontWeight: 400, 
                  textDecoration: "none",
                  background: "transparent",
                  color: isActive ? B.charcoal : B.textSubtle,
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="legal-container">
        {children}
      </div>

    </div>
  );
}
