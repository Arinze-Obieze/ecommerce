"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

// ─── Brand tokens ────────────────────────────────────────────
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
  blue:        "#2563EB",
  blueBg:      "#EFF6FF",
  blueBorder:  "#BFDBFE",
  orange:      "#D97706",
  orangeBg:    "#FFFBEB",
  orangeBorder:"#FDE68A",
  purple:      "#7C3AED",
  purpleBg:    "#F5F3FF",
  purpleBorder:"#DDD6FE",
};

// ─── Data ────────────────────────────────────────────────────
const DELIVERY_ZONES = [
  {
    id: "anambra",
    icon: "🏙️",
    zone: "Onitsha & Anambra State",
    time: "Same Day",
    timeDetail: "Order before 2 PM",
    fee: "₦800",
    feeDetail: "Flat rate within Anambra",
    color: B.green,
    bg: B.greenLight,
    border: B.greenBorder,
    cities: ["Onitsha", "Awka", "Nnewi", "Asaba", "Agbor", "Ihiala", "Ekwulobia", "Okpoko"],
  },
  {
    id: "southeast",
    icon: "🌿",
    zone: "South East & South South",
    time: "1–2 Days",
    timeDetail: "Mon–Sat delivery",
    fee: "₦1,200",
    feeDetail: "Standard rate",
    color: B.blue,
    bg: B.blueBg,
    border: B.blueBorder,
    cities: ["Enugu", "Port Harcourt", "Aba", "Umuahia", "Owerri", "Calabar", "Uyo", "Abakaliki"],
  },
  {
    id: "southwest",
    icon: "🌆",
    zone: "Lagos & South West",
    time: "2–3 Days",
    timeDetail: "Mon–Sat delivery",
    fee: "₦1,500",
    feeDetail: "Standard rate",
    color: B.orange,
    bg: B.orangeBg,
    border: B.orangeBorder,
    cities: ["Lagos Island", "Lagos Mainland", "Ikeja", "Ibadan", "Abeokuta", "Akure", "Benin City", "Warri"],
  },
  {
    id: "northsouth",
    icon: "🏛️",
    zone: "Abuja & North Central",
    time: "2–3 Days",
    timeDetail: "Mon–Fri delivery",
    fee: "₦1,500",
    feeDetail: "Standard rate",
    color: B.purple,
    bg: B.purpleBg,
    border: B.purpleBorder,
    cities: ["Abuja (FCT)", "Minna", "Lokoja", "Lafia", "Makurdi", "Jos", "Kogi", "Nasarawa"],
  },
  {
    id: "north",
    icon: "🌍",
    zone: "Northern Nigeria",
    time: "3–5 Days",
    timeDetail: "Mon–Fri delivery",
    fee: "₦2,000",
    feeDetail: "Extended zone rate",
    color: B.g600,
    bg: B.g50,
    border: B.g200,
    cities: ["Kano", "Kaduna", "Katsina", "Sokoto", "Zaria", "Maiduguri", "Yola", "Gombe"],
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    icon: "💳",
    title: "You Pay",
    desc: "Your payment is held securely in escrow via Paystack. No money moves until your item passes QC.",
    time: "Instant",
    color: B.blue,
    bg: B.blueBg,
  },
  {
    num: "02",
    icon: "🏪",
    title: "Seller Confirms",
    desc: "The seller confirms stock within 2 hours and delivers your item to our ZOVA hub in Onitsha.",
    time: "Within 2 hrs",
    color: B.orange,
    bg: B.orangeBg,
  },
  {
    num: "03",
    icon: "🔬",
    title: "QC Inspection",
    desc: "Our team inspects the item against the listing photos. It must pass before anything ships.",
    time: "Within 2 hrs at hub",
    color: B.purple,
    bg: B.purpleBg,
  },
  {
    num: "04",
    icon: "📦",
    title: "Packaged & Dispatched",
    desc: "QC-passed items are carefully packaged with ZOVA branding and handed to our logistics partner.",
    time: "Same day as QC pass",
    color: B.green,
    bg: B.greenLight,
  },
  {
    num: "05",
    icon: "🚚",
    title: "Out for Delivery",
    desc: "Your item is in transit. You receive a tracking number via SMS and can follow it in real time.",
    time: "Varies by zone",
    color: B.green,
    bg: B.greenLight,
  },
  {
    num: "06",
    icon: "🎉",
    title: "Delivered to You",
    desc: "Item arrives at your door. If anything is wrong, you have 7 days to initiate a return.",
    time: "See zone table",
    color: B.green,
    bg: B.greenLight,
  },
];

