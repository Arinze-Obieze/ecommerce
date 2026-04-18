"use client";
import { LegalPageContainer, Section, P, Ul, InfoBox } from "../LegalComponents";

const TOC = [
  { id: "agreement",       label: "1. The Agreement" },
  { id: "eligibility",     label: "2. Eligibility" },
  { id: "accounts",        label: "3. Your Account" },
  { id: "buying",          label: "4. Buying on ZOVA" },
  { id: "selling",         label: "5. Selling on ZOVA" },
  { id: "payments",        label: "6. Payments & Fees" },
  { id: "qc",              label: "7. Quality Control" },
  { id: "returns",         label: "8. Returns & Refunds" },
  { id: "prohibited",      label: "9. Prohibited Items" },
  { id: "ip",              label: "10. Intellectual Property" },
  { id: "liability",       label: "11. Limitation of Liability" },
  { id: "termination",     label: "12. Termination" },
  { id: "disputes",        label: "13. Disputes" },
  { id: "general",         label: "14. General" },
];

export default function TermsPage() {
  return (
    <LegalPageContainer
      title="Terms & Conditions"
      icon="📋"
      subtitle="These terms govern your use of the ZOVA platform, whether you are a buyer or seller. Please read them carefully before using our services."
      lastUpdated="March 2026"
      tocItems={TOC}
    >

      <InfoBox icon="📌">
        By creating an account or placing an order on ZOVA, you agree to these Terms and Conditions. If you do not agree, please do not use our platform.
      </InfoBox>

      <Section title="1. The Agreement" id="agreement">
        <P>These Terms and Conditions (&quot;Terms&quot;) form a legally binding agreement between you (&quot;User&quot;, &quot;Buyer&quot;, or &quot;Seller&quot;) and ZOVA Limited (&quot;ZOVA&quot;, &quot;we&quot;, &quot;us&quot;), a company registered in Nigeria and operating the marketplace platform at www.zova.ng.</P>
        <P>These Terms are governed by the laws of the Federal Republic of Nigeria, including the Companies and Allied Matters Act (CAMA) 2020, the Federal Competition and Consumer Protection Act 2018, and other applicable Nigerian legislation.</P>
        <P>We may update these Terms from time to time. We will give you at least 14 days notice of material changes. Continued use after the effective date constitutes acceptance.</P>
      </Section>

      <Section title="2. Eligibility" id="eligibility">
        <P>To use ZOVA, you must:</P>
        <Ul items={[
          "Be at least 18 years of age",
          "Be a resident of Nigeria or able to receive deliveries in Nigeria",
          "Have a valid Nigerian phone number and email address",
          "Not have been previously banned from ZOVA for violations",
          "Have the legal capacity to enter into a binding agreement",
        ]} />
        <P>By creating an account, you confirm that you meet all eligibility requirements.</P>
      </Section>

      <Section title="3. Your Account" id="accounts">
        <P>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at <strong>security@zova.ng</strong> if you suspect unauthorised access to your account.</P>
        <P>You agree not to share your account, create multiple accounts, or use another person&apos;s account without permission. Each seller and buyer must have their own individual account.</P>
        <P>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or harm other users of the platform.</P>
      </Section>

      <Section title="4. Buying on ZOVA" id="buying">
        <P><strong>Order placement:</strong> When you place an order, you are making a binding offer to purchase the item at the listed price. Your order is confirmed when you receive a confirmation SMS and email.</P>
        <P><strong>Quality guarantee:</strong> Every item on ZOVA passes through our physical quality control hub before shipping. If an item does not match its listing, you are entitled to a full refund.</P>
        <P><strong>Return window:</strong> You have 7 calendar days from delivery to initiate a return for eligible reasons. See Section 8 for full return terms.</P>
        <Ul items={[
          "All prices are displayed in Nigerian Naira (NGN)",
          "Prices include VAT where applicable",
          "Delivery fees are shown at checkout",
          "We reserve the right to cancel orders where pricing errors occur",
        ]} />
      </Section>

      <Section title="5. Selling on ZOVA" id="selling">
        <P>To sell on ZOVA, you must complete our seller onboarding process and agree to the separate <strong>ZOVA Marketplace Seller Agreement</strong>, which forms part of these Terms.</P>
        <P><strong>Key seller obligations include:</strong></P>
        <Ul items={[
          "Confirm stock availability within 2 hours of receiving an order notification",
          "Deliver items to the ZOVA hub within 24 hours of stock confirmation",
          "Ensure all items match their listing photos and descriptions exactly",
          "Use ZOVA&apos;s standardised hanger sizing system for all listings",
          "Maintain accurate inventory to prevent overselling",
          "Comply with all Nigerian laws including tax obligations to FIRS",
        ]} />
        <InfoBox icon="⚠️">Sellers who accumulate 3 seller-fault returns, 2 counterfeit item reports, or a customer complaint rate above 15% are subject to account review and suspension.</InfoBox>
      </Section>

      <Section title="6. Payments & Fees" id="payments">
        <P><strong>Buyer payments:</strong> All payments are processed securely through Paystack. A 1.5% payment processing fee applies to all transactions. Funds are held in escrow until the item passes our QC inspection.</P>
        <P><strong>Seller fees:</strong></P>
        <Ul items={[
          "Commission: 10% of gross sale price, earned at the time of sale",
          "Monthly subscription: NGN 5,000 per calendar month, due on the 1st",
          "Premium placement (optional): NGN 5,000 per week",
          "Photography service (optional): NGN 500 per product",
          "Payment processing fee: 1.5% passed through from Paystack",
        ]} />
        <P><strong>Seller payouts:</strong> Sellers are paid the same day their item passes QC at our hub via bank transfer to their registered account. Minimum withdrawal is NGN 1,000. We do not make cash payments.</P>
      </Section>

      <Section title="7. Quality Control" id="qc">
        <P>ZOVA operates a physical quality control hub in Onitsha. All items sold on the platform must pass our QC inspection before they are shipped to buyers.</P>
        <P><strong>QC checklist includes:</strong></P>
        <Ul items={[
          "Item matches listing photos taken at submission",
          "Correct size as indicated by the standardised hanger designation",
          "No defects, stains, tears, or damage not disclosed in the listing",
          "Tags and labels intact and accurately representing the item",
          "Item is clean and properly presented",
        ]} />
        <P>If an item fails QC, the order is cancelled, the buyer receives a full refund, and the seller is notified. Repeated QC failures may result in account suspension. ZOVA&apos;s QC decisions made in good faith are final.</P>
      </Section>

      <Section title="8. Returns & Refunds" id="returns">
        <P>ZOVA operates a structured returns system. The cost allocation for returns depends on the cause:</P>
        <Ul items={[
          "Seller-fault returns (wrong item, defective, misdescribed): Full refund to buyer. Seller bears return shipping cost. ZOVA retains commission.",
          "Customer-fault returns (changed mind, buyer remorse): 80-85% refund. Buyer pays return shipping and 15-20% restocking fee.",
          "Size exchange (item fits description but not the customer): NGN 1,000 return fee by customer. ZOVA ships new size free.",
          "ZOVA-fault returns (QC miss, hub damage, lost package): Full refund to buyer plus compensation. Seller keeps their payment.",
        ]} />
        <P>The 7-day return window begins on the date of delivery. Items returned after this window will not be accepted except where required by Nigerian consumer protection law.</P>
        <P>For the full return policy, see our <a href="/return-policy" style={{ color: "#00B86B", fontWeight: 600 }}>Returns &amp; Refund Policy page</a>.</P>
      </Section>

      <Section title="9. Prohibited Items" id="prohibited">
        <P>The following items are strictly prohibited on ZOVA:</P>
        <Ul items={[
          "Counterfeit, fake, or replica branded goods",
          "Stolen items or items obtained through illegal means",
          "Used undergarments (new, sealed items are permitted)",
          "Items containing offensive, hateful, or illegal imagery",
          "Damaged or defective items without full disclosure",
          "Any item whose sale violates Nigerian law",
          "Items prohibited under the Consumer Protection Framework",
        ]} />
        <P>Listing or attempting to sell prohibited items may result in immediate account termination, forfeiture of funds, and referral to law enforcement authorities.</P>
      </Section>

      <Section title="10. Intellectual Property" id="ip">
        <P>ZOVA and all its content, branding, technology, and platform design are the intellectual property of ZOVA Limited. You may not copy, reproduce, or use any ZOVA materials without prior written consent.</P>
        <P>By uploading product photos or content to ZOVA, sellers grant ZOVA a non-exclusive, royalty-free licence to use those images for marketing, platform operations, and quality control purposes.</P>
        <P>Sellers warrant that they own or have the right to use all content they upload. For full IP provisions, see our <a href="/legal/ip-notice" style={{ color: "#00B86B", fontWeight: 600 }}>IP Notice</a>.</P>
      </Section>

      <Section title="11. Limitation of Liability" id="liability">
        <P>ZOVA operates as a marketplace platform facilitating transactions between buyers and sellers. We are not a party to the underlying sale agreement between buyer and seller.</P>
        <P>To the maximum extent permitted by Nigerian law:</P>
        <Ul items={[
          "ZOVA&apos;s total liability to any seller is limited to the amount of any payment withheld by ZOVA",
          "ZOVA is not liable for indirect, consequential, or loss-of-profit damages",
          "ZOVA is not liable for the actions, representations, or products of sellers",
          "ZOVA is not liable for platform downtime, technical failures, or third-party service interruptions",
        ]} />
        <P>Nothing in these Terms limits liability for fraud, gross negligence, or any liability that cannot be excluded under Nigerian law.</P>
      </Section>

      <Section title="12. Termination" id="termination">
        <P>Either party may terminate their use of the platform with 30 days written notice. ZOVA may terminate your account immediately and without notice for:</P>
        <Ul items={[
          "Repeated or serious violations of these Terms",
          "Fraudulent activity or attempted fraud",
          "Sale of prohibited or counterfeit items",
          "Non-payment of seller subscription fees (after 5-day grace period)",
          "Behaviour that harms other users or ZOVA&apos;s reputation",
        ]} />
        <P>Upon termination, all pending orders must be fulfilled. Any outstanding payments owed to a seller will be settled within 14 business days after the termination date, subject to the resolution of any outstanding disputes.</P>
      </Section>

      <Section title="13. Dispute Resolution" id="disputes">
        <P>In the event of a dispute between ZOVA and a user, the parties agree to the following process:</P>
        <Ul items={[
          "Step 1 — Good faith negotiation: Contact support@zova.ng within 30 days of the dispute arising",
          "Step 2 — Mediation: If unresolved after 14 days, parties agree to attempt mediation",
          "Step 3 — Arbitration or litigation: If mediation fails, disputes shall be resolved in the courts of Anambra State, Nigeria",
        ]} />
        <P>These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. The language of all proceedings shall be English.</P>
      </Section>

      <Section title="14. General Provisions" id="general">
        <Ul items={[
          "Entire Agreement: These Terms, together with the Seller Agreement and other policies, constitute the entire agreement between ZOVA and users",
          "Severability: If any provision is found unenforceable, the remaining provisions continue in full force",
          "Assignment: Users may not assign their rights or obligations without ZOVA&apos;s written consent. ZOVA may assign its rights in connection with a merger or acquisition",
          "Force Majeure: ZOVA is not liable for delays caused by events beyond our reasonable control, including natural disasters, government actions, or infrastructure failures",
          "Notices: Legal notices to ZOVA should be sent to legal@zova.ng. We will send notices to the email address on your account",
          "Waiver: Failure to enforce any provision does not constitute a waiver of that right",
          "Electronic Signatures: Acceptance of these Terms via checkbox or electronic click constitutes a valid signature under Nigerian electronic transactions law",
        ]} />
      </Section>

    </LegalPageContainer>
  );
}
