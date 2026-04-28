"use client";
import { useState } from "react";
import { LegalPageContainer, Section, P, Ul, InfoBox } from "@/app/(content)/legal/LegalComponents";
import { B } from "@/app/(content)/legal/layout";

const TOC = [
  { id: "what-is-ad-choice",   label: "1. What Is Ad Choice?" },
  { id: "ads-we-show",         label: "2. Ads We Show" },
  { id: "how-targeting-works", label: "3. How Targeting Works" },
  { id: "your-choices",        label: "4. Your Choices" },
  { id: "third-party-ads",     label: "5. Third-Party Ad Networks" },
  { id: "no-sensitive-ads",    label: "6. No Sensitive Targeting" },
  { id: "opt-out",             label: "7. Opt Out" },
  { id: "contact",             label: "8. Contact" },
];

const AD_PREFS = [
  { key: "personalised",    label: "Personalised Ads on ZOVA",       desc: "Show you fashion items based on your browsing and purchase history on our platform." },
  { key: "social_retarget", label: "Social Media Retargeting",        desc: "Show you ZOVA ads on Facebook, Instagram, and TikTok based on your platform activity." },
  { key: "email_promo",     label: "Promotional Emails",             desc: "Receive emails about new arrivals, flash sales, and personalised offers." },
  { key: "sms_promo",       label: "Promotional SMS",                desc: "Receive text messages about deals and offers relevant to your style preferences." },
];