const FAQS = [
  {
    q: "Do you ship outside Nigeria?",
    a: "Not yet. ZOVA currently delivers within Nigeria only. We are working on expanding to other West African countries — sign up for our newsletter to be the first to know.",
  },
  {
    q: "What happens if no one is home at delivery?",
    a: "Our logistics partner will attempt delivery up to 2 times. After 2 failed attempts, the item is held at a nearby pickup point for 48 hours before being returned to our hub. Contact us on WhatsApp immediately if you need to reschedule.",
  },
  {
    q: "Can I change my delivery address after ordering?",
    a: "Yes, but only before the item has been dispatched from our hub. Contact us on WhatsApp as soon as possible with your order number. Once dispatched, the address cannot be changed.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "Take a photo immediately and contact us within 24 hours of delivery. If the damage occurred during shipping, ZOVA covers the full cost — you will receive a replacement or full refund within 48 hours.",
  },
  {
    q: "Is same-day delivery guaranteed?",
    a: "Same-day delivery within Anambra State applies to orders placed before 2 PM on business days (Monday to Saturday). Orders placed after 2 PM are dispatched the following business day.",
  },
  {
    q: "Do you deliver on Sundays?",
    a: "Currently, our logistics partners operate Monday to Saturday. Sunday delivery is not available. Orders placed on Saturday after 2 PM will be dispatched on Monday.",
  },
  {
    q: "Can I pick up my order from your hub?",
    a: "Yes! You can select hub pickup at checkout if you are in or near Onitsha. Your order will be ready for collection the same day it passes QC. Bring your order confirmation SMS.",
  },
  {
    q: "What if my tracking number shows no updates?",
    a: "Tracking data can take up to 2 hours to update after dispatch. If there is no update after 4 hours, contact us on WhatsApp with your order number and we will investigate immediately.",
  },
];

const PACKAGING_FEATURES = [
  { icon: "👕", title: "Folded & pressed", desc: "Every item is neatly folded and presented — ready to wear or gift." },
  { icon: "🛡️", title: "Protective wrapping", desc: "Items are wrapped to prevent creasing or damage in transit." },
  { icon: "🏷️", title: "ZOVA branded bag", desc: "Delivered in our signature green ZOVA packaging." },
  { icon: "📄", title: "Order slip included", desc: "A packing slip with your order details is included for easy returns." },
];

