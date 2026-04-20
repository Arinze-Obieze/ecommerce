"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

const B = {
  green:       "#2E6417",
  greenDark:   "#191B19",
  greenMid:    "#245213",
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
  orange:      "#D97706",
  orangeBg:    "#FFFBEB",
  orangeBorder:"#FDE68A",
};

// ── Order steps data ─────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: "🔍",
    title: "Browse & Discover",
    subtitle: "Find what you love",
    desc: "Explore hundreds of verified clothing items from our sellers. Every listing shows real photos taken at our hub — no stock images, no filters, no surprises.",
    tips: [
      "Use filters to narrow by size, style, and price",
      "Check the size guide tab on each product",
      "All items are pre-verified — everything you see is in stock",
      "Save items to your Wishlist to come back later",
    ],
    visual: { bg: "#F0FBF5", border: "#D4EAE0", accent: "#2E6417" },
  },
  {
    num: "02",
    icon: "📐",
    title: "Check Your Size",
    subtitle: "Our sizing system explained",
    desc: "ZOVA uses a standardized hanger sizing system (Size A, B, C, D) alongside standard S/M/L/XL. Every item comes with exact measurements — chest, length, shoulder, and waist.",
    tips: [
      "Size A = XS/S, Size B = M, Size C = L, Size D = XL/XXL",
      "Always check the measurement table, not just the label",
      "If between sizes, check the product description for fit advice",
      "Still unsure? Message us on WhatsApp before ordering",
    ],
    visual: { bg: "#EFF6FF", border: "#BFDBFE", accent: "#2563EB" },
  },
  {
    num: "03",
    icon: "🛒",
    title: "Add to Cart & Checkout",
    subtitle: "Secure and simple",
    desc: "Add your item to cart, review your order, and proceed to secure checkout. We accept all major payment methods powered by Paystack.",
    tips: [
      "You can add multiple items from different sellers in one order",
      "Confirm your delivery address before paying",
      "Save your address for faster future checkouts",
      "A 1.5% payment processing fee applies (Paystack)",
    ],
    visual: { bg: "#FEF2F2", border: "#FECACA", accent: "#DC2626" },
  },
  {
    num: "04",
    icon: "💳",
    title: "Pay Securely",
    subtitle: "Multiple payment options",
    desc: "Complete your payment through our secure Paystack-powered checkout. Your payment is held in escrow until your item passes our quality check — your money is safe.",
    tips: [
      "Card payments: Visa, Mastercard, Verve",
      "Bank transfer and USSD also supported",
      "Payment is escrowed — not released until QC is passed",
      "You get an instant confirmation SMS and email",
    ],
    visual: { bg: "#FFFBEB", border: "#FDE68A", accent: "#D97706" },
  },
  {
    num: "05",
    icon: "🔬",
    title: "We Verify Your Item",
    subtitle: "Quality control in action",
    desc: "After your order is confirmed, the seller delivers your item to our physical hub. Our QC team inspects it against the original listing photos before anything ships to you.",
    tips: [
      "QC typically takes less than 2 hours after item arrives",
      "If it fails QC, your order is cancelled and refunded in full",
      "We photograph every item during inspection",
      "You get a notification once your item passes QC",
    ],
    visual: { bg: "#F0FBF5", border: "#D4EAE0", accent: "#2E6417" },
  },
  {
    num: "06",
    icon: "🚚",
    title: "Fast Delivery to You",
    subtitle: "Tracked all the way",
    desc: "Once your item passes QC, it is packaged and handed to our logistics partner for delivery. You will receive a tracking number to follow your order every step of the way.",
    tips: [
      "Delivery within Anambra: same day or next day",
      "Delivery across Nigeria: 1–3 business days",
      "Track your order anytime from My Orders",
      "SMS updates at every delivery milestone",
    ],
    visual: { bg: "#F0FBF5", border: "#D4EAE0", accent: "#2E6417" },
  },
];

