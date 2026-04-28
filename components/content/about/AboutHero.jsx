export default function AboutHero() {
  return (
    <div
      className="zova-info-hero"
      style={{
        background: "linear-gradient(160deg, var(--zova-text-strong) 0%, #245213 60%, #1a9e5e 100%)",
        padding: "80px 24px 72px",
      }}
    >
      <div className="zova-info-hero-pattern" style={{ backgroundImage: "radial-gradient(circle, rgba(46,100,23,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.6 }} />
      <div className="zova-info-hero-orb" style={{ top: -120, right: -120, width: 480, height: 480, border: "1px solid rgba(46,100,23,0.15)" }} />
      <div className="zova-info-hero-orb" style={{ bottom: -80, left: -80, width: 320, height: 320, background: "rgba(46,100,23,0.07)" }} />

      <div className="zova-info-hero-content" style={{ maxWidth: 800, textAlign: "center" }}>
        <div className="zova-info-kicker fade-up fade-up-1">🇳🇬 Made in Onitsha, Built for Nigeria</div>

        <h1 className="zova-info-hero-title fade-up fade-up-2" style={{ fontSize: "clamp(36px, 6vw, 58px)", lineHeight: 1.1, marginBottom: 20 }}>
          We Fixed Online Fashion
          <br />
          <em style={{ color: "var(--zova-accent-emphasis)", fontStyle: "italic" }}>One Item at a Time.</em>
        </h1>

        <p className="zova-info-hero-copy fade-up fade-up-3" style={{ maxWidth: 540, margin: "0 auto 36px", fontSize: 17 }}>
          ZOVA is Nigeria&apos;s first quality-verified fashion marketplace. Every item passes through our physical hub before it reaches you. No fakes. No wrong sizes. No excuses.
        </p>

        <div
          className="fade-up fade-up-4"
          style={{
            display: "inline-flex",
            gap: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            padding: "10px 20px",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--zova-accent-emphasis)", fontWeight: 700 }}>www.zova.ng</span>
          <span>·</span>
          <span>Onitsha Main Market, Anambra</span>
          <span>·</span>
          <span>Est. 2024</span>
        </div>
      </div>
    </div>
  );
}
