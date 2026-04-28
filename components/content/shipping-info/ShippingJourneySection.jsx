import SectionHeader from "@/components/content/shared/SectionHeader";
import { PROCESS_STEPS } from "@/components/content/shipping-info/shippingInfo.constants";

export default function ShippingJourneySection({ activeStep, setActiveStep }) {
  return (
    <section className="zova-info-section">
      <SectionHeader
        kicker="The Journey"
        title="From seller to your door"
        copy="Every order goes through the same 6-step process — no shortcuts, no surprises."
      />

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 27, top: 28, bottom: 28, width: 2, background: "linear-gradient(to bottom, var(--zova-primary-action), #D4EAE0)" }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {PROCESS_STEPS.map((step, index) => {
            const isActive = activeStep === index;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(isActive ? null : index)}
                style={{ display: "flex", gap: 20, padding: "16px 0", cursor: "pointer", transition: "all 0.2s" }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    zIndex: 1,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: isActive ? step.color : "white",
                    border: `2px solid ${isActive ? step.color : "#D4EAE0"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    boxShadow: isActive ? `0 4px 16px ${step.color}35` : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  {step.icon}
                </div>

                <div
                  style={{
                    flex: 1,
                    border: isActive ? "1px solid #D4EAE0" : "none",
                    borderRadius: 14,
                    background: isActive ? "white" : "transparent",
                    padding: isActive ? "16px 20px" : "10px 0",
                    boxShadow: isActive ? "0 4px 18px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: step.color, letterSpacing: "0.08em" }}>STEP {step.num}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#111111" }}>{step.title}</span>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: 20, background: step.bg, fontSize: 11, fontWeight: 700, color: step.color }}>{step.time}</span>
                  </div>
                  {isActive ? (
                    <p style={{ margin: "10px 0 0", color: "#4B5563", fontSize: 14, lineHeight: 1.75 }}>{step.desc}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 8,
          border: "1px solid #D4EAE0",
          borderRadius: 10,
          background: "var(--zova-green-soft)",
          padding: "12px 18px",
          color: "var(--zova-text-strong)",
          fontSize: 13,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        👆 Tap any step to see what happens at that stage
      </div>
    </section>
  );
}
