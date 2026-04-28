import SectionHeader from "@/components/content/shared/SectionHeader";
import { SHIPPING_FAQS } from "@/components/content/shipping-info/shippingInfo.constants";

function ShippingFaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="zova-info-faq-item" onClick={onToggle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ color: "#111111", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{item.q}</div>
        <div className={`zova-info-faq-toggle ${isOpen ? "is-open" : ""}`}>
          <span style={{ fontSize: 15, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s", lineHeight: 1 }}>+</span>
        </div>
      </div>
      {isOpen ? (
        <div style={{ marginTop: 12, borderLeft: "3px solid var(--zova-primary-action)", paddingLeft: 14, color: "#4B5563", fontSize: 14, lineHeight: 1.85 }}>
          {item.a}
        </div>
      ) : null}
    </div>
  );
}

export default function ShippingFaqSection({ openFaq, setOpenFaq }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHeader kicker="Got Questions?" title="Shipping FAQs" />

      <div className="zova-info-card" style={{ overflow: "hidden" }}>
        {SHIPPING_FAQS.map((item, index) => (
          <ShippingFaqItem
            key={item.q}
            item={item}
            isOpen={openFaq === index}
            onToggle={() => setOpenFaq(openFaq === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
