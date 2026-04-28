export default function TrackingHero() {
  return (
    <div className="zova-info-hero" style={{ padding: "68px 24px 60px" }}>
      <div className="zova-info-hero-pattern" style={{ backgroundImage: "radial-gradient(circle, rgba(46, 100, 23, 0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="zova-info-hero-orb" style={{ top: -80, left: -80, width: 360, height: 360, border: "1px solid rgba(46,100,23,0.12)", background: "rgba(46,100,23,0.08)" }} />

      <div className="zova-info-hero-content" style={{ maxWidth: 700, textAlign: "center" }}>
        <div className="zova-info-kicker fade-up fade-up-1">🚚 Order Tracking</div>
        <h1 className="zova-info-hero-title fade-up fade-up-2" style={{ marginBottom: 16 }}>
          Track Your Order
          <em style={{ color: "var(--zova-accent-emphasis)", fontStyle: "italic", display: "block" }}>Every Step of the Way</em>
        </h1>
        <p className="zova-info-hero-copy fade-up fade-up-3" style={{ maxWidth: 500, margin: "0 auto" }}>
          From the moment you pay to the moment it arrives at your door — you are always in the loop. Real-time updates, zero guesswork.
        </p>
      </div>
    </div>
  );
}
