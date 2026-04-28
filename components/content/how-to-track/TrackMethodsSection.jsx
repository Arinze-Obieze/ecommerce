import SectionHeader from "@/components/content/shared/SectionHeader";
import { TRACK_METHODS } from "@/components/content/how-to-track/howToTrack.constants";

export default function TrackMethodsSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="Tracking Methods" title="4 ways to track your order" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }} className="max-md:grid-cols-1">
        {TRACK_METHODS.map((method) => (
          <div key={method.title} className="zova-info-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  borderRadius: 14,
                  background: method.bg,
                  border: `1px solid ${method.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {method.icon}
              </div>
              <div>
                <div style={{ color: "#111111", fontSize: 16, fontWeight: 700 }}>{method.title}</div>
                <div style={{ color: method.color, fontSize: 12, fontWeight: 600, marginTop: 2 }}>{method.highlight}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {method.steps.map((step, index) => (
                <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      marginTop: 1,
                      borderRadius: "50%",
                      background: method.bg,
                      border: `1px solid ${method.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: method.color,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </div>
                  <span style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.6 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
