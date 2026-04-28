import { ORDER_STEPS } from "@/components/content/how-to-order/howToOrder.constants";

export default function OrderHero({ activeStep, setActiveStep }) {
  return (
    <div className="zova-info-hero" style={{ padding: "68px 24px 60px" }}>
      <div className="zova-info-hero-pattern" style={{ backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="zova-info-hero-orb" style={{ top: -80, right: -80, width: 360, height: 360, border: "1px solid rgba(46,100,23,0.15)" }} />

      <div className="zova-info-hero-content" style={{ maxWidth: 700, textAlign: "center" }}>
        <div className="zova-info-kicker fade-up fade-up-1">🛒 Shopping Guide</div>
        <h1 className="zova-info-hero-title fade-up fade-up-2">
          How to Order on
          <em style={{ color: "var(--zova-accent-emphasis)", fontStyle: "italic", display: "block" }}>ZOVA</em>
        </h1>
        <p className="zova-info-hero-copy fade-up fade-up-3" style={{ maxWidth: 480, margin: "0 auto 28px" }}>
          From browsing to your doorstep in 6 simple steps. Every item quality-checked before it ships to you.
        </p>

        <div className="fade-up fade-up-4" style={{ display: "inline-flex", gap: 6 }}>
          {ORDER_STEPS.map((_, index) => (
            <div
              key={index}
              onClick={() => setActiveStep(index)}
              style={{
                width: index === activeStep ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: index === activeStep ? "var(--zova-accent-emphasis)" : "rgba(255,255,255,0.25)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
