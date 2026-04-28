import SectionHeader from "@/components/content/shared/SectionHeader";
import { DELIVERY_ZONES } from "@/components/content/shipping-info/shippingInfo.constants";

export default function FeesSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="Delivery Fees" title="Clear, flat-rate pricing" />

      <div className="zova-info-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "var(--zova-text-strong)", padding: "14px 24px" }} className="max-md:hidden">
          {["Delivery Zone", "Delivery Time", "Fee", "Hub Pickup"].map((heading) => (
            <div key={heading} style={{ color: "#A8C4B8", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              {heading}
            </div>
          ))}
        </div>

        {DELIVERY_ZONES.map((zone, index) => (
          <div
            key={zone.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 0,
              padding: "16px 24px",
              background: index % 2 === 0 ? "white" : "#F9FAFB",
              borderBottom: index < DELIVERY_ZONES.length - 1 ? "1px solid #D4EAE0" : "none",
            }}
            className="max-md:grid-cols-1 max-md:gap-3"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{zone.icon}</span>
              <span style={{ color: "#111111", fontSize: 14, fontWeight: 600 }}>{zone.zone}</span>
            </div>
            <div>
              <span style={{ padding: "4px 10px", borderRadius: 20, background: zone.bg, color: zone.color, fontSize: 12, fontWeight: 700 }}>{zone.time}</span>
            </div>
            <div style={{ color: zone.color, fontSize: 15, fontWeight: 800 }}>{zone.fee}</div>
            <div style={{ color: "var(--zova-primary-action)", fontSize: 13, fontWeight: 600 }}>Free ✓</div>
          </div>
        ))}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 0,
            padding: "16px 24px",
            background: "var(--zova-green-soft)",
            borderTop: "2px solid #D4EAE0",
          }}
          className="max-md:grid-cols-1 max-md:gap-3"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <span style={{ color: "var(--zova-text-strong)", fontSize: 14, fontWeight: 700 }}>Hub Pickup (Onitsha)</span>
          </div>
          <div>
            <span style={{ padding: "4px 10px", borderRadius: 20, background: "var(--zova-primary-action)", color: "white", fontSize: 12, fontWeight: 700 }}>Same Day</span>
          </div>
          <div style={{ color: "var(--zova-primary-action)", fontSize: 15, fontWeight: 900 }}>₦0 — Free</div>
          <div style={{ color: "#4B5563", fontSize: 13 }}>Collect at hub</div>
        </div>
      </div>
    </section>
  );
}
