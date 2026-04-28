"use client";
import { useState } from "react";
import Link from "next/link";

const B = {
  green:       'var(--color-primary)',
  greenDark:   'var(--color-text)',
  greenMid:    'var(--color-primary-hover)',
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

// ── Order status stages ──────────────────────────────────────
const STATUSES = [
  {
    key: "confirmed",
    icon: "✅",
    label: "Order Confirmed",
    color: B.green,
    bg: B.greenLight,
    border: B.greenBorder,
    desc: "Your payment has been received and is held securely in escrow. The seller has been notified and has 2 hours to confirm stock availability.",
    eta: "Immediately after payment",
    notifications: ["SMS confirmation", "Email receipt", "In-app notification"],
  },
  {
    key: "seller_confirmed",
    icon: "📦",
    label: "Seller Confirmed",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    desc: "The seller has confirmed they have your item in stock and will deliver it to our ZOVA hub. You cannot cancel your order after this point without a restocking fee.",
    eta: "Within 2 hours of order",
    notifications: ["SMS update", "In-app notification"],
  },
  {
    key: "at_hub",
    icon: "🏪",
    label: "At ZOVA Hub",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    desc: "Your item has arrived at our physical quality control hub in Onitsha. Our QC team will inspect it within the hour against the original listing photos.",
    eta: "Within 24 hours of order",
    notifications: ["SMS update"],
  },
  {
    key: "qc_passed",
    icon: "🔬",
    label: "QC Passed",
    color: B.green,
    bg: B.greenLight,
    border: B.greenBorder,
    desc: "Your item has passed our quality inspection! It matches the photos, size, and description. It is now being packaged for delivery. Your seller has been paid.",
    eta: "After QC inspection (usually 1-2 hrs)",
    notifications: ["SMS confirmation", "Email update", "In-app notification"],
  },
  {
    key: "dispatched",
    icon: "🚚",
    label: "Dispatched",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    desc: "Your item is on its way! Our logistics partner has picked it up and your tracking number is now active. You can track in real-time from this page.",
    eta: "Same day as QC pass",
    notifications: ["SMS with tracking number", "Email with tracking link", "In-app tracker activated"],
  },
  {
    key: "delivered",
    icon: "🎉",
    label: "Delivered",
    color: B.green,
    bg: B.greenLight,
    border: B.greenBorder,
    desc: "Your order has been delivered! If there is any issue with your item, you have 7 days to initiate a return from your My Orders page. Enjoy your purchase!",
    eta: "1–3 business days after dispatch",
    notifications: ["SMS delivery confirmation", "Email with return info", "Review request"],
  },
];

const TRACK_METHODS = [
  {
    icon: "📱",
    title: "ZOVA App or Website",
    steps: [
      'Log in to your ZOVA account',
      'Tap "My Orders" from the menu',
      'Select the order you want to track',
      'View live status and tracking timeline',
    ],
    highlight: "Most detailed tracking — see every status update and QC photos",
    color: B.green,
    bg: B.greenLight,
    border: B.greenBorder,
  },
  {
    icon: "💬",
    title: "SMS Tracking",
    steps: [
      'Check your registered phone number',
      'We send automatic SMS at every major milestone',
      'Dispatched SMS includes your tracking number',
      'Reply STOP to opt out of SMS updates',
    ],
    highlight: "No app needed — just check your texts",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    icon: "📧",
    title: "Email Updates",
    steps: [
      'Check the email you registered with',
      'Order confirmation sent immediately',
      'QC pass and dispatch emails sent',
      'Delivery confirmation with return info',
    ],
    highlight: "Full details and receipt in every email",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    icon: "📲",
    title: "WhatsApp Support",
    steps: [
      'Message us on WhatsApp',
      'Send your order number',
      'We reply with live status within minutes',
      'Available Mon–Sat, 8 AM – 8 PM WAT',
    ],
    highlight: "Human support — speak to a real person",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
];

const FAQS = [
  { q: "When do I get my tracking number?",           a: "Your tracking number is sent via SMS and email as soon as your item is dispatched from our hub — usually the same day it passes QC." },
  { q: "My tracking number is not updating. Why?",    a: "Tracking data can take up to 2 hours to update after dispatch. If it has been more than 4 hours with no update, contact us on WhatsApp with your order number." },
  { q: "How long does delivery take?",                a: "Within Anambra State: same day or next day. Across Nigeria: 1–3 business days. Remote areas may take up to 5 business days." },
  { q: "What if my item fails QC?",                   a: "If your item fails our QC inspection, your order is cancelled immediately and you receive a full refund within 24 hours. You will be notified by SMS and email." },
  { q: "Can I change my delivery address after ordering?", a: "You can change your delivery address before your item is dispatched from our hub. Contact us on WhatsApp as soon as possible with your order number." },
  { q: "What if my item is marked delivered but I did not receive it?", a: "Contact us within 24 hours of the marked delivery date. We will investigate with our logistics partner and resolve the issue within 48 hours." },
];

// ── Demo tracker component ───────────────────────────────────
function LiveTrackerDemo() {
  const [activeStatus, setActiveStatus] = useState(3); // QC Passed as default demo

  const status = STATUSES[activeStatus];

  return (
    <div style={{ background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${B.greenDark}, ${B.greenMid})`, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.green, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Order #ZV-2024-08821</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: B.white }}>Classic Linen Shirt — Size B</div>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: 20, background: "rgba(46,100,23,0.25)", border: "1px solid rgba(46,100,23,0.4)", fontSize: 13, fontWeight: 700, color: "#7FFFC4" }}>
          {status.icon} {status.label}
        </div>
      </div>

      {/* Progress timeline */}
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
          {STATUSES.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STATUSES.length - 1 ? 1 : "none" }}>
              <div
                onClick={() => setActiveStatus(i)}
                title={s.label}
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: i <= activeStatus ? B.green : B.g100,
                  border: `2px solid ${i <= activeStatus ? B.green : B.g200}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, cursor: "pointer", transition: "all 0.2s",
                  boxShadow: i === activeStatus ? `0 0 0 4px ${B.greenLight}` : "none",
                  position: "relative", zIndex: 1,
                }}
              >
                {i < activeStatus ? (
                  <span style={{ fontSize: 13, color: B.white }}>✓</span>
                ) : i === activeStatus ? (
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                ) : (
                  <span style={{ fontSize: 11, color: B.g400, fontWeight: 700 }}>{i + 1}</span>
                )}
              </div>
              {i < STATUSES.length - 1 && (
                <div style={{ flex: 1, height: 3, background: i < activeStatus ? B.green : B.g200, transition: "background 0.3s", margin: "0 2px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`, marginBottom: 24 }}>
          {STATUSES.map((s, i) => (
            <div key={i} onClick={() => setActiveStatus(i)} style={{ textAlign: "center", cursor: "pointer", padding: "0 2px" }}>
              <div style={{ fontSize: 10, fontWeight: i === activeStatus ? 700 : 500, color: i <= activeStatus ? B.green : B.g400, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active status detail */}
      <div style={{ padding: "0 28px 28px" }}>
        <div style={{ padding: 20, borderRadius: 14, background: status.bg, border: `1px solid ${status.border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: B.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              {status.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: B.charcoal, marginBottom: 4 }}>{status.label}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: status.color }}>ETA: {status.eta}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: B.g600, lineHeight: 1.75, marginBottom: 14 }}>{status.desc}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {status.notifications.map((n) => (
              <span key={n} style={{ padding: "4px 10px", borderRadius: 6, background: B.white, border: `1px solid ${status.border}`, fontSize: 11, fontWeight: 600, color: status.color }}>
                {n}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: B.greenLight, border: `1px solid ${B.greenBorder}`, fontSize: 12, color: B.greenDark, fontWeight: 500, textAlign: "center" }}>
          👆 Click any step above to see what happens at each stage
        </div>
      </div>
    </div>
  );
}

export default function HowToTrackPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>

      <div style={{ background: B.cream, minHeight: "100vh" }}>

        {/* ── HERO ── */}
        <div style={{ background: `linear-gradient(150deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "68px 24px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "absolute", top: -80, left: -80, width: 360, height: 360, borderRadius: "50%", background: "rgba(46,100,23,0.08)", border: "1px solid rgba(46,100,23,0.12)" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 20, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.35)", marginBottom: 20, fontSize: 11, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1.5, textTransform: "uppercase" }}>
              🚚 Order Tracking
            </div>
            <h1 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 800, color: B.white, lineHeight: 1.15, marginBottom: 16, letterSpacing: -0.5 }}>
              Track Your Order
              <em style={{ color: B.green, fontStyle: "italic", display: "block" }}>Every Step of the Way</em>
            </h1>
            <p style={{ fontSize: 16, color: B.greenSub, lineHeight: 1.8, maxWidth: 500, margin: "0 auto" }}>
              From the moment you pay to the moment it arrives at your door — you are always in the loop. Real-time updates, zero guesswork.
            </p>
          </div>
        </div>

        {/* ── QUICK TRACK BANNER ── */}
        <div style={{ background: B.white, borderBottom: `1px solid ${B.greenBorder}`, padding: "20px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, display: "flex", gap: 0, border: `1px solid ${B.greenBorder}`, borderRadius: 10, overflow: "hidden", minWidth: 260 }}>
              <input
                type="text"
                placeholder="Enter your order number e.g. ZV-2024-08821"
                style={{ flex: 1, padding: "12px 16px", fontSize: 14, border: "none", outline: "none", color: B.charcoal, background: B.white, fontFamily: "var(--zova-font-sans)" }}
              />
              <button style={{ padding: "12px 20px", background: B.green, color: B.white, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--zova-font-sans)" }}>
                Track →
              </button>
            </div>
            <div style={{ fontSize: 13, color: B.g400 }}>or</div>
            <Link href="/login" style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${B.greenBorder}`, background: B.greenLight, color: B.greenDark, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              Log in to My Orders
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "52px 24px 80px" }}>

          {/* ── LIVE TRACKER DEMO ── */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10, textAlign: "center" }}>Interactive Demo</div>
            <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal, marginBottom: 6, textAlign: "center" }}>
              What your tracking looks like
            </h2>
            <p style={{ fontSize: 14, color: B.g600, textAlign: "center", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
              This is a demo of a real ZOVA order tracker. Click each step to see what happens — and what notifications you receive.
            </p>
            <LiveTrackerDemo />
          </div>

          {/* ── HOW TO TRACK ── */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10, textAlign: "center" }}>Tracking Methods</div>
            <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal, marginBottom: 28, textAlign: "center" }}>
              4 ways to track your order
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {TRACK_METHODS.map((m, i) => (
                <div key={i} className="method-card" style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, padding: "28px 28px", cursor: "default" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                      {m.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: B.charcoal }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: m.color, fontWeight: 600, marginTop: 2 }}>{m.highlight}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.steps.map((step, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: m.color, flexShrink: 0, marginTop: 1 }}>
                          {j + 1}
                        </div>
                        <span style={{ fontSize: 13, color: B.g600, lineHeight: 1.6 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── STATUS GLOSSARY ── */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10, textAlign: "center" }}>Status Guide</div>
            <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal, marginBottom: 28, textAlign: "center" }}>
              What each status means
            </h2>
            <div style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {STATUSES.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 20, padding: "20px 28px", borderBottom: i < STATUSES.length - 1 ? `1px solid ${B.greenBorder}` : "none", alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: B.charcoal }}>{s.label}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 20, background: s.bg, fontSize: 11, fontWeight: 600, color: s.color }}>ETA: {s.eta}</span>
                    </div>
                    <p style={{ fontSize: 13, color: B.g600, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DELIVERY TIMES ── */}
          <div style={{ marginBottom: 64, background: `linear-gradient(135deg, ${B.greenDark}, ${B.greenMid})`, borderRadius: 20, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Delivery Times</div>
              <h3 style={{ fontFamily: "var(--zova-font-display)", fontSize: 26, fontWeight: 800, color: B.white, marginBottom: 24 }}>How fast will it arrive?</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { zone: "🏙️ Anambra State",   time: "Same day",       detail: "Order before 2 PM for same-day delivery" },
                  { zone: "🌍 South East & South South", time: "1–2 days", detail: "Port Harcourt, Enugu, Aba, Calabar" },
                  { zone: "🇳🇬 Rest of Nigeria", time: "2–3 days",      detail: "Lagos, Abuja, Kano and all major cities" },
                ].map((z) => (
                  <div key={z.zone} style={{ padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div style={{ fontSize: 15, marginBottom: 8 }}>{z.zone}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: B.green, marginBottom: 4 }}>{z.time}</div>
                    <div style={{ fontSize: 12, color: B.greenSub }}>{z.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10, textAlign: "center" }}>Questions?</div>
            <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal, marginBottom: 24, textAlign: "center" }}>Tracking FAQs</h2>
            <div style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {FAQS.map((f, i) => (
                <div
                  key={i}
                  className="faq-row"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ padding: "20px 28px", borderBottom: i < FAQS.length - 1 ? `1px solid ${B.greenBorder}` : "none" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: B.charcoal, lineHeight: 1.5 }}>{f.q}</div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: openFaq === i ? B.green : B.greenLight, border: `1px solid ${openFaq === i ? B.green : B.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                      <span style={{ fontSize: 14, color: openFaq === i ? B.white : B.green, transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)", display: "block", transition: "transform 0.2s", lineHeight: 1 }}>+</span>
                    </div>
                  </div>
                  {openFaq === i && (
                    <div style={{ marginTop: 12, fontSize: 14, color: B.g600, lineHeight: 1.8, borderLeft: `3px solid ${B.green}`, paddingLeft: 14 }}>{f.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM CTA ── */}
          <div style={{ background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, padding: "40px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${B.green}, ${B.greenMid})` }} />
            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
            <h3 style={{ fontFamily: "var(--zova-font-display)", fontSize: 22, fontWeight: 800, color: B.charcoal, marginBottom: 8 }}>Need help with your order?</h3>
            <p style={{ fontSize: 14, color: B.g600, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
              Our support team responds within 2 hours on WhatsApp. Available Monday to Saturday, 8 AM to 8 PM WAT.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a href="https://wa.me/234XXXXXXXXXX" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: B.green, color: B.white, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(46,100,23,0.35)" }}>
                📲 WhatsApp Support
              </a>
              <Link href="/how-to-order" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: B.greenLight, color: B.greenDark, fontSize: 14, fontWeight: 600, textDecoration: "none", border: `1px solid ${B.greenBorder}` }}>
                How to Order
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}