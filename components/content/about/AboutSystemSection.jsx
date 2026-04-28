import SectionHeader from "@/components/content/shared/SectionHeader";
import { ABOUT_SYSTEM_STEPS } from "@/components/content/about/about.constants";

export default function AboutSystemSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="How It Works" title="Not just a website. A full system." />

      <div className="zova-info-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }} className="max-md:grid-cols-1">
          {ABOUT_SYSTEM_STEPS.map((step, index) => (
            <div
              key={step.num}
              style={{
                position: "relative",
                borderRight: index < ABOUT_SYSTEM_STEPS.length - 1 ? "1px solid #D4EAE0" : "none",
                padding: "32px 24px",
              }}
            >
              <div style={{ marginBottom: 12, color: "var(--zova-primary-action)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", opacity: 0.7 }}>{step.num}</div>
              <div style={{ marginBottom: 14, fontSize: 28 }}>{step.icon}</div>
              <div style={{ marginBottom: 8, color: "#111111", fontSize: 15, fontWeight: 700 }}>{step.title}</div>
              <div style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.7 }}>{step.desc}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: index === 0 ? "var(--zova-primary-action)" : "transparent" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
