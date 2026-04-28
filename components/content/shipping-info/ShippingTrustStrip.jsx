import { TRUST_ITEMS } from "@/components/content/shipping-info/shippingInfo.constants";

export default function ShippingTrustStrip() {
  return (
    <div className="zova-info-trust-strip">
      <div className="zova-info-trust-list">
        {TRUST_ITEMS.map((item) => (
          <span key={item} className="zova-info-trust-item">
            <span className="zova-info-trust-check">✓</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
