import { SHIPPING_NOTES } from "@/components/content/shipping-info/shippingInfo.constants";

export default function ShippingNotesSection() {
  return (
    <section className="zova-info-section">
      <h2 style={{ margin: "0 0 20px", color: "#111111", fontFamily: "var(--zova-font-display)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800 }}>
        Important shipping notes
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }} className="max-md:grid-cols-1">
        {SHIPPING_NOTES.map((note) => (
          <div
            key={note.title}
            className="zova-info-card"
            style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "18px 20px" }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 10,
                background: "var(--zova-green-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {note.icon}
            </div>
            <div>
              <div style={{ marginBottom: 4, color: "#111111", fontSize: 13, fontWeight: 700 }}>{note.title}</div>
              <div style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.65 }}>{note.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
