import { ABOUT_HUB_FEATURES } from "@/components/content/about/about.constants";

export default function AboutMissionSection() {
  return (
    <section className="zova-info-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="max-md:grid-cols-1">
      <div>
        <div className="zova-info-section-kicker" style={{ marginBottom: 12 }}>Our Mission</div>
        <h2 style={{ margin: "0 0 20px", color: "#111111", fontFamily: "var(--zova-font-display)", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2 }}>
          Trust should be the <em style={{ color: "var(--zova-primary-action)" }}>default</em>, not the exception.
        </h2>
        <p style={{ margin: "0 0 16px", color: "#4B5563", fontSize: 15, lineHeight: 1.85 }}>
          We started ZOVA because buying clothes online in Nigeria felt like gambling. You&apos;d pay, wait, and hope — and too often, what arrived didn&apos;t match what was promised.
        </p>
        <p style={{ margin: 0, color: "#4B5563", fontSize: 15, lineHeight: 1.85 }}>
          We built a different kind of marketplace — one with a real physical hub, real quality checks, and real accountability. For buyers and sellers alike.
        </p>
      </div>

      <div className="zova-info-dark-panel" style={{ borderRadius: 24, padding: 36 }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(46,100,23,0.2)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏪</div>
          <div className="zova-info-section-kicker" style={{ color: "var(--zova-accent-emphasis)", marginBottom: 8 }}>Based at</div>
          <div style={{ marginBottom: 12, color: "white", fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>Onitsha Main Market</div>
          <div style={{ color: "#A8C4B8", fontSize: 14, lineHeight: 1.7 }}>
            Anambra State, Nigeria — the commercial heartbeat of West Africa.
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {ABOUT_HUB_FEATURES.map((feature) => (
              <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "var(--zova-accent-emphasis)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 10,
                  }}
                >
                  ✓
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
