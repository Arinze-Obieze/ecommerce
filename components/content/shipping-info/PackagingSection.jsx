import SectionHeader from "@/components/content/shared/SectionHeader";
import { PACKAGING_FEATURES } from "@/components/content/shipping-info/shippingInfo.constants";

export default function PackagingSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader
        kicker="Packaging"
        title="Packaged with care"
        copy="Every item leaves our hub looking like a gift — even if it is just for you."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }} className="max-md:grid-cols-1">
        {PACKAGING_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="zova-info-card"
            style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "24px" }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 12,
                background: "var(--zova-green-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {feature.icon}
            </div>
            <div>
              <div style={{ marginBottom: 5, color: "#111111", fontSize: 15, fontWeight: 700 }}>{feature.title}</div>
              <div style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.65 }}>{feature.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
