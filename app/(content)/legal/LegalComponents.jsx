"use client";
import { B } from "./layout";
import Link from "next/link";

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

export function LegalPageContainer({ title, icon, subtitle, lastUpdated, tocItems, children }) {
  return (
    <>
      <div style={{ gridColumn: "1 / -1", marginBottom: 24 }}>
        {/* ── HERO ── */}
        <div style={{ background: `linear-gradient(150deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "56px 24px 48px", position: "relative", overflow: "hidden", borderRadius: 24 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(46,100,23,0.1)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.35)", marginBottom: 18, fontSize: 11, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1.2, textTransform: "uppercase" }}>
              ⚖️ Legal & Policies
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(46,100,23,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{icon}</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: B.white, lineHeight: 1.15 }}>{title}</h1>
            </div>
            <p style={{ fontSize: 15, color: B.greenSub, lineHeight: 1.7, maxWidth: 560, marginBottom: 16 }}>{subtitle}</p>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Last updated: {lastUpdated} &nbsp;·&nbsp; ZOVA Limited &nbsp;·&nbsp; Onitsha, Anambra State, Nigeria</div>
          </div>
        </div>
      </div>

      {/* Sidebar TOC - Hidden on mobile in layout CSS, but let's make it explicit here if needed */}
      <div className="sidebar-sticky">
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
        {/* Mobile TOC Select / Quick links can go here or be handle by layout */}
        <div className="mobile-toc-trigger">
          <div style={{ background: B.white, borderRadius: 12, border: `1px solid ${B.greenBorder}`, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: B.green, marginBottom: 8, textTransform: "uppercase" }}>Quick Navigation</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tocItems.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{ fontSize: 11, color: B.g600, background: B.g100, padding: "4px 10px", borderRadius: 6, textDecoration: "none" }}
                >
                  {label.split(". ")[1] || label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </>
  );
}
