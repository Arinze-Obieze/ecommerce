"use client";
import { useState, useEffect, useRef } from "react";

// ─── Brand tokens ────────────────────────────────────────────
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
  g200:        "#E5E7EB",
  g400:        "#9CA3AF",
  g600:        "#4B5563",
  g800:        "#1F2937",
};

// ─── Data ────────────────────────────────────────────────────
const STATS = [
  { val: "10,000+", label: "Items Verified" },
  { val: "500+",    label: "Active Sellers"  },
  { val: "98%",     label: "Quality Pass Rate" },
  { val: "24hrs",   label: "Avg. Delivery"   },
];

const VALUES = [
  {
    icon: "🔍",
    title: "Verified Quality",
    desc: "Every single item on ZOVA passes through our physical hub and QC team before it ever reaches a customer. No guesswork. No surprises.",
  },
  {
    icon: "🤝",
    title: "Fair to All Sides",
    desc: "We built a system that protects buyers without punishing honest sellers. Accountability goes where it belongs — always.",
  },
  {
    icon: "⚡",
    title: "Built for Speed",
    desc: "Same-day seller payout after QC. 24-hour delivery target. 2-hour stock confirmation. We move fast because fashion waits for no one.",
  },
  {
    icon: "🛡️",
    title: "Zero Surprises",
    desc: "What you see is what arrives. Our promise to every customer is simple: the item in the photo is the item in the box.",
  },
];

const TIMELINE = [
  {
    year: "The Problem",
    title: "Online fashion was broken",
    desc: "Nigerian buyers were getting wrong sizes, fake items, and blurry phone photos passed off as product listings. Trust was at an all-time low.",
  },
  {
    year: "The Idea",
    title: "A marketplace with a hub",
    desc: "What if every item had to pass through a real physical inspection before shipping? What if sellers were held accountable with real data?",
  },
  {
    year: "The Build",
    title: "ZOVA is born in Onitsha",
    desc: "We started in the heart of Nigeria's largest market — Onitsha Main Market, Anambra State — where fashion moves at full speed every day.",
  },
  {
    year: "Today",
    title: "Verified Quality. Zero Surprises.",
    desc: "Hundreds of verified sellers. Thousands of quality-checked items. And a community of buyers who shop with confidence every time.",
  },
];

const TEAM = [
  { initials: "AO", name: "Arinze O.", role: "Founder & CEO", color: 'var(--color-primary)' },
  { initials: "CN", name: "Chioma N.", role: "Head of Quality Control", color: 'var(--color-primary-hover)' },
  { initials: "EK", name: "Emeka K.", role: "Head of Seller Relations", color: 'var(--color-text)' },
  { initials: "AD", name: "Adaeze D.", role: "Head of Logistics", color: "#059669" },
];

