import Link from "next/link";
import { CTA_FOOTNOTES } from "@/components/content/shipping-info/shippingInfo.constants";

export default function ShippingCtaSection() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        background: "linear-gradient(135deg, var(--zova-text-strong) 0%, #245213 100%)",
        padding: "52px 40px",
        textAlign: "center",
      }}
    >
      <div style={{ position: "absolute", top: -50, right: -50, width: 240, height: 240, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
      <div style={{ position: "absolute", bottom: -30, left: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(46,100,23,0.1)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="zova-info-section-kicker" style={{ color: "var(--zova-accent-emphasis)", marginBottom: 14 }}>Ready?</div>
        <h3 style={{ margin: "0 0 12px", color: "white", fontFamily: "var(--zova-font-display)", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, lineHeight: 1.25 }}>
          Shop now. We handle the rest.
        </h3>
        <p style={{ maxWidth: 420, margin: "0 auto 28px", color: "#A8C4B8", fontSize: 15, lineHeight: 1.75 }}>
          Every item quality-checked at our hub. Delivered fast. Tracked all the way. And if something is wrong, we fix it — free.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/shop"
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
            Browse All Items →
          </Link>
          <Link
            href="/how-to-track"
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
            Track My Order
          </Link>
          <a
            href="https://wa.me/234XXXXXXXXXX"
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
            📲 WhatsApp Support
          </a>
        </div>

        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {CTA_FOOTNOTES.map((item) => (
            <span key={item} style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--zova-accent-emphasis)" }}>✓</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
