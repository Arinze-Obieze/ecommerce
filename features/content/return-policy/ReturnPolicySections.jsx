'use client';

import {
  RETURN_POLICY_BRAND as B,
  RETURN_POLICY_FAQS,
  RETURN_POLICY_STEPS,
  RETURN_POLICY_TYPES,
} from '@/features/content/return-policy/returnPolicy.constants';

function ReturnCard({ data, isExpanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: B.white,
        borderRadius: 16,
        border: `2px solid ${isExpanded ? data.border : B.g200}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isExpanded ? `0 8px 30px ${data.color}20` : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: data.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {data.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: B.charcoal, lineHeight: 1.3 }}>{data.title}</div>
            <div style={{ fontSize: 14, color: B.g400, marginTop: 2 }}>{data.subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '6px 14px', borderRadius: 20, background: data.bg, fontWeight: 700, fontSize: 14, color: data.color, whiteSpace: 'nowrap' }}>
            {data.refund} Refund
          </div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: isExpanded ? B.green : B.g100, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: isExpanded ? B.white : B.g400, transition: 'transform 0.3s ease', display: 'block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${B.greenBorder}` }}>
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: B.green, marginBottom: 10 }}>
              This applies when:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {data.scenarios.map((scenario, index) => (
                <span key={index} style={{ padding: '6px 12px', borderRadius: 8, background: B.greenLight, border: `1px solid ${B.greenBorder}`, fontSize: 13, color: B.g600 }}>
                  {scenario}
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 12, background: data.bg, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: data.color }}>{data.refund}</div>
                <div style={{ fontSize: 12, color: B.g600, marginTop: 4 }}>{data.refundNote}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: B.greenLight, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: B.greenDark }}>{data.shipping}</div>
                <div style={{ fontSize: 12, color: B.g600, marginTop: 4 }}>{data.shippingNote}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: B.greenLight, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: B.greenDark }}>Timeline</div>
                <div style={{ fontSize: 12, color: B.g600, marginTop: 4 }}>{data.timeline}</div>
              </div>
            </div>
            {data.extra ? (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 13, color: '#D97706', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span> {data.extra}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div onClick={onToggle} style={{ padding: '18px 0', borderBottom: `1px solid ${B.greenBorder}`, cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: B.charcoal, lineHeight: 1.5 }}>{question}</div>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: isOpen ? B.green : B.greenLight, border: `1px solid ${isOpen ? B.green : B.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s ease' }}>
          <span style={{ fontSize: 14, color: isOpen ? B.white : B.green, transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', display: 'block', transition: 'transform 0.2s ease', lineHeight: 1 }}>+</span>
        </div>
      </div>
      {isOpen ? (
        <div style={{ marginTop: 12, fontSize: 14, color: B.g600, lineHeight: 1.8, paddingRight: 32, borderLeft: `3px solid ${B.green}`, paddingLeft: 14 }}>
          {answer}
        </div>
      ) : null}
    </div>
  );
}

export function ReturnPolicyLayout({ expandedCard, openFaq, onToggleCard, onToggleFaq }) {
  return (
    <div style={{ background: B.cream, minHeight: '100vh' }}>
      <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, padding: '64px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(46,100,23,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(46,100,23,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 20, background: 'rgba(46,100,23,0.2)', border: '1px solid rgba(46,100,23,0.4)', marginBottom: 22, fontSize: 12, fontWeight: 700, color: '#7FFFC4', letterSpacing: 1, textTransform: 'uppercase' }}>
            🛡️ Buyer Protection
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 900, color: B.white, lineHeight: 1.15, marginBottom: 16, letterSpacing: -0.5 }}>
            Returns &amp; Refund Policy
          </h1>
          <p style={{ fontSize: 17, color: B.greenSub, lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            Every item on ZOVA is quality-checked before it ships to you. If something is not right, we make it easy to fix.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', background: 'rgba(255,255,255,0.07)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', maxWidth: 480, margin: '40px auto 0' }}>
            {[{ val: '7 Days', label: 'Return Window' }, { val: '100%', label: 'QC Verified' }, { val: '48hrs', label: 'Max Refund Time' }].map((stat, index) => (
              <div key={stat.label} style={{ flex: 1, textAlign: 'center', padding: '20px 12px', borderRight: index < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: B.green }}>{stat.val}</div>
                <div style={{ fontSize: 11, color: B.greenSub, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: B.white, borderBottom: `1px solid ${B.greenBorder}`, padding: '14px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {['Every item inspected before shipping', 'Photos taken at QC for your protection', 'Fraud protection for honest buyers'].map((text) => (
            <span key={text} style={{ fontSize: 13, fontWeight: 600, color: B.greenMid, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: B.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: B.white, flexShrink: 0 }}>✓</span>
              {text}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '44px 24px 64px' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: B.green, marginBottom: 8 }}>Return Categories</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: B.charcoal, marginBottom: 6 }}>What type of return is this?</h2>
          <p style={{ fontSize: 15, color: B.g600, lineHeight: 1.6, marginBottom: 24 }}>
            Tap a category to see full details. Who pays depends on who is at fault — and we always protect honest customers.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RETURN_POLICY_TYPES.map((item) => (
              <ReturnCard key={item.id} data={item} isExpanded={expandedCard === item.id} onToggle={() => onToggleCard(item.id)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: B.green, marginBottom: 8 }}>Step by Step</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: B.charcoal, marginBottom: 28 }}>How to return an item</h2>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 23, top: 24, bottom: 24, width: 2, background: `linear-gradient(to bottom, ${B.green}, ${B.greenBorder})` }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {RETURN_POLICY_STEPS.map((step, index) => (
                <div key={step.num} style={{ display: 'flex', gap: 20, padding: '16px 0', position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: index === 0 ? B.green : B.white, border: `2px solid ${index === 0 ? B.green : B.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1, boxShadow: index === 0 ? `0 4px 12px ${B.green}40` : 'none' }}>
                    {step.icon}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: B.charcoal, marginBottom: 4 }}>
                      <span style={{ color: B.green, marginRight: 8, fontWeight: 800 }}>{step.num}</span>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 14, color: B.g600, lineHeight: 1.65 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 52, background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.greenMid} 100%)`, borderRadius: 20, padding: 36, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(46,100,23,0.15)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(46,100,23,0.1)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(46,100,23,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>🛡️</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: B.white, marginBottom: 12 }}>Swap Fraud Protection</h3>
            <p style={{ fontSize: 14, color: B.greenSub, lineHeight: 1.8, marginBottom: 20, maxWidth: 580 }}>
              Every item is photographed from multiple angles during our quality check before it ships. If a returned item does not match our records, we investigate immediately. Honest buyers are always protected. Fraudulent returners are blocked and reported.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['4+ QC photos per item', 'Unique markings documented', 'Video records for high-value items'].map((text) => (
                <span key={text} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(46,100,23,0.2)', border: '1px solid rgba(46,100,23,0.3)', fontSize: 12, fontWeight: 600, color: '#7FFFC4' }}>{text}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: B.green, marginBottom: 8 }}>Got Questions?</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: B.charcoal, marginBottom: 20 }}>Frequently Asked Questions</h2>
          <div style={{ background: B.white, borderRadius: 16, border: `1px solid ${B.greenBorder}`, padding: '0 24px' }}>
            {RETURN_POLICY_FAQS.map((faq, index) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} isOpen={openFaq === index} onToggle={() => onToggleFaq(index)} />
            ))}
          </div>
        </div>

        <div style={{ background: B.white, borderRadius: 20, border: `1px solid ${B.greenBorder}`, padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${B.green}, ${B.greenMid})` }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: B.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>💬</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: B.charcoal, marginBottom: 8 }}>Still need help?</h3>
          <p style={{ fontSize: 14, color: B.g600, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 24px' }}>
            Our support team is available Monday to Saturday, 8 AM to 8 PM WAT. We respond within 2 hours.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://wa.me/234XXXXXXXXXX" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: B.green, color: B.white, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 14px ${B.green}40` }}>
              📲 WhatsApp Us
            </a>
            <a href="mailto:support@zova.ng" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: B.greenLight, color: B.greenDark, fontSize: 14, fontWeight: 700, textDecoration: 'none', border: `1px solid ${B.greenBorder}` }}>
              ✉️ Email Support
            </a>
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: B.g400, lineHeight: 1.8 }}>
            This Return &amp; Refund Policy is part of the ZOVA Marketplace Seller Agreement (Version 2.0). In case of any conflict between this page and the full Agreement, the full Agreement prevails. This policy is governed by the laws of the Federal Republic of Nigeria. Last updated: March 2026.
          </p>
          <p style={{ fontSize: 12, color: B.g400, marginTop: 8 }}>
            &copy; 2026 ZOVA Limited. All rights reserved. | Onitsha Main Market, Anambra State, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}
