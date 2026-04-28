import Link from "next/link";

export default function OrderCtaSection() {
  return (
    <section className="zova-info-dark-panel" style={{ padding: "44px 36px", textAlign: "center" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <h3 style={{ margin: "0 0 10px", color: "white", fontFamily: "var(--zova-font-display)", fontSize: 26, fontWeight: 800 }}>
          Ready to shop with confidence?
        </h3>
        <p style={{ maxWidth: 400, margin: "0 auto 24px", color: "#A8C4B8", fontSize: 14 }}>
          Every item verified. Every order tracked. Every delivery guaranteed to match what you saw.
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
              padding: "13px 26px",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(46,100,23,0.4)",
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
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              background: "rgba(255,255,255,0.1)",
              color: "white",
              padding: "13px 26px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            How to Track My Order
          </Link>
        </div>
      </div>
    </section>
  );
}
