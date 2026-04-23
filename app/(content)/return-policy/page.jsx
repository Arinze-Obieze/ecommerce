"use client";
import { useState } from "react";
import Head from "next/head";

// ─── Brand tokens (ZOVA Green theme) ────────────────────────
const B = {
  green:      "#2E6417",
  greenDark:  "#191B19",
  greenMid:   "#245213",
  greenLight: "#F0FBF5",
  greenBorder:"#D4EAE0",
  greenSub:   "#A8C4B8",
  white:      "#FFFFFF",
  cream:      "#F7FDF9",
  g50:        "#F9FAFB",
  g100:       "#F3F4F6",
  g200:       "#E5E7EB",
  g400:       "#9CA3AF",
  g600:       "#4B5563",
  g800:       "#1F2937",
  charcoal:   "#111111",
  red:        "#DC2626",
  redBg:      "#FEF2F2",
  blue:       "#2563EB",
  blueBg:     "#EFF6FF",
  orange:     "#D97706",
  orangeBg:   "#FFFBEB",
  accentGold: "#E8A838",
};

// ─── Data ───────────────────────────────────────────────────
const RETURN_TYPES = [
  {
    id: "seller",
    icon: "🏪",
    title: "Seller-Fault Return",
    subtitle: "The seller made a mistake",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    scenarios: [
      "Wrong item was sent to you",
      "Item is damaged or defective",
      "Item does not match the listing photos or description",
      "Counterfeit or fake branded item",
      "Wrong size was sent",
      "Poor quality — stains, tears, or undisclosed defects",
    ],
    refund: "100%",
    refundNote: "Full refund of purchase price",
    shipping: "Free return shipping",
    shippingNote: "Seller pays return shipping",
    timeline: "Refund processed within 48 hours of inspection",
    extra: null,
  },
  {
    id: "customer",
    icon: "🛒",
    title: "Customer-Fault Return",
    subtitle: "You changed your mind",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    scenarios: [
      "Changed your mind about the purchase",
      "Ordered the wrong size (despite our size guide)",
      "Buyer remorse",
    ],
    refund: "80-85%",
    refundNote: "Purchase price minus 15-20% restocking fee",
    shipping: "You pay return shipping",
    shippingNote: "Return shipping charged to you",
    timeline: "Refund processed within 48 hours of inspection",
    extra: "Item must be unworn, unwashed, with all tags attached",
  },
  {
    id: "exchange",
    icon: "🔄",
    title: "Size Exchange",
    subtitle: "Right item, wrong fit",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    scenarios: [
      "Item fits the stated measurements but does not suit your body",
      "You need a different size of the same item",
    ],
    refund: "Exchange",
    refundNote: "We will send you the correct size",
    shipping: "Small return fee",
    shippingNote: "You pay a small fee; ZOVA ships the new size free",
    timeline: "New size dispatched within 24 hours of receiving return",
    extra: "If your size is unavailable, you will receive an 80-85% refund",
  },
  {
    id: "zova",
    icon: "✅",
    title: "Our Mistake",
    subtitle: "ZOVA takes full responsibility",
    color: "#2E6417",
    bg: "#F0FBF5",
    border: "#A7F3D0",
    scenarios: [
      "Our quality check missed a defect",
      "Item was damaged at our Hub during handling",
      "Package was lost by our logistics partner",
    ],
    refund: "100% + Bonus",
    refundNote: "Full refund plus additional compensation",
    shipping: "Free return shipping",
    shippingNote: "ZOVA pays all shipping costs",
    timeline: "Refund processed within 24 hours",
    extra: "You may also receive a credit toward your next purchase",
  },
];

const STEPS = [
  { num: "01", title: "Start Your Return", icon: "📱", desc: "Log in to your ZOVA account, go to My Orders, select the item, and tap Return This Item. Choose your reason and upload photos." },
  { num: "02", title: "We Review",          icon: "🔍", desc: "Our Returns Team reviews your request within 24 hours. We will approve, request more info, or explain if the return does not qualify." },
  { num: "03", title: "Ship It Back",       icon: "📦", desc: "Once approved, send the item to our Hub within 48 hours. We will provide a return label or arrange pickup depending on your location." },
  { num: "04", title: "We Inspect",         icon: "🔬", desc: "Our QC team inspects the returned item at the Hub within 24 hours of receipt, comparing it against original QC photos." },
  { num: "05", title: "Get Your Refund",    icon: "💰", desc: "Refund is processed to your original payment method within 48 hours of inspection. Bank processing may take 1-3 additional business days." },
];

