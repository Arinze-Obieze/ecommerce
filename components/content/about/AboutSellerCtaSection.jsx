import { ABOUT_SELLER_BADGES } from "@/components/content/about/about.constants";

export default function AboutSellerCtaSection() {
  return (
    <section className="zova-info-dark-panel" style={{ borderRadius: 24, padding: "52px 40px", textAlign: "center" }}>
      <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(46,100,23,0.1)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="zova-info-section-kicker" style={{ color: "var(--zova-accent-emphasis)", marginBottom: 14 }}>Join ZOVA</div>
        <h2 style={{ margin: "0 0 14px", color: "white", fontFamily: "var(--zova-font-display)", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, lineHeight: 1.2 }}>
          Ready to sell to thousands
          <br />
          of verified buyers?
        </h2>
        <p style={{ maxWidth: 440, margin: "0 auto 32px", color: "#A8C4B8", fontSize: 15, lineHeight: 1.75 }}>
          Join our growing network of verified sellers. List your items, pass QC, and get paid — same day. No hidden fees, no surprises.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <a
            href="/seller"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              background: "var(--zova-primary-action)",
              color: "white",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(46,100,23,0.4)",
            }}
          >
            Become a Seller →
          </a>
          <a
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Shop Now
          </a>
        </div>

        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {ABOUT_SELLER_BADGES.map((badge) => (
            <span key={badge} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--zova-accent-emphasis)" }}>✓</span>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