// ─── Subcomponents ────────────────────────────────────────────
function ZoneCard({ zone, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: B.white,
        borderRadius: 14,
        border: `2px solid ${isActive ? zone.color : B.greenBorder}`,
        padding: "20px 20px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: isActive ? `0 6px 24px ${zone.color}20` : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: zone.bg, border: `1px solid ${zone.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            {zone.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: B.charcoal, lineHeight: 1.3 }}>{zone.zone}</div>
            <div style={{ fontSize: 11, color: zone.color, fontWeight: 600, marginTop: 2 }}>{zone.timeDetail}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: zone.color, lineHeight: 1 }}>{zone.time}</div>
          <div style={{ fontSize: 11, color: B.g400, marginTop: 2 }}>delivery</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${zone.border}` }}>
        <span style={{ fontSize: 12, color: B.g600 }}>{zone.feeDetail}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: zone.color }}>{zone.fee}</span>
      </div>

      {/* Expanded cities */}
      {isActive && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${zone.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: zone.color, marginBottom: 10 }}>
            Cities covered:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {zone.cities.map((city) => (
              <span key={city} style={{ padding: "4px 10px", borderRadius: 6, background: zone.bg, border: `1px solid ${zone.border}`, fontSize: 12, fontWeight: 500, color: B.g800 }}>
                {city}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: B.g400, fontStyle: "italic" }}>
            + all other towns and LGAs within this zone
          </div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{ padding: "20px 28px", borderBottom: `1px solid ${B.greenBorder}`, cursor: "pointer", transition: "background 0.15s" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: B.charcoal, lineHeight: 1.5 }}>{q}</div>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background: isOpen ? B.green : B.greenLight,
          border: `1px solid ${isOpen ? B.green : B.greenBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 15, color: isOpen ? B.white : B.green, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", display: "block", transition: "transform 0.2s", lineHeight: 1 }}>+</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ marginTop: 12, fontSize: 14, color: B.g600, lineHeight: 1.85, borderLeft: `3px solid ${B.green}`, paddingLeft: 14 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function ShippingInfoPage() {
  const [activeZone, setActiveZone] = useState("anambra");
  const [openFaq, setOpenFaq]       = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(46,100,23,0.4); }
            50%       { box-shadow: 0 0 0 8px rgba(46,100,23,0); }
          }
          .fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
          .fade-up-1 { animation-delay: 0.1s; }
          .fade-up-2 { animation-delay: 0.2s; }
          .fade-up-3 { animation-delay: 0.3s; }
          .step-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(46,100,23,0.12) !important; }
          .pkg-card:hover { transform: translateY(-3px); }
          .zone-pulse { animation: pulse 2s infinite; }
          .faq-row:hover { background: #F7FDF9; }
        `}</style>
      </Head>

      <div style={{ background: B.cream, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

        {/* ══ HERO ══════════════════════════════════════════════ */}
        <div style={{ background: `linear-gradient(150deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: "72px 24px 64px", position: "relative", overflow: "hidden" }}>
          {/* Background texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.13) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(46,100,23,0.1)", border: "1px solid rgba(46,100,23,0.15)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(46,100,23,0.07)" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
            <div className="fade-up fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 20, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.35)", marginBottom: 20, fontSize: 11, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1.5, textTransform: "uppercase" }}>
              🚚 Shipping & Delivery
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: B.white, lineHeight: 1.15, marginBottom: 16, letterSpacing: -0.5 }}>
              Fast. Tracked.{" "}
              <em style={{ color: B.green, fontStyle: "italic" }}>Guaranteed.</em>
            </h1>

            <p className="fade-up fade-up-3" style={{ fontSize: 16, color: B.greenSub, lineHeight: 1.8, maxWidth: 520, marginBottom: 40 }}>
              Every ZOVA order is quality-checked at our Onitsha hub before it ships. What you ordered is exactly what arrives — or we fix it for free.
            </p>

            {/* Key delivery stats */}
            <div className="fade-up fade-up-3" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 720 }}>
              {[
                { val: "Same Day",  label: "Within Anambra",     icon: "⚡" },
                { val: "1–2 Days", label: "South East / SS",     icon: "🌿" },
                { val: "2–3 Days", label: "Lagos & Abuja",       icon: "🌆" },
                { val: "Free",     label: "Returns on QC fails", icon: "🛡️" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: "18px 12px", background: "rgba(255,255,255,0.07)", borderRadius: 14, border: "1px solid rgba(46,100,23,0.2)" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: B.green, lineHeight: 1, letterSpacing: -0.5 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: B.greenSub, marginTop: 5, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TRUST STRIP ── */}
        <div style={{ background: B.white, borderBottom: `1px solid ${B.greenBorder}`, padding: "14px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              "QC-verified before every shipment",
              "Real-time SMS & app tracking",
              "Free returns on our mistakes",
            ].map((t) => (
              <span key={t} style={{ fontSize: 13, fontWeight: 600, color: B.greenMid, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: B.green, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: B.white, flexShrink: 0 }}>✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 80px" }}>

          {/* ══ DELIVERY ZONES ══════════════════════════════════ */}
          <div style={{ marginBottom: 68 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Delivery Zones</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal, marginBottom: 10 }}>
                How fast will it reach you?
              </h2>
              <p style={{ fontSize: 15, color: B.g600, maxWidth: 480, margin: "0 auto" }}>
                Tap any zone to see the cities covered and exact delivery fee.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DELIVERY_ZONES.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  isActive={activeZone === zone.id}
                  onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                />
              ))}
            </div>

            {/* Hub pickup callout */}
            <div style={{ marginTop: 16, padding: "18px 22px", borderRadius: 14, background: `linear-gradient(135deg, ${B.greenDark}, ${B.greenMid})`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(46,100,23,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📍</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: B.white, marginBottom: 3 }}>Free Hub Pickup — Onitsha</div>
                <div style={{ fontSize: 13, color: B.greenSub }}>Skip the delivery fee entirely. Select Hub Pickup at checkout and collect your order from our Onitsha hub on the same day it passes QC. Bring your order confirmation SMS.</div>
              </div>
              <div style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(46,100,23,0.25)", border: "1px solid rgba(46,100,23,0.4)", fontSize: 13, fontWeight: 700, color: "#7FFFC4", whiteSpace: "nowrap" }}>
                ₦0 — Free
              </div>
            </div>
          </div>

          {/* ══ HOW YOUR ORDER SHIPS ════════════════════════════ */}
          <div style={{ marginBottom: 68 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>The Journey</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal, marginBottom: 10 }}>
                From seller to your door
              </h2>
              <p style={{ fontSize: 15, color: B.g600, maxWidth: 480, margin: "0 auto" }}>
                Every order goes through the same 6-step process — no shortcuts, no surprises.
              </p>
            </div>

            <div style={{ position: "relative" }}>
              {/* Connecting line */}
              <div style={{ position: "absolute", left: 27, top: 28, bottom: 28, width: 2, background: `linear-gradient(to bottom, ${B.green}, ${B.greenBorder})` }} />

              <div style={{ display: "flex", flexDirection: "column" }}>
                {PROCESS_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="step-card"
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    style={{
                      display: "flex", gap: 20, padding: "16px 0",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {/* Circle */}
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                      background: activeStep === i ? step.color : B.white,
                      border: `2px solid ${activeStep === i ? step.color : B.greenBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, zIndex: 1, transition: "all 0.25s ease",
                      boxShadow: activeStep === i ? `0 4px 16px ${step.color}35` : "none",
                    }}>
                      {step.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, background: activeStep === i ? B.white : "transparent", borderRadius: 14, padding: activeStep === i ? "16px 20px" : "10px 0 10px", border: activeStep === i ? `1px solid ${B.greenBorder}` : "none", transition: "all 0.25s ease", boxShadow: activeStep === i ? "0 4px 18px rgba(0,0,0,0.05)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: step.color, letterSpacing: 0.8 }}>STEP {step.num}</span>
                          <span style={{ fontSize: 16, fontWeight: 700, color: B.charcoal }}>{step.title}</span>
                        </div>
                        <span style={{ padding: "4px 12px", borderRadius: 20, background: step.bg, fontSize: 11, fontWeight: 700, color: step.color }}>{step.time}</span>
                      </div>
                      {activeStep === i && (
                        <p style={{ fontSize: 14, color: B.g600, lineHeight: 1.75, marginTop: 10, marginBottom: 0 }}>{step.desc}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 8, padding: "12px 18px", borderRadius: 10, background: B.greenLight, border: `1px solid ${B.greenBorder}`, fontSize: 13, color: B.greenDark, fontWeight: 500, textAlign: "center" }}>
              👆 Tap any step to see what happens at that stage
            </div>
          </div>

          {/* ══ PACKAGING ═══════════════════════════════════════ */}
          <div style={{ marginBottom: 68 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Packaging</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal, marginBottom: 10 }}>
                Packaged with care
              </h2>
              <p style={{ fontSize: 15, color: B.g600, maxWidth: 440, margin: "0 auto" }}>
                Every item leaves our hub looking like a gift — even if it is just for you.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {PACKAGING_FEATURES.map((f, i) => (
                <div key={i} className="pkg-card" style={{ background: B.white, borderRadius: 16, border: `1px solid ${B.greenBorder}`, padding: "24px 24px", display: "flex", gap: 16, alignItems: "flex-start", transition: "all 0.2s ease", cursor: "default" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: B.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: B.charcoal, marginBottom: 5 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: B.g600, lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ FEES TABLE ══════════════════════════════════════ */}
          <div style={{ marginBottom: 68 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Delivery Fees</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal }}>
                Clear, flat-rate pricing
              </h2>
            </div>

            <div style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 0, background: B.greenDark, padding: "14px 24px" }}>
                {["Delivery Zone", "Delivery Time", "Fee", "Hub Pickup"].map((h) => (
                  <div key={h} style={{ fontSize: 12, fontWeight: 700, color: B.greenSub, textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {DELIVERY_ZONES.map((zone, i) => (
                <div key={zone.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 0, padding: "16px 24px", borderBottom: i < DELIVERY_ZONES.length - 1 ? `1px solid ${B.greenBorder}` : "none", background: i % 2 === 0 ? B.white : B.g50 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{zone.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: B.charcoal }}>{zone.zone}</span>
                  </div>
                  <div>
                    <span style={{ padding: "4px 10px", borderRadius: 20, background: zone.bg, fontSize: 12, fontWeight: 700, color: zone.color }}>{zone.time}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: zone.color }}>{zone.fee}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: B.green }}>Free ✓</div>
                </div>
              ))}

              {/* Hub pickup row */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 0, padding: "16px 24px", background: B.greenLight, borderTop: `2px solid ${B.greenBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: B.greenDark }}>Hub Pickup (Onitsha)</span>
                </div>
                <div>
                  <span style={{ padding: "4px 10px", borderRadius: 20, background: B.green, fontSize: 12, fontWeight: 700, color: B.white }}>Same Day</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: B.green }}>₦0 — Free</div>
                <div style={{ fontSize: 13, color: B.g600 }}>Collect at hub</div>
              </div>
            </div>
          </div>

          {/* ══ IMPORTANT NOTES ═════════════════════════════════ */}
          <div style={{ marginBottom: 68 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: B.charcoal, marginBottom: 20 }}>
              Important shipping notes
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { icon: "⏰", title: "2 PM cutoff for same-day", desc: "Orders confirmed and QC-passed before 2 PM on business days are dispatched same day within Anambra.", color: B.green },
                { icon: "📅", title: "Business days only", desc: "Delivery operates Monday to Saturday. Orders placed on Saturday after 2 PM are dispatched the following Monday.", color: B.blue },
                { icon: "📍", title: "Accurate address required", desc: "Always include your full address including LGA, street name, and a landmark if possible. Wrong addresses cause delays.", color: B.orange },
                { icon: "📞", title: "Keep your phone on", desc: "Our dispatch riders may call before delivery. If unreachable after 2 attempts, the order is held at a pickup point.", color: B.purple },
                { icon: "🎁", title: "Gift delivery available", desc: "We can ship to a different address for gifts. Add the recipient name and address at checkout. No prices on packing slip.", color: B.green },
                { icon: "🏢", title: "Office deliveries welcome", desc: "Shipping to an office? Include your company name and floor number in the address for faster delivery.", color: B.blue },
              ].map((note, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "18px 20px", borderRadius: 14, background: B.white, border: `1px solid ${B.greenBorder}`, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: B.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {note.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.charcoal, marginBottom: 4 }}>{note.title}</div>
                    <div style={{ fontSize: 13, color: B.g600, lineHeight: 1.65 }}>{note.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ FAQ ═════════════════════════════════════════════ */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Got Questions?</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: B.charcoal }}>
                Shipping FAQs
              </h2>
            </div>
            <div style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {FAQS.map((f, i) => (
                <FAQItem
                  key={i}
                  q={f.q}
                  a={f.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </div>

          {/* ══ BOTTOM CTA ═══════════════════════════════════════ */}
          <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, borderRadius: 22, padding: "52px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 240, height: 240, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(46,100,23,0.1)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 14 }}>Ready?</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: B.white, marginBottom: 12, lineHeight: 1.25 }}>
                Shop now. We handle the rest.
              </h3>
              <p style={{ fontSize: 15, color: B.greenSub, lineHeight: 1.75, maxWidth: 420, margin: "0 auto 28px" }}>
                Every item quality-checked at our hub. Delivered fast. Tracked all the way. And if something is wrong, we fix it — free.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: B.green, color: B.white, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(46,100,23,0.4)" }}>
                  Browse All Items →
                </Link>
                <Link href="/how-to-track" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: B.white, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                  Track My Order
                </Link>
                <a href="https://wa.me/234XXXXXXXXXX" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: B.white, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                  📲 WhatsApp Support
                </a>
              </div>
              {/* Trust footnote */}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
                {["Free returns on QC failures", "Nationwide delivery", "24hr order processing"].map((t) => (
                  <span key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: B.green }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}