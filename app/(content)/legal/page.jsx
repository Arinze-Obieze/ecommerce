"use client";
import Link from "next/link";
import { B } from "./layout";
import { LegalPageContainer, P, InfoBox } from "./LegalComponents";

const LEGAL_DOCS = [
  { 
    title: "Privacy Policy", 
    href: "/legal/privacy-policy", 
    icon: "🔒", 
    desc: "How we collect, use, and protect your personal data in compliance with NDPR." 
  },
  { 
    title: "Cookie Policy", 
    href: "/legal/cookie-policy", 
    icon: "🍪", 
    desc: "Information about the cookies we use and how you can manage your preferences." 
  },
  { 
    title: "Terms & Conditions", 
    href: "/legal/terms-and-conditions", 
    icon: "📜", 
    desc: "The rules, requirements, and legal agreement for using the ZOVA platform." 
  },
  { 
    title: "IP Notice", 
    href: "/legal/ip-notice", 
    icon: "⚖️", 
    desc: "Our policies regarding intellectual property, trademarks, and counterfeit goods." 
  },
  { 
    title: "Ad Choice", 
    href: "/legal/ad-choice", 
    icon: "📢", 
    desc: "Your rights and choices regarding personalised advertising on and off ZOVA." 
  },
];

export default function LegalLandingPage() {
  return (
    <LegalPageContainer
      title="Legal Framework"
      icon="⚖️"
      subtitle="Transparency and trust are at the core of ZOVA. Here you'll find all our legal documents, policies, and your rights as a user."
      lastUpdated="March 2026"
      tocItems={[
        { id: "overview", label: "Overview" },
        { id: "documents", label: "Legal Documents" },
        { id: "compliance", label: "Compliance Statement" },
      ]}
    >
      <section id="overview" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.charcoal, marginBottom: 16 }}>Welcome to the ZOVA Legal Centre</h2>
        <P>At ZOVA, we believe in being clear and upfront about how we operate. Our legal framework is designed to protect both our buyers and sellers, while ensuring compliance with Nigerian and international standards.</P>
        <P>Below you will find the modular policies that govern different aspects of our platform. We recommend that you familiarise yourself with the Terms and Conditions and our Privacy Policy before using ZOVA.</P>
        <InfoBox icon="🇳🇬">
          All our policies are governed by the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act 2023 and the Federal Competition and Consumer Protection Act.
        </InfoBox>
      </section>

      <section id="documents" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.charcoal, marginBottom: 24 }}>Legal Documents</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {LEGAL_DOCS.map((doc) => (
            <Link 
              key={doc.href} 
              href={doc.href}
              style={{ 
                textDecoration: "none", 
                background: B.white, 
                border: `1px solid ${B.greenBorder}`, 
                borderRadius: 16, 
                padding: 24,
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = B.green;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(46,100,23,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = B.greenBorder;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: B.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {doc.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: B.charcoal, marginBottom: 4 }}>{doc.title}</h3>
                <p style={{ fontSize: 13, color: B.g600, lineHeight: 1.5 }}>{doc.desc}</p>
              </div>
              <div style={{ marginTop: "auto", fontSize: 12, fontWeight: 700, color: B.green, display: "flex", alignItems: "center", gap: 4 }}>
                Read Document <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="compliance">
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.charcoal, marginBottom: 16 }}>Compliance Statement</h2>
        <P>ZOVA Limited is a registered entity in Nigeria. We are committed to ethical business practices and full regulatory compliance. This includes:</P>
        <ul style={{ fontSize: 14, color: B.g600, lineHeight: 1.8, marginBottom: 20, paddingLeft: 20 }}>
          <li>Compliance with Nigeria Data Protection Commission (NDPC) regulations</li>
          <li>Strict adherence to Anti-Money Laundering (AML) and Know Your Customer (KYC) requirements</li>
          <li>Consumer protection in line with FCCPC standards</li>
          <li>Protection of Intellectual Property rights for brand owners</li>
        </ul>
        <P>For any legal enquiries, please contact our legal department at <strong>legal@zova.ng</strong>.</P>
      </section>
    </LegalPageContainer>
  );
}
