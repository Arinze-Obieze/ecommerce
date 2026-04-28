import SectionHeader from "@/components/content/shared/SectionHeader";
import { ABOUT_TIMELINE } from "@/components/content/about/about.constants";

export default function AboutTimelineSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="Our Story" title="How ZOVA came to be" />

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 2, background: "linear-gradient(to bottom, var(--zova-primary-action), #D4EAE0)" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ABOUT_TIMELINE.map((item, index) => {
            const isCurrent = index === ABOUT_TIMELINE.length - 1;
            return (
              <div key={item.year} style={{ display: "flex", gap: 28, padding: "20px 0" }}>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: isCurrent ? "var(--zova-primary-action)" : "white",
                      border: `2px solid ${isCurrent ? "var(--zova-primary-action)" : "#D4EAE0"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isCurrent ? "white" : "var(--zova-primary-action)",
                      fontSize: 11,
                      fontWeight: 800,
                      boxShadow: isCurrent ? "0 0 0 4px var(--zova-green-soft)" : "none",
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div style={{ paddingTop: 6, paddingBottom: 12 }}>
                  <div style={{ marginBottom: 4, color: "var(--zova-primary-action)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {item.year}
                  </div>
                  <div style={{ marginBottom: 6, color: "#111111", fontSize: 17, fontWeight: 700 }}>{item.title}</div>
                  <div style={{ maxWidth: 600, color: "#4B5563", fontSize: 14, lineHeight: 1.75 }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