// ─── Hook: count-up animation ────────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * numeric));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Animated stat ───────────────────────────────────────────
function StatCard({ val, label, animate }) {
  const numeric = parseFloat(val.replace(/[^0-9.]/g, ""));
  const suffix = val.replace(/[0-9.,]/g, "");
  const count = useCountUp(val, 1600, animate);
  const display = isNaN(numeric) ? val : `${count.toLocaleString()}${suffix}`;

  return (
    <div style={{ textAlign: "center", padding: "28px 20px", background: "rgba(255,255,255,0.07)", borderRadius: 16, border: "1px solid rgba(46,100,23,0.2)" }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: B.green, lineHeight: 1, letterSpacing: -1 }}>{display}</div>
      <div style={{ fontSize: 12, color: B.greenSub, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 8, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Intersection observer hook ──────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Page ────────────────────────────────────────────────────
export default function AboutPage() {
  const [statsRef, statsInView] = useInView(0.3);

  return (
    <>

      <div style={{ background: B.cream, minHeight: "100vh" }}>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <div style={{ background: `linear-gradient(160deg, ${B.greenDark} 0%, ${B.greenMid} 60%, #1a9e5e 100%)`, padding: "80px 24px 72px", position: "relative", overflow: "hidden" }}>

          {/* Background texture dots */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.6 }} />

          {/* Large decorative circle */}
          <div style={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "rgba(46,100,23,0.1)", border: "1px solid rgba(46,100,23,0.15)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(46,100,23,0.07)" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>

            {/* Label */}
            <div className="fade-up fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 20, background: "rgba(46,100,23,0.2)", border: "1px solid rgba(46,100,23,0.35)", marginBottom: 24, fontSize: 11, fontWeight: 700, color: "#7FFFC4", letterSpacing: 1.5, textTransform: "uppercase" }}>
              🇳🇬 Made in Onitsha, Built for Nigeria
            </div>

            {/* Headline */}
            <h1 className="fade-up fade-up-2" style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 800, color: B.white, lineHeight: 1.1, marginBottom: 20, letterSpacing: -0.5 }}>
              We Fixed Online Fashion
              <br />
              <em style={{ color: B.green, fontStyle: "italic" }}>One Item at a Time.</em>
            </h1>

            <p className="fade-up fade-up-3" style={{ fontSize: 17, color: B.greenSub, lineHeight: 1.8, maxWidth: 540, margin: "0 auto 36px" }}>
              ZOVA is Nigeria&apos;s first quality-verified fashion marketplace. Every item passes through our physical hub before it reaches you. No fakes. No wrong sizes. No excuses.
            </p>

            {/* CTA strip */}
            <div className="fade-up fade-up-4" style={{ display: "inline-flex", gap: 8, padding: "10px 20px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              <span style={{ color: B.green, fontWeight: 700 }}>www.zova.ng</span>
              <span>·</span>
              <span>Onitsha Main Market, Anambra</span>
              <span>·</span>
              <span>Est. 2024</span>
            </div>
          </div>
        </div>

        {/* ══ STATS ══════════════════════════════════════════ */}
        <div ref={statsRef} style={{ background: B.greenDark, padding: "48px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STATS.map((s) => (
              <StatCard key={s.label} val={s.val} label={s.label} animate={statsInView} />
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 80px" }}>

          {/* ══ MISSION STATEMENT ══════════════════════════ */}
          <div style={{ marginBottom: 72, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 12 }}>Our Mission</div>
              <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, color: B.charcoal, lineHeight: 1.2, marginBottom: 20 }}>
                Trust should be the <em style={{ color: B.green }}>default</em>, not the exception.
              </h2>
              <p style={{ fontSize: 15, color: B.g600, lineHeight: 1.85, marginBottom: 16 }}>
                We started ZOVA because buying clothes online in Nigeria felt like gambling. You&apos;d pay, wait, and hope — and too often, what arrived didn&apos;t match what was promised.
              </p>
              <p style={{ fontSize: 15, color: B.g600, lineHeight: 1.85 }}>
                We built a different kind of marketplace — one with a real physical hub, real quality checks, and real accountability. For buyers and sellers alike.
              </p>
            </div>

            {/* Visual card */}
            <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, borderRadius: 24, padding: 36, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(46,100,23,0.2)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏪</div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: B.green, marginBottom: 8 }}>Based at</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: B.white, lineHeight: 1.3, marginBottom: 12 }}>Onitsha Main Market</div>
                <div style={{ fontSize: 14, color: B.greenSub, lineHeight: 1.7 }}>Anambra State, Nigeria — the commercial heartbeat of West Africa.</div>
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Physical QC Hub", "Same-day processing", "Nationwide delivery"].map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: B.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: B.white, flexShrink: 0 }}>✓</div>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ HOW WE WORK ════════════════════════════════ */}
          <div style={{ marginBottom: 72 }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>How It Works</div>
              <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(26px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal, lineHeight: 1.2 }}>
                Not just a website. A full system.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, overflow: "hidden" }}>
              {[
                { num: "01", icon: "📋", title: "Sellers List", desc: "Verified sellers upload items with real photos taken on our standardized hanger system." },
                { num: "02", icon: "🔍", title: "We Inspect", desc: "Every item arrives at our hub and goes through a detailed QC checklist before anything ships." },
                { num: "03", icon: "📦", title: "We Ship", desc: "QC-passed items are packaged and dispatched to customers — same day as verification." },
                { num: "04", icon: "💚", title: "You Trust", desc: "Buyers receive exactly what was shown. If not, we fix it. Every time. No excuses." },
              ].map((step, i) => (
                <div key={i} style={{ padding: "32px 24px", borderRight: i < 3 ? `1px solid ${B.greenBorder}` : "none", position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: B.green, letterSpacing: 1, marginBottom: 12, opacity: 0.7 }}>{step.num}</div>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{step.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: B.charcoal, marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: B.g600, lineHeight: 1.7 }}>{step.desc}</div>
                  {/* bottom accent */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: i === 0 ? B.green : "transparent", transformOrigin: "left" }} />
                </div>
              ))}
            </div>
          </div>

          {/* ══ VALUES ═════════════════════════════════════ */}
          <div style={{ marginBottom: 72 }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>What We Stand For</div>
              <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(26px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal }}>Our core values</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {VALUES.map((v, i) => (
                <div key={i} className="value-card" style={{ background: B.white, borderRadius: 16, border: `1px solid ${B.greenBorder}`, padding: "28px 28px", transition: "all 0.25s ease", cursor: "default" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: B.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                    {v.icon}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: B.charcoal, marginBottom: 8 }}>{v.title}</div>
                  <div style={{ fontSize: 14, color: B.g600, lineHeight: 1.75 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ TIMELINE / STORY ═══════════════════════════ */}
          <div style={{ marginBottom: 72 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>Our Story</div>
              <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(26px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal }}>How ZOVA came to be</h2>
            </div>
            <div style={{ position: "relative" }}>
              {/* vertical line */}
              <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 2, background: `linear-gradient(to bottom, ${B.green}, ${B.greenBorder})` }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {TIMELINE.map((t, i) => (
                  <div key={i} className="timeline-item" style={{ display: "flex", gap: 28, padding: "20px 0" }}>
                    <div style={{ flexShrink: 0, paddingTop: 2 }}>
                      <div className="timeline-dot" style={{ width: 40, height: 40, borderRadius: "50%", background: i === TIMELINE.length - 1 ? B.green : B.white, border: `2px solid ${i === TIMELINE.length - 1 ? B.green : B.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === TIMELINE.length - 1 ? B.white : B.green, zIndex: 1, position: "relative", boxShadow: i === TIMELINE.length - 1 ? `0 0 0 4px ${B.greenLight}` : "none" }}>
                        {i + 1}
                      </div>
                    </div>
                    <div style={{ paddingTop: 6, paddingBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: B.green, marginBottom: 4 }}>{t.year}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: B.charcoal, marginBottom: 6 }}>{t.title}</div>
                      <div style={{ fontSize: 14, color: B.g600, lineHeight: 1.75, maxWidth: 600 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ TEAM ═══════════════════════════════════════ */}
          <div style={{ marginBottom: 72 }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 10 }}>The Team</div>
              <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(26px, 3.5vw, 34px)", fontWeight: 800, color: B.charcoal, marginBottom: 12 }}>The people behind ZOVA</h2>
              <p style={{ fontSize: 15, color: B.g600, maxWidth: 480, margin: "0 auto" }}>A small, focused team with big standards — based in the heart of Nigerian commerce.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {TEAM.map((m, i) => (
                <div key={i} className="team-card" style={{ background: B.white, borderRadius: 18, border: `1px solid ${B.greenBorder}`, padding: "28px 20px", textAlign: "center", cursor: "default" }}>
                  <div className="team-avatar" style={{ width: 72, height: 72, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: B.white, margin: "0 auto 16px", transition: "transform 0.2s ease", boxShadow: `0 6px 20px ${m.color}40` }}>
                    {m.initials}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: B.charcoal, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: B.green, fontWeight: 600 }}>{m.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SELLER CTA ═════════════════════════════════ */}
          <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, borderRadius: 24, padding: "52px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(46,100,23,0.1)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: B.green, marginBottom: 14 }}>Join ZOVA</div>
              <h2 style={{ fontFamily: "var(--zova-font-display)", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: B.white, marginBottom: 14, lineHeight: 1.2 }}>
                Ready to sell to thousands<br />of verified buyers?
              </h2>
              <p style={{ fontSize: 15, color: B.greenSub, lineHeight: 1.75, maxWidth: 440, margin: "0 auto 32px" }}>
                Join our growing network of verified sellers. List your items, pass QC, and get paid — same day. No hidden fees, no surprises.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/seller" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: B.green, color: B.white, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 6px 20px rgba(46,100,23,0.4)` }}>
                  Become a Seller →
                </a>
                <a href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: B.white, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                  Shop Now
                </a>
              </div>

              {/* trust micro-badges */}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
                {["10% commission only", "Same-day payout after QC", "Free seller support"].map((t) => (
                  <span key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
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