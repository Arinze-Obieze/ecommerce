import { PAYMENT_METHODS } from "@/components/content/how-to-order/howToOrder.constants";

export default function PaymentsSection() {
  return (
    <section className="zova-info-section zova-info-light-panel" style={{ padding: "36px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }} className="max-md:grid-cols-1">
        <div>
          <div className="zova-info-section-kicker" style={{ marginBottom: 10 }}>Payments</div>
          <h3 style={{ margin: "0 0 12px", color: "#111111", fontFamily: "var(--zova-font-display)", fontSize: 24, fontWeight: 800 }}>
            Safe, fast, and flexible
          </h3>
          <p style={{ margin: "0 0 20px", color: "#4B5563", fontSize: 14, lineHeight: 1.75 }}>
            All payments are processed securely through Paystack and held in escrow until your item clears our QC hub. Your money is always protected.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #D4EAE0",
              borderRadius: 8,
              background: "var(--zova-green-soft)",
              padding: "10px 16px",
            }}
          >
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ color: "var(--zova-text-strong)", fontSize: 13, fontWeight: 600 }}>SSL secured via Paystack</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {PAYMENT_METHODS.map((item) => (
            <div
              key={item.method}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "#F9FAFB",
                padding: 16,
              }}
            >
              <div style={{ marginBottom: 6, fontSize: 20 }}>{item.icon}</div>
              <div style={{ marginBottom: 2, color: "#111111", fontSize: 13, fontWeight: 700 }}>{item.method}</div>
              <div style={{ color: "#9CA3AF", fontSize: 11 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
