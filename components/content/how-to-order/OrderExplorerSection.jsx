import Link from "next/link";
import { ORDER_STEPS } from "@/components/content/how-to-order/howToOrder.constants";

export default function OrderExplorerSection({ activeStep, setActiveStep }) {
  const step = ORDER_STEPS[activeStep];

  return (
    <section className="zova-info-section">
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }} className="max-md:grid-cols-1">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "sticky", top: 24 }} className="max-md:static">
          {ORDER_STEPS.map((item, index) => {
            const isActive = activeStep === index;
            return (
              <button
                key={item.num}
                onClick={() => setActiveStep(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: `1px solid ${isActive ? "var(--zova-primary-action)" : "#D4EAE0"}`,
                  borderRadius: 12,
                  background: isActive ? "var(--zova-primary-action)" : "white",
                  padding: "12px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 8,
                    background: isActive ? "rgba(255,255,255,0.2)" : "var(--zova-green-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ color: isActive ? "rgba(255,255,255,0.7)" : "var(--zova-primary-action)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
                    STEP {item.num}
                  </div>
                  <div style={{ color: isActive ? "white" : "#111111", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div key={activeStep} style={{ animation: "zovaFadeUp 0.3s ease both" }}>
          <div className="zova-info-card" style={{ overflow: "hidden", borderRadius: 20 }}>
            <div className="zova-info-dark-panel" style={{ borderRadius: 0, padding: "32px 36px" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(46,100,23,0.2)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: "rgba(46,100,23,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ marginBottom: 4, color: "var(--zova-accent-emphasis)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      Step {step.num} of {ORDER_STEPS.length}
                    </div>
                    <h3 style={{ margin: 0, color: "white", fontFamily: "var(--zova-font-display)", fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
                      {step.title}
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#A8C4B8", fontSize: 13, fontWeight: 600 }}>{step.subtitle}</p>
                  </div>
                </div>
                <p style={{ maxWidth: 520, margin: 0, color: "#A8C4B8", fontSize: 14, lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            </div>

            <div style={{ padding: "28px 36px" }}>
              <div style={{ marginBottom: 16, color: "var(--zova-primary-action)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                💡 Pro Tips
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {step.tips.map((tip) => (
                  <div
                    key={tip}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      border: "1px solid #D4EAE0",
                      borderRadius: 10,
                      background: "var(--zova-green-soft)",
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        flexShrink: 0,
                        marginTop: 1,
                        borderRadius: "50%",
                        background: "var(--zova-primary-action)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 11,
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ color: "#1F2937", fontSize: 14, lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px 28px" }}>
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                style={{
                  border: "1px solid #D4EAE0",
                  borderRadius: 8,
                  background: "white",
                  padding: "10px 20px",
                  color: activeStep === 0 ? "#9CA3AF" : "var(--zova-text-strong)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: activeStep === 0 ? "not-allowed" : "pointer",
                  opacity: activeStep === 0 ? 0.4 : 1,
                }}
              >
                ← Previous
              </button>

              <div style={{ display: "flex", gap: 4 }}>
                {ORDER_STEPS.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveStep(index)}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: index === activeStep ? "var(--zova-primary-action)" : "#D4EAE0",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>

              {activeStep < ORDER_STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  style={{
                    border: 0,
                    borderRadius: 8,
                    background: "var(--zova-primary-action)",
                    color: "white",
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Next Step →
                </button>
              ) : (
                <Link
                  href="/shop"
                  style={{
                    display: "inline-block",
                    borderRadius: 8,
                    background: "var(--zova-primary-action)",
                    color: "white",
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Start Shopping →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
