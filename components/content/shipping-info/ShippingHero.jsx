import { HERO_STATS } from "@/components/content/shipping-info/shippingInfo.constants";

export default function ShippingHero() {
  return (
    <div className="zova-info-hero">
      <div className="zova-info-hero-pattern" />
      <div className="zova-info-hero-orb" style={{ top: -100, right: -100, width: 400, height: 400, border: "1px solid rgba(46,100,23,0.15)" }} />
      <div className="zova-info-hero-orb" style={{ bottom: -60, left: -60, width: 260, height: 260, background: "rgba(46,100,23,0.07)" }} />

      <div className="zova-info-hero-content">
        <div className="zova-info-kicker fade-up fade-up-1">🚚 Shipping &amp; Delivery</div>

        <h1 className="zova-info-hero-title fade-up fade-up-2">
          Fast. Tracked. <em style={{ color: "var(--zova-accent-emphasis)", fontStyle: "italic" }}>Guaranteed.</em>
        </h1>

        <p className="zova-info-hero-copy fade-up fade-up-3">
          Every ZOVA order is quality-checked at our Onitsha hub before it ships. What you ordered is exactly what arrives — or we fix it for free.
        </p>

        <div className="zova-info-stat-grid fade-up fade-up-4">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="zova-info-stat">
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <div className="zova-info-stat-value">{stat.val}</div>
              <div className="zova-info-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