const FAQS = [
  { q: "Can I order without creating an account?",      a: "No, you need a ZOVA account to place an order. Sign up takes less than 2 minutes and lets you track orders, save addresses, and manage returns easily." },
  { q: "What if my item is out of stock after I pay?",   a: "If a seller fails to confirm stock within 2 hours of your order, the order is automatically cancelled and you receive a full refund — no questions asked." },
  { q: "Can I order multiple items in one checkout?",    a: "Yes. You can add items from multiple sellers and check out together. Each item goes through its own QC process at our hub." },
  { q: "What payment methods do you accept?",           a: "We accept all cards (Visa, Mastercard, Verve), bank transfer, and USSD via Paystack. We do not accept cash or direct bank transfers outside of Paystack." },
  { q: "Can I change my order after placing it?",       a: "You can cancel an order within 30 minutes of placing it if the seller has not yet confirmed stock. After stock is confirmed, the order cannot be changed." },
  { q: "Is my payment safe?",                           a: "Yes. Your payment is held in escrow by Paystack until your item passes our QC inspection. If the item fails QC, your full payment is returned immediately." },
];

export default function HowToOrderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq]       = useState(null);

  const step = STEPS[activeStep];

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-12px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          .step-btn:hover { background: #F0FBF5 !important; }
          .step-btn.active { background: #2E6417 !important; }
          .tip-item { transition: transform 0.15s; }
          .tip-item:hover { transform: translateX(4px); }
          .faq-item { transition: background 0.15s; }
          .faq-item:hover { background: #F7FDF9; }
        `}</style>
      </Head>

      <div style={{ background: B.cream, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

        {/* ── HERO ── */}
        <div style={{ background: `linear-gradient(150deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "68px 24px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "rgba(46,100,23,0.1)", border: "1px solid rgba(46,100,23,0.15)" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 20, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.35)", marginBottom: 20, fontSize: 11, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1.5, textTransform: "uppercase" }}>
              🛒 Shopping Guide
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 800, color: B.white, lineHeight: 1.15, marginBottom: 16, letterSpacing: -0.5 }}>
              How to Order on
              <em style={{ color: B.green, fontStyle: "italic", display: "block" }}>ZOVA</em>
            </h1>
            <p style={{ fontSize: 16, color: B.greenSub, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 28px" }}>
              From browsing to your doorstep in 6 simple steps. Every item quality-checked before it ships to you.
            </p>

            {/* Step count pill */}
            <div style={{ display: "inline-flex", gap: 6 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{ width: i === activeStep ? 28 : 8, height: 8, borderRadius: 4, background: i === activeStep ? B.green : "rgba(255,255,255,0.25)", transition: "all 0.3s ease", cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "52px 24px 80px" }}>

          {/* ── INTERACTIVE STEP EXPLORER ── */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>

              {/* Step nav sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "sticky", top: 24 }}>
                {STEPS.map((s, i) => (
                  <button
                    key={i}
                    className={`step-btn${activeStep === i ? " active" : ""}`}
                    onClick={() => setActiveStep(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 12,
                      border: `1px solid ${activeStep === i ? B.green : B.greenBorder}`,
                      background: activeStep === i ? B.green : B.white,
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: activeStep === i ? "rgba(255,255,255,0.2)" : B.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: activeStep === i ? "rgba(255,255,255,0.7)" : B.green, letterSpacing: 0.8 }}>STEP {s.num}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: activeStep === i ? B.white : B.charcoal, lineHeight: 1.3 }}>{s.title}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Step detail panel */}
              <div key={activeStep} style={{ animation: "slideIn 0.3s ease both" }}>
                <div style={{ background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
                  {/* Panel header */}
                  <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(46,100,23,0.2)" }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(46,100,23,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                          {step.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: B.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Step {step.num} of {STEPS.length}</div>
                          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: B.white, lineHeight: 1.2 }}>{step.title}</h3>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: B.greenSub, lineHeight: 1.75, maxWidth: 520 }}>{step.desc}</p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div style={{ padding: "28px 36px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: B.green, marginBottom: 16 }}>
                      💡 Pro Tips
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {step.tips.map((tip, i) => (
                        <div key={i} className="tip-item" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 10, background: B.greenLight, border: `1px solid ${B.greenBorder}` }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: B.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: B.white, flexShrink: 0, marginTop: 1 }}>✓</div>
                          <span style={{ fontSize: 14, color: B.g800, lineHeight: 1.6 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prev / Next */}
                  <div style={{ padding: "0 36px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                      disabled={activeStep === 0}
                      style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${B.greenBorder}`, background: B.white, color: activeStep === 0 ? B.g400 : B.greenDark, fontWeight: 600, fontSize: 13, cursor: activeStep === 0 ? "not-allowed" : "pointer", opacity: activeStep === 0 ? 0.4 : 1 }}
                    >
                      ← Previous
                    </button>
                    <div style={{ display: "flex", gap: 4 }}>
                      {STEPS.map((_, i) => (
                        <div key={i} onClick={() => setActiveStep(i)} style={{ width: 8, height: 8, borderRadius: "50%", background: i === activeStep ? B.green : B.greenBorder, cursor: "pointer", transition: "background 0.2s" }} />
                      ))}
                    </div>
                    {activeStep < STEPS.length - 1 ? (
                      <button
                        onClick={() => setActiveStep(activeStep + 1)}
                        style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: B.green, color: B.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                      >
                        Next Step →
                      </button>
                    ) : (
                      <Link href="/shop" style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: B.green, color: B.white, fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-block" }}>
                        Start Shopping →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── QUICK OVERVIEW STRIP ── */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10, textAlign: "center" }}>At a Glance</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal, marginBottom: 28, textAlign: "center" }}>Your order, step by step</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0, background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{ padding: "24px 16px", textAlign: "center", borderRight: i < 5 ? `1px solid ${B.greenBorder}` : "none", cursor: "pointer", transition: "background 0.15s", background: activeStep === i ? B.greenLight : "transparent", position: "relative" }}
                >
                  {activeStep === i && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: B.green }} />}
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: B.green, letterSpacing: 0.8, marginBottom: 4 }}>{s.num}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: B.charcoal, lineHeight: 1.4 }}>{s.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PAYMENT METHODS ── */}
          <div style={{ marginBottom: 64, background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, padding: "36px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Payments</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: B.charcoal, marginBottom: 12 }}>Safe, fast, and flexible</h3>
                <p style={{ fontSize: 14, color: B.g600, lineHeight: 1.75, marginBottom: 20 }}>
                  All payments are processed securely through Paystack and held in escrow until your item clears our QC hub. Your money is always protected.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, background: B.greenLight, border: `1px solid ${B.greenBorder}`, display: "inline-flex" }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: B.greenDark }}>SSL secured via Paystack</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "💳", method: "Debit Card",     detail: "Visa, Mastercard, Verve" },
                  { icon: "🏦", method: "Bank Transfer",  detail: "Direct from any Nigerian bank" },
                  { icon: "📱", method: "USSD",           detail: "*737#, *737# and more" },
                  { icon: "📲", method: "Mobile Money",   detail: "Available via Paystack" },
                ].map((p) => (
                  <div key={p.method} style={{ padding: "16px", borderRadius: 12, background: B.g50, border: `1px solid ${B.g200}` }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.charcoal, marginBottom: 2 }}>{p.method}</div>
                    <div style={{ fontSize: 11, color: B.g400 }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10, textAlign: "center" }}>Questions?</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal, marginBottom: 24, textAlign: "center" }}>Ordering FAQs</h2>
            <div style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {FAQS.map((f, i) => (
                <div
                  key={i}
                  className="faq-item"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ padding: "20px 28px", borderBottom: i < FAQS.length - 1 ? `1px solid ${B.greenBorder}` : "none", cursor: "pointer", borderRadius: 0 }}
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
          <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, borderRadius: 20, padding: "44px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: B.white, marginBottom: 10 }}>Ready to shop with confidence?</h3>
              <p style={{ fontSize: 14, color: B.greenSub, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>Every item verified. Every order tracked. Every delivery guaranteed to match what you saw.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: B.green, color: B.white, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(46,100,23,0.4)" }}>
                  Browse All Items →
                </Link>
                <Link href="/how-to-track" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: B.white, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                  How to Track My Order
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}