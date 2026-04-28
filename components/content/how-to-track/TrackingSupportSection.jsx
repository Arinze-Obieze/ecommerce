import Link from "next/link";

export default function TrackingSupportSection() {
  return (
    <section className="zova-info-light-panel" style={{ padding: "40px 36px", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--zova-primary-action), #245213)" }} />
      <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
      <h3 style={{ margin: "0 0 8px", color: "#111111", fontFamily: "var(--zova-font-display)", fontSize: 22, fontWeight: 800 }}>
        Need help with your order?
      </h3>
      <p style={{ maxWidth: 380, margin: "0 auto 24px", color: "#4B5563", fontSize: 14 }}>
        Our support team responds within 2 hours on WhatsApp. Available Monday to Saturday, 8 AM to 8 PM WAT.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a
          href="https://wa.me/234XXXXXXXXXX"
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
            boxShadow: "0 4px 16px rgba(46,100,23,0.35)",
          }}
        >
          📲 WhatsApp Support
        </a>
        <Link
          href="/how-to-order"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 10,
            border: "1px solid #D4EAE0",
            background: "var(--zova-green-soft)",
            color: "var(--zova-text-strong)",
            padding: "13px 26px",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          How to Order
        </Link>
      </div>
    </section>
  );
}