const FAQS = [
  { q: "How long do I have to return an item?",          a: "You have 7 calendar days from the date of delivery to initiate a return. For seasonal items (holiday or event-themed clothing), the return window is 3 days." },
  { q: "What condition must the item be in?",             a: "For Customer-Fault returns, the item must be unworn, unwashed, unaltered, and have all original tags attached. For Seller-Fault or ZOVA-Fault returns, simply return the item as-is." },
  { q: "What about high-value items?",                    a: "High-value items have enhanced protections. You must provide an unboxing video to initiate a return. These items go through an extended inspection process (up to 5 business days)." },
  { q: "What if someone swapped my item during delivery?",a: "We take return fraud seriously. Every item is photographed during QC before shipping. If the returned item does not match our records, we investigate. Honest customers are always protected." },
  { q: "Can I return sale or promotional items?",         a: "Items bought during Flash Sales or promotional events cannot be returned for Customer-Fault reasons. However, Seller-Fault and ZOVA-Fault returns are always honoured regardless of sale status." },
  { q: "How do I track my refund?",                      a: "You can track the full status of your return and refund in real-time from My Orders on the ZOVA app or website. You will also receive SMS and email notifications at each stage." },
  { q: "What if I disagree with the return decision?",    a: "You can request a review by contacting our support team within 48 hours of the decision. A senior team member who was not involved in the original decision will re-examine your case." },
];