export default function AdChoicePage() {
  const [prefs, setPrefs] = useState({ personalised: true, social_retarget: false, email_promo: true, sms_promo: false });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <LegalPageContainer
      title="Ad Choice"
      icon="📢"
      subtitle="We show ads to support ZOVA as a free platform. Here is exactly how our advertising works and the controls you have over it."
      lastUpdated="March 2026"
      tocItems={TOC}
    >

      <InfoBox icon="💚">
        ZOVA does not sell your personal data to advertisers. We use your activity on our platform to show you more relevant ads — and you can control or turn this off at any time.
      </InfoBox>

      <Section title="1. What Is Ad Choice?" id="what-is-ad-choice">
        <P>Ad Choice is your right to control how your data is used for advertising purposes. ZOVA uses your browsing behaviour, purchase history, and preferences to personalise the ads and content you see — both on our platform and on third-party platforms like Facebook and Instagram.</P>
        <P>This page explains what advertising we do, how it works, and most importantly, the choices you have to manage or opt out of advertising activities.</P>
        <P>Our advertising practices are governed by the Nigeria Data Protection Regulation (NDPR) 2019, the Nigeria Data Protection Act 2023, and applicable Nigerian consumer protection law.</P>
      </Section>

      <Section title="2. Ads We Show" id="ads-we-show">
        <P><strong>On-platform ads:</strong> When you browse ZOVA, you may see sponsored product placements and featured seller listings. These are paid placements by sellers who have purchased our Premium Placement package. They are clearly labelled as &quot;Sponsored&quot;.</P>
        <P><strong>Off-platform ads:</strong> We use retargeting technology to show ZOVA ads to our users on social media platforms including Facebook, Instagram, and TikTok. For example, if you viewed a specific item on ZOVA, you may later see that item advertised on Instagram.</P>
        <P><strong>Email and SMS marketing:</strong> With your consent, we send promotional emails and SMS messages about new arrivals, flash sales, and items relevant to your preferences.</P>
        <InfoBox icon="🏷️">Sponsored listings on ZOVA are always clearly marked. We do not alter product rankings or QC decisions based on advertising spend — every item still passes the same QC process.</InfoBox>
      </Section>

      <Section title="3. How Targeting Works" id="how-targeting-works">
        <P>ZOVA uses the following data to personalise ads:</P>
        <Ul items={[
          "Items you have viewed, saved to your Wishlist, or purchased on ZOVA",
          "Your size preferences and filter usage patterns",
          "Your general location (city-level, not precise GPS)",
          "Device type and operating system",
          "Time and frequency of your visits to our platform",
        ]} />
        <P>We do not use:</P>
        <Ul items={[
          "Your precise GPS location",
          "Your private messages or communications",
          "Data from other apps on your device",
          "Sensitive personal data such as health, religion, or political views",
          "Data purchased from third-party data brokers",
        ]} />
        <P>For off-platform retargeting, we share a hashed (anonymised) version of your email address or phone number with Meta and TikTok to match you with their user base. No other personal data is shared with advertisers.</P>
      </Section>

      <Section title="4. Your Choices" id="your-choices">
        <P>You can manage your advertising preferences below. Changes take effect within 24 hours.</P>

        {/* Ad preference toggles */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D4EAE0", overflow: "hidden", marginTop: 16, marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", background: "#F0FBF5", borderBottom: "1px solid #D4EAE0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>🎛️ My Ad Preferences</div>
            <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>Toggle each advertising type on or off.</div>
          </div>

          {AD_PREFS.map((pref) => (
            <div key={pref.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #F3F4F6", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2 }}>{pref.label}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{pref.desc}</div>
              </div>
              <div
                onClick={() => toggle(pref.key)}
                style={{
                  width: 44, height: 24, borderRadius: 12, flexShrink: 0, cursor: "pointer",
                  background: prefs[pref.key] ? 'var(--color-primary)' : "#E5E7EB",
                  position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{ position: "absolute", top: 2, left: prefs[pref.key] ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
              </div>
            </div>
          ))}

          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleSave}
              style={{ padding: "10px 22px", borderRadius: 8, background: 'var(--color-primary)', color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--zova-font-sans)" }}
            >
              {saved ? "✓ Preferences Saved!" : "Save My Preferences"}
            </button>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Changes apply within 24 hours.</span>
          </div>
        </div>
      </Section>

      <Section title="5. Third-Party Ad Networks" id="third-party-ads">
        <P>ZOVA works with the following advertising platforms for off-platform retargeting:</P>
        <Ul items={[
          "Meta (Facebook & Instagram): We use the Meta Pixel and Conversions API to measure and optimise our ads",
          "TikTok: We use TikTok Pixel for retargeting campaigns",
          "Google: We may use Google Ads for search and display advertising",
        ]} />
        <P>Each of these platforms has its own privacy settings and ad controls:</P>
        <Ul items={[
          "Meta: facebook.com/ads/preferences — manage ads shown to you on Facebook and Instagram",
          "TikTok: ads.tiktok.com — manage TikTok ad preferences in your account settings",
          "Google: myaccount.google.com/data-and-privacy — manage Google ad personalisation",
        ]} />
        <P>Opting out of ZOVA&apos;s retargeting does not automatically opt you out of ads shown by these platforms from other advertisers.</P>
      </Section>

      <Section title="6. No Sensitive Targeting" id="no-sensitive-ads">
        <P>ZOVA does not conduct advertising based on sensitive personal characteristics. We never target ads based on:</P>
        <Ul items={[
          "Health conditions, disabilities, or medical history",
          "Religious beliefs or practices",
          "Political opinions or affiliations",
          "Racial or ethnic origin",
          "Sexual orientation or gender identity",
          "Financial hardship or credit status",
        ]} />
        <P>We also do not target advertising at users we have reason to believe are under 18 years of age.</P>
        <InfoBox icon="🚫">ZOVA does not allow third-party advertisers to run ads on our platform. The only ads you see on ZOVA are from ZOVA itself or from verified sellers who have paid for Premium Placement.</InfoBox>
      </Section>

      <Section title="7. How to Opt Out Completely" id="opt-out">
        <P>If you want to opt out of all personalised advertising from ZOVA entirely, you have several options:</P>
        <Ul items={[
          "Use the preference panel above to disable all advertising categories",
          "Email optout@zova.ng with the subject line &quot;Ad Opt Out&quot; — we will process this within 5 business days",
          "Delete your account from your account settings page",
          "Use your browser&apos;s cookie controls to block all ZOVA cookies (see our Cookie Policy)",
        ]} />
        <P>Note that opting out of personalised ads does not mean you will see no ads — you may still see non-personalised or contextual ads on ZOVA. Opting out also does not affect your ability to use the platform.</P>
      </Section>

      <Section title="8. Contact" id="contact">
        <P>For questions about our advertising practices or to exercise your ad choices:</P>
        <Ul items={[
          "Email: privacy@zova.ng",
          "Opt-out requests: optout@zova.ng",
          "General legal: legal@zova.ng",
        ]} />
        <P>You may also contact the Nigeria Data Protection Commission (NDPC) at <strong>ndpc.gov.ng</strong> if you believe our advertising practices violate your rights under Nigerian data protection law.</P>
      </Section>

    </LegalPageContainer>
  );
}
