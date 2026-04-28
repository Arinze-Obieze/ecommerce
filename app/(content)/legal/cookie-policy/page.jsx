"use client";
import { useState } from "react";
import { LegalPageContainer, Section, P, Ul, InfoBox } from "../LegalComponents";
import { B } from "../layout";
import { LuCookie, LuSettings2 } from "react-icons/lu";

const TOC = [
  { id: "what-are-cookies",  label: "1. What Are Cookies?" },
  { id: "cookies-we-use",    label: "2. Cookies We Use" },
  { id: "third-party",       label: "3. Third-Party Cookies" },
  { id: "managing-cookies",  label: "4. Managing Cookies" },
  { id: "consent",           label: "5. Your Consent" },
  { id: "changes",           label: "6. Changes" },
  { id: "contact",           label: "7. Contact" },
];

const COOKIE_TABLE = [
  { name: "zova_session",       type: "Essential",  purpose: "Keeps you logged in during your session", duration: "Session", canDisable: false },
  { name: "zova_cart",          type: "Essential",  purpose: "Remembers items in your shopping cart",   duration: "7 days",  canDisable: false },
  { name: "zova_auth_token",    type: "Essential",  purpose: "Secure authentication token",             duration: "30 days", canDisable: false },
  { name: "zova_analytics",     type: "Analytics",  purpose: "Tracks page views and user journeys",     duration: "2 years", canDisable: true  },
  { name: "zova_preferences",   type: "Functional", purpose: "Remembers your size and filter settings", duration: "1 year",  canDisable: true  },
  { name: "_ga, _gid",          type: "Analytics",  purpose: "Google Analytics — anonymous usage stats",duration: "2 years", canDisable: true  },
  { name: "fbpixel",            type: "Marketing",  purpose: "Facebook/Meta advertising pixel",         duration: "90 days", canDisable: true  },
  { name: "paystack_*",         type: "Essential",  purpose: "Required for secure payment processing",  duration: "Session", canDisable: false },
];