// ─── Sub-components ─────────────────────────────────────────
function ReturnCard({ data, isExpanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: B.white,
        borderRadius: 16,
        border: `2px solid ${isExpanded ? data.border : B.g200}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: isExpanded ? `0 8px 30px ${data.color}20` : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: data.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            {data.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: B.charcoal, lineHeight: 1.3 }}>{data.title}</div>
            <div style={{ fontSize: 14, color: B.g400, marginTop: 2 }}>{data.subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: data.bg, fontWeight: 700, fontSize: 14, color: data.color, whiteSpace: "nowrap" }}>
            {data.refund} Refund
          </div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isExpanded ? B.green : B.g100, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: isExpanded ? B.white : B.g400, transition: "transform 0.3s ease", display: "block", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${B.greenBorder}` }}>
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: B.green, marginBottom: 10 }}>
              This applies when:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {data.scenarios.map((s, i) => (
                <span key={i} style={{ padding: "6px 12px", borderRadius: 8, background: B.greenLight, border: `1px solid ${B.greenBorder}`, fontSize: 13, color: B.g600 }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 12, background: data.bg, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: data.color }}>{data.refund}</div>
                <div style={{ fontSize: 12, color: B.g600, marginTop: 4 }}>{data.refundNote}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: B.greenLight, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: B.greenDark }}>{data.shipping}</div>
                <div style={{ fontSize: 12, color: B.g600, marginTop: 4 }}>{data.shippingNote}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: B.greenLight, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: B.greenDark }}>Timeline</div>
                <div style={{ fontSize: 12, color: B.g600, marginTop: 4 }}>{data.timeline}</div>
              </div>
            </div>
            {data.extra && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: 13, color: "#D97706", display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠️</span> {data.extra}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div onClick={onToggle} style={{ padding: "18px 0", borderBottom: `1px solid ${B.greenBorder}`, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: B.charcoal, lineHeight: 1.5 }}>{q}</div>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: isOpen ? B.green : B.greenLight,
          border: `1px solid ${isOpen ? B.green : B.greenBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 2, transition: "all 0.2s ease",
        }}>
          <span style={{ fontSize: 14, color: isOpen ? B.white : B.green, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", display: "block", transition: "transform 0.2s ease", lineHeight: 1 }}>+</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ marginTop: 12, fontSize: 14, color: B.g600, lineHeight: 1.8, paddingRight: 32, paddingLeft: 0, borderLeft: `3px solid ${B.green}`, paddingLeft: 14, marginLeft: 0 }}>{a}</div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────
export default function ReturnPolicyPage() {
  const [expandedCard, setExpandedCard] = useState("seller");
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ background: B.cream, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

        {/* ── HERO ── */}
        <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "64px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(46,100,23,0.12)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,100,23,0.08)" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
            {/* pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 20, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.4)", marginBottom: 22, fontSize: 12, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1, textTransform: "uppercase" }}>
              🛡️ Buyer Protection
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 900, color: B.white, lineHeight: 1.15, marginBottom: 16, letterSpacing: -0.5 }}>
              Returns &amp; Refund Policy
            </h1>
            <p style={{ fontSize: 17, color: B.greenSub, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
              Every item on ZOVA is quality-checked before it ships to you. If something is not right, we make it easy to fix.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 40, flexWrap: "wrap", background: "rgba(255,255,255,0.07)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", maxWidth: 480, margin: "40px auto 0" }}>
              {[{ val: "7 Days", label: "Return Window" }, { val: "100%", label: "QC Verified" }, { val: "48hrs", label: "Max Refund Time" }].map((s, i) => (
                <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "20px 12px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: B.green }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: B.greenSub, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TRUST BANNER ── */}
        <div style={{ background: B.white, borderBottom: `1px solid ${B.greenBorder}`, padding: "14px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["Every item inspected before shipping", "Photos taken at QC for your protection", "Fraud protection for honest buyers"].map((t) => (
              <span key={t} style={{ fontSize: 13, fontWeight: 600, color: B.greenMid, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: B.green, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: B.white, flexShrink: 0 }}>✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 24px 64px" }}>

          {/* ── RETURN TYPES ── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 8 }}>Return Categories</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: B.charcoal, marginBottom: 6 }}>What type of return is this?</h2>
            <p style={{ fontSize: 15, color: B.g600, lineHeight: 1.6, marginBottom: 24 }}>
              Tap a category to see full details. Who pays depends on who is at fault — and we always protect honest customers.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {RETURN_TYPES.map((rt) => (
                <ReturnCard
                  key={rt.id}
                  data={rt}
                  isExpanded={expandedCard === rt.id}
                  onToggle={() => setExpandedCard(expandedCard === rt.id ? null : rt.id)}
                />
              ))}
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 8 }}>Step by Step</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: B.charcoal, marginBottom: 28 }}>How to return an item</h2>
            <div style={{ position: "relative" }}>
              {/* vertical line */}
              <div style={{ position: "absolute", left: 23, top: 24, bottom: 24, width: 2, background: `linear-gradient(to bottom, ${B.green}, ${B.greenBorder})` }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                {STEPS.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 20, padding: "16px 0", position: "relative" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: i === 0 ? B.green : B.white,
                      border: `2px solid ${i === 0 ? B.green : B.greenBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0, zIndex: 1,
                      boxShadow: i === 0 ? `0 4px 12px ${B.green}40` : "none",
                    }}>
                      {step.icon}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: B.charcoal, marginBottom: 4 }}>
                        <span style={{ color: B.green, marginRight: 8, fontWeight: 800 }}>{step.num}</span>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 14, color: B.g600, lineHeight: 1.65 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FRAUD PROTECTION ── */}
          <div style={{ marginBottom: 52, background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, borderRadius: 20, padding: 36, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(46,100,23,0.1)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(46,100,23,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 16 }}>🛡️</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: B.white, marginBottom: 12 }}>Swap Fraud Protection</h3>
              <p style={{ fontSize: 14, color: B.greenSub, lineHeight: 1.8, marginBottom: 20, maxWidth: 580 }}>
                Every item is photographed from multiple angles during our quality check before it ships. If a returned item does not match our records, we investigate immediately. Honest buyers are always protected. Fraudulent returners are blocked and reported.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["4+ QC photos per item", "Unique markings documented", "Video records for high-value items"].map((t) => (
                  <span key={t} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.3)", fontSize: 12, fontWeight: 600, color: "#7FFFC4" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 8 }}>Got Questions?</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: B.charcoal, marginBottom: 20 }}>Frequently Asked Questions</h2>
            <div style={{ background: B.white, borderRadius: 16, border: `1px solid ${B.greenBorder}`, padding: "0 24px" }}>
              {FAQS.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>

          {/* ── CONTACT CTA ── */}
          <div style={{ background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, padding: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${B.green}, ${B.greenMid})` }} />
            <div style={{ width: 56, height: 56, borderRadius: 16, background: B.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>💬</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: B.charcoal, marginBottom: 8 }}>Still need help?</h3>
            <p style={{ fontSize: 14, color: B.g600, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 24px" }}>
              Our support team is available Monday to Saturday, 8 AM to 8 PM WAT. We respond within 2 hours.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a href="https://wa.me/234XXXXXXXXXX" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: B.green, color: B.white, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 14px ${B.green}40` }}>
                📲 WhatsApp Us
              </a>
              <a href="mailto:support@zova.ng" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: B.greenLight, color: B.greenDark, fontSize: 14, fontWeight: 700, textDecoration: "none", border: `1px solid ${B.greenBorder}` }}>
                ✉️ Email Support
              </a>
            </div>
          </div>

          {/* ── LEGAL ── */}
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: B.g400, lineHeight: 1.8 }}>
              This Return &amp; Refund Policy is part of the ZOVA Marketplace Seller Agreement (Version 2.0). In case of any conflict between this page and the full Agreement, the full Agreement prevails. This policy is governed by the laws of the Federal Republic of Nigeria. Last updated: March 2026.
            </p>
            <p style={{ fontSize: 12, color: B.g400, marginTop: 8 }}>
              &copy; 2026 ZOVA Limited. All rights reserved. | Onitsha Main Market, Anambra State, Nigeria
            </p>
          </div>
        </div>
      </div>
    </>
  );
}