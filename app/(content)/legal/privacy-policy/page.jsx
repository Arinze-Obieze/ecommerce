"use client";
import { LegalPageContainer, Section, P, Ul, InfoBox } from "../LegalComponents";

const TOC = [
  { id: "who-we-are",       label: "1. Who We Are" },
  { id: "data-we-collect",  label: "2. Data We Collect" },
  { id: "how-we-use",       label: "3. How We Use Your Data" },
  { id: "sharing",          label: "4. Sharing Your Data" },
  { id: "your-rights",      label: "5. Your Rights (NDPR)" },
  { id: "cookies",          label: "6. Cookies" },
  { id: "retention",        label: "7. Data Retention" },
  { id: "security",         label: "8. Security" },
  { id: "minors",           label: "9. Minors" },
  { id: "changes",          label: "10. Changes to This Policy" },
  { id: "contact",          label: "11. Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageContainer
      title="Privacy Policy"
      icon="🔒"
      subtitle="We value your privacy. This policy explains what data we collect, why we collect it, and how we protect it — in plain language."
      lastUpdated="March 2026"
      tocItems={TOC}
    >

      <Section title="1. Who We Are" id="who-we-are">
        <P>ZOVA Limited (&quot;ZOVA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the ZOVA marketplace platform available at www.zova.ng. We are registered in Nigeria and headquartered at Onitsha Main Market, Anambra State.</P>
        <P>We act as the data controller for personal information collected through our platform. This Privacy Policy explains how we collect, use, share, and protect your personal data in compliance with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act 2023.</P>
        <InfoBox icon="🇳🇬">This policy is governed by Nigerian law, specifically the NDPR 2019 and the Nigeria Data Protection Act 2023 administered by the Nigeria Data Protection Commission (NDPC).</InfoBox>
      </Section>

      <Section title="2. Data We Collect" id="data-we-collect">
        <P><strong>Information you provide directly:</strong></P>
        <Ul items={[
          "Name, email address, phone number, and delivery address when you create an account",
          "Payment information (processed securely via Paystack — we do not store card details)",
          "Bank Verification Number (BVN) for seller verification and identity confirmation",
          "Photos and product descriptions submitted by sellers",
          "Messages sent to our support team via WhatsApp, email, or platform chat",
        ]} />
        <P><strong>Information collected automatically:</strong></P>
        <Ul items={[
          "Device type, browser, and operating system",
          "IP address and approximate location",
          "Pages visited, time spent, and actions taken on our platform",
          "Cookies and similar tracking technologies (see Section 6)",
          "Order history and transaction data",
        ]} />
        <P><strong>Information from third parties:</strong></P>
        <Ul items={[
          "Payment verification data from Paystack",
          "Identity verification data from our KYC provider",
          "Logistics and delivery status from our courier partners",
        ]} />
      </Section>

      <Section title="3. How We Use Your Data" id="how-we-use">
        <P>We use your personal data only for lawful purposes. Specifically:</P>
        <Ul items={[
          "To process and fulfil your orders, including payment, QC, and delivery",
          "To verify the identity of sellers and prevent fraud",
          "To send order confirmations, tracking updates, and support messages",
          "To send marketing communications (only with your explicit consent)",
          "To improve our platform based on usage patterns and feedback",
          "To comply with legal obligations under Nigerian law",
          "To resolve disputes between buyers and sellers",
          "To detect and prevent fraudulent activity on the platform",
        ]} />
        <InfoBox icon="📧">We will only send you marketing emails or SMS if you have opted in. You can unsubscribe at any time by clicking &quot;Unsubscribe&quot; in any email or replying STOP to any SMS.</InfoBox>
      </Section>

      <Section title="4. Sharing Your Data" id="sharing">
        <P>We do not sell your personal data. We share your data only in the following circumstances:</P>
        <Ul items={[
          "With sellers: We share your delivery address and name with the seller fulfilling your order",
          "With logistics partners: Your name, address, and phone number are shared for delivery purposes",
          "With Paystack: Payment processing requires sharing transaction data with Paystack",
          "With identity verification providers: For seller KYC/BVN verification only",
          "With law enforcement: If required by Nigerian law or court order",
          "With our legal or professional advisors: Where necessary to protect our rights",
        ]} />
        <P>All third parties we share data with are required to handle it in accordance with applicable Nigerian data protection law.</P>
      </Section>

      <Section title="5. Your Rights (NDPR)" id="your-rights">
        <P>Under the NDPR 2019 and Nigeria Data Protection Act 2023, you have the following rights:</P>
        <Ul items={[
          "Right to Access: Request a copy of the personal data we hold about you",
          "Right to Rectification: Ask us to correct inaccurate or incomplete data",
          "Right to Erasure: Ask us to delete your data (subject to legal obligations)",
          "Right to Restriction: Ask us to limit how we use your data",
          "Right to Data Portability: Receive your data in a machine-readable format",
          "Right to Object: Object to processing based on legitimate interests or for direct marketing",
          "Right to Withdraw Consent: Where processing is based on consent, withdraw it at any time",
        ]} />
        <P>To exercise any of these rights, contact us at <strong>legal@zova.ng</strong>. We will respond within 30 days. If you are unhappy with our response, you may lodge a complaint with the Nigeria Data Protection Commission (NDPC) at <strong>ndpc.gov.ng</strong>.</P>
      </Section>

      <Section title="6. Cookies" id="cookies">
        <P>We use cookies and similar technologies to improve your experience. For full details on the cookies we use and how to manage them, see our <a href="/legal/cookie-policy" style={{ color: "#2E6417", fontWeight: 600 }}>Cookie Policy</a>.</P>
        <P>In summary, we use:</P>
        <Ul items={[
          "Essential cookies: Required for the platform to function (login sessions, cart)",
          "Analytics cookies: To understand how users navigate our platform (with consent)",
          "Marketing cookies: To show you relevant ads on third-party platforms (with consent)",
        ]} />
      </Section>

      <Section title="7. Data Retention" id="retention">
        <P>We retain your personal data for as long as necessary to provide our services and comply with legal obligations:</P>
        <Ul items={[
          "Account data: Retained for the duration of your account plus 3 years after deletion",
          "Transaction records: Retained for 6 years in compliance with Nigerian tax law (FIRS)",
          "Support communications: Retained for 2 years",
          "Marketing consent records: Retained for 5 years from last interaction",
        ]} />
        <P>When data is no longer needed, we securely delete or anonymise it.</P>
      </Section>

      <Section title="8. Security" id="security">
        <P>We take data security seriously and implement appropriate technical and organisational measures including:</P>
        <Ul items={[
          "SSL/TLS encryption for all data in transit",
          "Encrypted storage of sensitive data at rest",
          "Access controls limiting who can view personal data internally",
          "Regular security reviews and updates",
          "Paystack-managed payment processing (PCI DSS compliant)",
        ]} />
        <P>No system is completely secure. If you believe your account has been compromised, contact us immediately at <strong>security@zova.ng</strong>.</P>
      </Section>

      <Section title="9. Minors" id="minors">
        <P>ZOVA is not intended for use by persons under 18 years of age. We do not knowingly collect personal data from minors. If we become aware that we have collected data from a person under 18, we will delete it promptly.</P>
        <P>If you believe a minor has created an account on our platform, please contact us at <strong>legal@zova.ng</strong>.</P>
      </Section>

      <Section title="10. Changes to This Policy" id="changes">
        <P>We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by email and display a notice on our platform at least 14 days before the changes take effect.</P>
        <P>Continued use of our platform after the effective date of any changes constitutes your acceptance of the revised policy.</P>
      </Section>

      <Section title="11. Contact Us" id="contact">
        <P>For any privacy-related questions, requests, or complaints:</P>
        <Ul items={[
          "Email: legal@zova.ng",
          "WhatsApp: Available on our Contact page",
          "Post: ZOVA Limited, Onitsha Main Market, Anambra State, Nigeria",
          "Data Protection Officer: dpo@zova.ng",
        ]} />
        <InfoBox icon="⏱️">We aim to respond to all data-related requests within 30 days. For urgent matters involving account security, please contact us via WhatsApp for a faster response.</InfoBox>
      </Section>

    </LegalPageContainer>
  );
}
