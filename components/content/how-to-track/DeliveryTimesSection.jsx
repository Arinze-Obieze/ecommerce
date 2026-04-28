import { DELIVERY_TIMES } from "@/components/content/how-to-track/howToTrack.constants";

export default function DeliveryTimesSection() {
  return (
    <section className="zova-info-section zova-info-dark-panel" style={{ padding: "40px 36px" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,100,23,0.15)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="zova-info-section-kicker" style={{ color: "var(--zova-accent-emphasis)", marginBottom: 10 }}>Delivery Times</div>
        <h3 style={{ margin: "0 0 24px", color: "white", fontFamily: "var(--zova-font-display)", fontSize: 26, fontWeight: 800 }}>How fast will it arrive?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }} className="max-md:grid-cols-1">
          {DELIVERY_TIMES.map((item) => (
            <div
              key={item.zone}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                padding: 20,
              }}
            >
              <div style={{ marginBottom: 8, color: "white", fontSize: 15 }}>{item.zone}</div>
              <div style={{ marginBottom: 4, color: "var(--zova-accent-emphasis)", fontSize: 22, fontWeight: 800 }}>{item.time}</div>
              <div style={{ color: "#A8C4B8", fontSize: 12 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
