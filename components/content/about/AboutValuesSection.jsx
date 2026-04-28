import SectionHeader from "@/components/content/shared/SectionHeader";
import { ABOUT_VALUES } from "@/components/content/about/about.constants";

export default function AboutValuesSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="What We Stand For" title="Our core values" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }} className="max-md:grid-cols-1">
        {ABOUT_VALUES.map((value) => (
          <div key={value.title} className="zova-info-card" style={{ padding: "28px" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "var(--zova-green-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 18,
              }}
            >
              {value.icon}
            </div>
            <div style={{ marginBottom: 8, color: "#111111", fontSize: 17, fontWeight: 700 }}>{value.title}</div>
            <div style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.75 }}>{value.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
