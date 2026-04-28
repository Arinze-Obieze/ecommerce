import SectionHeader from "@/components/content/shared/SectionHeader";
import ZoneCard from "@/components/content/shipping-info/ZoneCard";
import { DELIVERY_ZONES } from "@/components/content/shipping-info/shippingInfo.constants";

export default function DeliveryZonesSection({ activeZone, setActiveZone }) {
  return (
    <section className="zova-info-section">
      <SectionHeader
        kicker="Delivery Zones"
        title="How fast will it reach you?"
        copy="Tap any zone to see the cities covered and exact delivery fee."
      />

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

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--zova-text-strong), #245213)",
          padding: "18px 22px",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 12,
            background: "rgba(46,100,23,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          📍
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 3, color: "white", fontSize: 14, fontWeight: 700 }}>Free Hub Pickup — Onitsha</div>
          <div style={{ color: "#A8C4B8", fontSize: 13 }}>
            Skip the delivery fee entirely. Select Hub Pickup at checkout and collect your order from our Onitsha hub on the same day it passes QC. Bring your order confirmation SMS.
          </div>
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            border: "1px solid rgba(46,100,23,0.4)",
            borderRadius: 8,
            background: "rgba(46,100,23,0.25)",
            padding: "9px 18px",
            color: "#7FFFC4",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          ₦0 — Free
        </div>
      </div>
    </section>
  );
}
