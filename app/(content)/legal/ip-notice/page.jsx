"use client";
import { LegalPageContainer, Section, P, Ul, InfoBox } from "../LegalComponents";

const TOC = [
  { id: "zova-ip",         label: "1. ZOVA Intellectual Property" },
  { id: "seller-content",  label: "2. Seller Content & Licence" },
  { id: "trademarks",      label: "3. Trademarks" },
  { id: "counterfeit",     label: "4. Counterfeit & Fake Goods" },
  { id: "infringement",    label: "5. Reporting Infringement" },
  { id: "dmca-equivalent", label: "6. Takedown Process" },
  { id: "repeat",          label: "7. Repeat Infringers" },
  { id: "contact",         label: "8. Contact" },
];

export default function IPNoticePage() {
  return (
    <LegalPageContainer
      title="IP Notice"
      icon="⚖️"
      subtitle="ZOVA respects intellectual property rights and expects all users to do the same. This notice explains how we handle IP on our platform."
      lastUpdated="March 2026"
      tocItems={TOC}
    >

      <InfoBox icon="🛡️">
        ZOVA takes intellectual property seriously. We remove infringing listings promptly and cooperate fully with brand owners, rights holders, and Nigerian law enforcement.
      </InfoBox>

      <Section title="1. ZOVA Intellectual Property" id="zova-ip">
        <P>All content, design, technology, branding, and materials on the ZOVA platform are the exclusive intellectual property of ZOVA Limited (&quot;ZOVA&quot;), protected under the laws of the Federal Republic of Nigeria including the Copyright Act (Cap C28, LFN 2004) and the Trademarks Act (Cap T13, LFN 2004).</P>
        <P><strong>The following are owned exclusively by ZOVA:</strong></P>
        <Ul items={[
          "The ZOVA name, logo, wordmark, and all brand assets",
          "The platform&apos;s design, layout, user interface, and user experience",
          "Our proprietary quality control system and standardised hanger sizing methodology",
          "All software, algorithms, and technology powering the platform",
          "Marketing materials, campaign content, and photography produced by ZOVA",
          "The domain names zova.ng and all associated subdomains",
        ]} />
        <P>You may not copy, reproduce, distribute, modify, or create derivative works from any ZOVA intellectual property without prior written consent from ZOVA Limited.</P>
      </Section>

      <Section title="2. Seller Content & Licence" id="seller-content">
        <P>When sellers upload product photos, descriptions, measurements, and other content to ZOVA (&quot;Seller Content&quot;), they retain ownership of that content. However, by submitting content, sellers grant ZOVA a:</P>
        <Ul items={[
          "Non-exclusive licence to use, display, reproduce, and distribute the content on the ZOVA platform",
          "Right to use the content in ZOVA marketing materials, social media, and advertisements",
          "Right to use QC photographs taken by ZOVA of a seller&apos;s items for quality assurance and dispute resolution purposes",
          "Right to remove, moderate, or modify content that violates our policies",
        ]} />
        <P>Sellers warrant that they own or have the right to use all content they upload, and that such content does not infringe the intellectual property rights of any third party.</P>
        <P>Sellers indemnify ZOVA against any claims, costs, or liabilities arising from third-party IP infringement claims relating to their uploaded content.</P>
      </Section>

      <Section title="3. Trademarks" id="trademarks">
        <P>The ZOVA name and logo are registered or pending trademarks of ZOVA Limited in Nigeria. You may not use our trademarks, trade names, or brand elements without our written permission, including:</P>
        <Ul items={[
          "Using &apos;ZOVA&apos; or our logo in your own business name, domain, or social media handle",
          "Creating merchandise, marketing materials, or content that mimics or appropriates our brand identity",
          "Registering domain names or social media accounts that include our trademark",
          "Implying a partnership, endorsement, or affiliation with ZOVA without our written consent",
        ]} />
        <P>All third-party brand names, logos, and trademarks referenced on our platform (e.g., Paystack, Meta, Google) are the property of their respective owners and are used for identification purposes only.</P>
      </Section>

      <Section title="4. Counterfeit & Fake Goods" id="counterfeit">
        <P>ZOVA has a strict zero-tolerance policy for counterfeit, replica, and fake branded goods. The sale of counterfeit items is illegal under Nigerian law and undermines the trust and integrity of our marketplace.</P>
        <P><strong>What counts as counterfeit on ZOVA:</strong></P>
        <Ul items={[
          "Items bearing the trademark of a brand that are not authentic products of that brand",
          "Items sold as &apos;inspired by&apos; a brand but bearing that brand&apos;s actual trademark",
          "Items with fake or forged brand tags, labels, or authenticity certificates",
          "Items that falsely represent their origin, manufacturer, or quality",
        ]} />
        <P><strong>Consequences for listing counterfeit goods:</strong></P>
        <Ul items={[
          "Immediate removal of the listing",
          "Immediate account suspension pending investigation",
          "Permanent ban from the platform upon confirmation",
          "Forfeiture of all pending payments",
          "Referral to the Nigeria Customs Service, NAFDAC, or Nigerian Police Force as appropriate",
          "Civil claim for damages where ZOVA suffers loss as a result",
        ]} />
        <InfoBox icon="⚠️">Every item on ZOVA is photographed during QC. If a counterfeit item is discovered after a sale, we have documented evidence to support enforcement action against the seller.</InfoBox>
      </Section>

      <Section title="5. Reporting Infringement" id="infringement">
        <P>If you are a brand owner, rights holder, or their authorised representative and believe that content on ZOVA infringes your intellectual property rights, please submit an infringement notice to us.</P>
        <P><strong>Your notice must include:</strong></P>
        <Ul items={[
          "Your full name, company name, and contact details",
          "A description of the intellectual property right you claim is being infringed",
          "The specific URL(s) of the infringing listing(s) on ZOVA",
          "Evidence of your ownership of the right (trademark registration, copyright certificate, etc.)",
          "A statement that you have a good faith belief the use is not authorised by the rights owner, its agent, or the law",
          "A statement under penalty of perjury that the information provided is accurate and you are authorised to act on behalf of the rights holder",
          "Your physical or electronic signature",
        ]} />
        <P>Send your notice to: <a href="mailto:ip@zova.ng" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>ip@zova.ng</a></P>
        <P>We will acknowledge receipt within 2 business days and aim to act on valid notices within 5 business days.</P>
      </Section>

      <Section title="6. Takedown Process" id="dmca-equivalent">
        <P>Upon receiving a valid infringement notice, ZOVA will:</P>
        <Ul items={[
          "Remove or disable access to the allegedly infringing content",
          "Notify the seller whose content has been removed",
          "Provide the seller with the opportunity to submit a counter-notice if they believe the removal was in error",
        ]} />
        <P><strong>Counter-notices:</strong> If a seller believes their content was removed by mistake, they may submit a counter-notice to <a href="mailto:ip@zova.ng" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>ip@zova.ng</a> including their contact details, identification of the removed content, a statement under penalty of perjury that the removal was a mistake, and their consent to jurisdiction of the relevant Nigerian court.</P>
        <P>If a valid counter-notice is received, ZOVA may restore the content after 14 business days unless the original complainant initiates legal proceedings.</P>
        <P><strong>False notices:</strong> Submitting a false infringement notice or counter-notice is a serious matter. ZOVA reserves the right to pursue legal action against any person who knowingly submits false IP claims.</P>
      </Section>

      <Section title="7. Repeat Infringers" id="repeat">
        <P>ZOVA operates a repeat infringer policy. Sellers who receive two or more substantiated infringement notices will have their accounts permanently terminated. We do not restore accounts terminated under this policy.</P>
        <P>A substantiated notice is one where the seller did not successfully challenge the notice via the counter-notice process described above, or where a court has found infringement.</P>
      </Section>

      <Section title="8. Contact" id="contact">
        <P>For all intellectual property matters, contact our IP team:</P>
        <Ul items={[
          "Email: ip@zova.ng",
          "General legal: legal@zova.ng",
          "Post: ZOVA Limited, Onitsha Main Market, Anambra State, Nigeria",
        ]} />
        <P>For urgent matters such as large-scale counterfeiting operations, please email <a href="mailto:ip@zova.ng" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>ip@zova.ng</a> and mark your email as URGENT.</P>
      </Section>

    </LegalPageContainer>
  );
}