const TYPE_COLORS = {
  Essential:  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  Analytics:  { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  Functional: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  Marketing:  { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
};

export default function CookiePolicyPage() {
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [marketingOn, setMarketingOn] = useState(false);
  const [functionalOn, setFunctionalOn] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <LegalPageContainer
      title="Cookie Policy"
      icon={<LuCookie />}
      subtitle="We use cookies to make ZOVA work and to improve your experience. Here is exactly what we use and how to control it."
      lastUpdated="March 2026"
      tocItems={TOC}
    >

      <Section title="1. What Are Cookies?" id="what-are-cookies">
        <P>Cookies are small text files placed on your device when you visit a website. They allow websites to remember information about your visit, such as your login status, preferences, and shopping cart contents.</P>
        <P>Cookies are not programs and cannot carry viruses or access other files on your device. They are simply a way for our website to recognise your browser across visits.</P>
        <InfoBox icon={<LuCookie />}>ZOVA uses cookies to keep you logged in, remember your cart, understand how people use our platform, and (with your consent) show you relevant ads on social media.</InfoBox>
      </Section>

      <Section title="2. Cookies We Use" id="cookies-we-use">
        <P>Here is a full list of the cookies we set and what they do:</P>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F0FBF5" }}>
                {["Cookie Name", "Type", "Purpose", "Duration", "Can Disable"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: 'var(--color-text)', borderBottom: "2px solid #D4EAE0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COOKIE_TABLE.map((row, i) => {
                const tc = TYPE_COLORS[row.type];
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #E5E7EB", background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#1F2937" }}>{row.name}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: tc.color, background: tc.bg, border: `1px solid ${tc.border}` }}>{row.type}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#4B5563", lineHeight: 1.5 }}>{row.purpose}</td>
                    <td style={{ padding: "10px 14px", color: "#4B5563", whiteSpace: "nowrap" }}>{row.duration}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      {row.canDisable
                        ? <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}>Yes</span>
                        : <span style={{ color: "#9CA3AF", fontSize: 13 }}>Required</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Third-Party Cookies" id="third-party">
        <P>Some cookies on our platform are set by third-party services we use. We do not control these cookies directly, but we have listed them in the table above.</P>
        <Ul items={[
          "Paystack: Sets cookies required for secure payment processing. These are essential and cannot be disabled.",
          "Google Analytics: We use Google Analytics to understand how users navigate ZOVA. This data is anonymised and aggregated.",
          "Meta (Facebook) Pixel: If you consent to marketing cookies, we use the Meta Pixel to measure the effectiveness of our advertising on Facebook and Instagram.",
        ]} />
        <P>You can opt out of Google Analytics across all websites by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Google Analytics Opt-out Browser Add-on</a>.</P>
      </Section>

      <Section title="4. Managing Cookies" id="managing-cookies">
        <P>You can manage your cookie preferences at any time using the controls below, or by adjusting your browser settings.</P>

        {/* Cookie preference panel */}
        <div style={{ background: B.surface, borderRadius: 8, border: `1px solid ${B.border}`, overflow: "hidden", marginTop: 16, marginBottom: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ padding: "16px clamp(12px, 4vw, 24px)", background: B.hoverBg, borderBottom: `1px solid ${B.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: B.charcoal, display: "flex", alignItems: "center", gap: 8 }}>
              <LuSettings2 /> Your Cookie Preferences
            </div>
            <div style={{ fontSize: 13, color: B.textSubtle, marginTop: 4 }}>Essential cookies are always active. Toggle optional categories below.</div>
          </div>

          {[
            { key: "essential", label: "Essential Cookies", desc: "Required for login, cart, and payments. Cannot be disabled.", val: true, locked: true },
            { key: "functional", label: "Functional Cookies", desc: "Remember your size preferences and filter settings.", val: functionalOn, setter: setFunctionalOn, locked: false },
            { key: "analytics", label: "Analytics Cookies", desc: "Help us understand how people use ZOVA (anonymised).", val: analyticsOn, setter: setAnalyticsOn, locked: false },
            { key: "marketing", label: "Marketing Cookies", desc: "Allow us to show you ZOVA ads on social media platforms.", val: marketingOn, setter: setMarketingOn, locked: false },
          ].map((item, idx, arr) => (
            <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px clamp(12px, 4vw, 24px)", borderBottom: idx === arr.length - 1 ? "none" : `1px solid ${B.border}`, gap: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: B.charcoal, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: B.textSubtle }}>{item.desc}</div>
              </div>
              <div
                onClick={() => { if (!item.locked && item.setter) item.setter(!item.val); }}
                style={{
                  width: 44, height: 24, borderRadius: 12, flexShrink: 0, cursor: item.locked ? "not-allowed" : "pointer",
                  background: item.val ? B.green : B.borderDark,
                  position: "relative", transition: "background 0.2s cubic-bezier(0.19, 1, 0.22, 1)", opacity: item.locked ? 0.6 : 1,
                }}
              >
                <div style={{ position: "absolute", top: 2, left: item.val ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s cubic-bezier(0.19, 1, 0.22, 1)" }} />
              </div>
            </div>
          ))}

          <div style={{ padding: "16px clamp(12px, 4vw, 24px)", display: "flex", alignItems: "center", gap: 16, background: B.bg, borderTop: `1px solid ${B.border}` }}>
            <button
              onClick={handleSave}
              style={{ padding: "8px 24px", borderRadius: 4, background: B.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.15s ease", boxShadow: "0 2px 4px rgba(46,100,23,0.1)" }}
              onMouseOver={(e) => e.currentTarget.style.background = B.greenDark}
              onMouseOut={(e) => e.currentTarget.style.background = B.green}
            >
              {saved ? "✓ Saved" : "Save Preferences"}
            </button>
            <span style={{ fontSize: 13, color: B.textSubtle }}>Changes take effect on your next page load.</span>
          </div>
        </div>

        <P><strong>Via your browser:</strong> You can also control cookies through your browser settings. Note that disabling all cookies may break some features of our platform.</P>
        <Ul items={[
          "Chrome: Settings > Privacy & Security > Cookies",
          "Firefox: Settings > Privacy & Security > Cookies and Site Data",
          "Safari: Settings > Safari > Privacy > Block All Cookies",
          "Edge: Settings > Cookies and Site Permissions",
        ]} />
      </Section>

      <Section title="5. Your Consent" id="consent">
        <P>When you first visit ZOVA, we display a cookie banner asking for your consent to non-essential cookies. You can change your preferences at any time using the panel above or in your account settings.</P>
        <P>Essential cookies do not require consent as they are necessary for the platform to function. All other cookie categories are optional and only activated with your explicit consent.</P>
      </Section>

      <Section title="6. Changes to This Policy" id="changes">
        <P>We may update this Cookie Policy when we add new features or third-party services. We will notify you of significant changes via the cookie banner or email. The &quot;Last Updated&quot; date at the top of this page reflects the most recent version.</P>
      </Section>

      <Section title="7. Contact" id="contact">
        <P>If you have questions about our use of cookies, contact us at <a href="mailto:legal@zova.ng" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>legal@zova.ng</a> or read our full <a href="/legal/privacy-policy" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Privacy Policy</a>.</P>
      </Section>

    </LegalPageContainer>
  );
}
