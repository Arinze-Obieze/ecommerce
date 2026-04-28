import SectionHeader from "@/components/content/shared/SectionHeader";
import { ORDER_STEPS } from "@/components/content/how-to-order/howToOrder.constants";

export default function OrderOverviewSection({ activeStep, setActiveStep }) {
  return (
    <section className="zova-info-section">
      <SectionHeader kicker="At a Glance" title="Your order, step by step" />

      <div className="zova-info-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }} className="max-md:grid-cols-2">
          {ORDER_STEPS.map((step, index) => (
            <div
              key={step.num}
              onClick={() => setActiveStep(index)}
              style={{
                position: "relative",
                borderRight: index < ORDER_STEPS.length - 1 ? "1px solid #D4EAE0" : "none",
                background: activeStep === index ? "var(--zova-green-soft)" : "transparent",
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              className="max-md:border-b"
            >
              {activeStep === index ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "var(--zova-primary-action)" }} /> : null}
              <div style={{ marginBottom: 8, fontSize: 24 }}>{step.icon}</div>
              <div style={{ marginBottom: 4, color: "var(--zova-primary-action)", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>{step.num}</div>
              <div style={{ color: "#111111", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{step.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
