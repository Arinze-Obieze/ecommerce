import SectionHeader from "@/components/content/shared/SectionHeader";
import { ORDER_FAQS } from "@/components/content/how-to-order/howToOrder.constants";

export default function OrderFaqSection({ openFaq, setOpenFaq }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <SectionHeader kicker="Questions?" title="Ordering FAQs" />

      <div className="zova-info-card" style={{ overflow: "hidden" }}>
        {ORDER_FAQS.map((item, index) => {
          const isOpen = openFaq === index;
          return (
            <div key={item.q} className="zova-info-faq-item" onClick={() => setOpenFaq(isOpen ? null : index)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ color: "#111111", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{item.q}</div>
                <div className={`zova-info-faq-toggle ${isOpen ? "is-open" : ""}`}>
                  <span style={{ fontSize: 14, color: isOpen ? "white" : "var(--zova-primary-action)", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", display: "block", transition: "transform 0.2s", lineHeight: 1 }}>+</span>
                </div>
              </div>
              {isOpen ? (
                <div style={{ marginTop: 12, borderLeft: "3px solid var(--zova-primary-action)", paddingLeft: 14, color: "#4B5563", fontSize: 14, lineHeight: 1.8 }}>
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
