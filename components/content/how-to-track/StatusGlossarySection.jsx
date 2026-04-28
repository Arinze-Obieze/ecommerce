import SectionHeader from "@/components/content/shared/SectionHeader";
import { TRACK_STATUSES } from "@/components/content/how-to-track/howToTrack.constants";

export default function StatusGlossarySection() {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="Status Guide" title="What each status means" />

      <div className="zova-info-card" style={{ overflow: "hidden" }}>
        {TRACK_STATUSES.map((status, index) => (
          <div
            key={status.key}
            style={{
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
              padding: "20px 28px",
              borderBottom: index < TRACK_STATUSES.length - 1 ? "1px solid #D4EAE0" : "none",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: 10,
                background: status.bg,
                border: `1px solid ${status.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {status.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ color: "#111111", fontSize: 15, fontWeight: 700 }}>{status.label}</span>
                <span style={{ borderRadius: 20, background: status.bg, padding: "2px 10px", color: status.color, fontSize: 11, fontWeight: 600 }}>
                  ETA: {status.eta}
                </span>
              </div>
              <p style={{ margin: 0, color: "#4B5563", fontSize: 13, lineHeight: 1.7 }}>{status.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
