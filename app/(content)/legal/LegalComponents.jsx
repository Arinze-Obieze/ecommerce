"use client";
import { B } from "./layout";
import Link from "next/link";
import { LuInfo } from "react-icons/lu";

export function Section({ title, id, children }) {
  return (
    <section id={id} style={{ marginBottom: 48, scrollMarginTop: 100 }}>
      {title && (
        <h2 style={{
          fontSize: 20, 
          fontWeight: 600, 
          color: B.charcoal,
          marginBottom: 16, 
          paddingBottom: 8,
          borderBottom: `1px solid ${B.border}`,
          display: "flex", 
          alignItems: "center", 
          gap: 12,
        }}>
          {title}
        </h2>
      )}
      <div style={{ fontSize: 15, color: B.charcoal, lineHeight: 1.6 }}>{children}</div>
    </section>
  );
}

export function P({ children, style = {} }) {
  return <p style={{ marginBottom: 16, color: B.charcoal, lineHeight: 1.6, ...style }}>{children}</p>;
}

export function Ul({ items }) {
  return (
    <ul style={{ marginBottom: 20, paddingLeft: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10, color: B.charcoal }}>
          <span style={{ 
            color: B.green, 
            display: "inline-block", 
            marginTop: 2, 
            fontWeight: "bold",
            fontSize: 14
          }}>•</span>
          <span style={{ lineHeight: 1.5 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function InfoBox({ children, icon = <LuInfo /> }) {
  return (
    <div style={{ 
      padding: "16px 20px", 
      borderRadius: 4, 
      background: B.hoverBg, 
      borderLeft: `4px solid ${B.green}`, 
      display: "flex", 
      gap: 16, 
      alignItems: "flex-start", 
      marginBottom: 20 
    }}>
      <span style={{ fontSize: 18, marginTop: -2, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 14, color: B.charcoal, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export function LegalPageContainer({ title, icon, subtitle, lastUpdated, tocItems, children }) {
  return (
    <>
      <div style={{ gridColumn: "1 / -1", marginBottom: 8 }}>
        {/* ── HERO (Fluent Style) ── */}
        <div style={{ 
          background: B.surface, 
          padding: "clamp(32px, 6vw, 48px) clamp(16px, 5vw, 32px) clamp(24px, 6vw, 40px)", 
          borderRadius: 8,
          border: `1px solid ${B.border}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.02), 0 0 2px rgba(0,0,0,0.04)"
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 6, background: B.greenLight, color: B.greenDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${B.greenBorder}` }}>{icon}</div>
              <h1 style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 600, color: B.charcoal, margin: 0, letterSpacing: "-0.01em" }}>{title}</h1>
            </div>
            <p style={{ fontSize: 16, color: B.textSubtle, lineHeight: 1.6, maxWidth: 640, marginBottom: 20 }}>{subtitle}</p>
            <div style={{ fontSize: 13, color: B.textSubtle, fontWeight: 400 }}>Last updated: {lastUpdated} &nbsp;·&nbsp; ZOVA Limited &nbsp;·&nbsp; Onitsha, Anambra State, Nigeria</div>
          </div>
        </div>
      </div>

      {/* Sidebar TOC - Sticky */}
      <div className="sidebar-sticky">
        <div style={{ 
          background: B.surface, 
          borderRadius: 8, 
          border: `1px solid ${B.border}`, 
          padding: "24px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: B.textSubtle, marginBottom: 16 }}>On this page</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tocItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="toc-link"
                style={{ fontSize: 14, color: B.charcoal, textDecoration: "none", padding: "4px 8px 4px 0", fontWeight: 400, lineHeight: 1.4, display: "block" }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${B.border}` }}>
            <a href="mailto:legal@zova.ng" style={{ fontSize: 13, color: B.green, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              ✉️ legal@zova.ng
            </a>
            <a href="https://wa.me/234XXXXXXXXXX" style={{ fontSize: 13, color: B.green, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              📲 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div>
        {/* Mobile TOC Select */}
        <div className="mobile-toc-trigger">
          <div style={{ background: B.surface, borderRadius: 8, border: `1px solid ${B.border}`, padding: "16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: B.textSubtle, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Navigation</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tocItems.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{ fontSize: 13, color: B.charcoal, background: B.bg, border: `1px solid ${B.border}`, padding: "6px 12px", borderRadius: 4, textDecoration: "none" }}
                >
                  {label.includes(". ") ? label.split(". ")[1] : label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content wrapper with Fluent typography space */}
        <div style={{ 
          background: B.surface, 
          padding: "clamp(24px, 5vw, 32px) clamp(16px, 5vw, 40px)", 
          borderRadius: 8, 
          border: `1px solid ${B.border}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
