"use client";
import Link from "next/link";
import { B } from "./layout";
import { LegalPageContainer, P, InfoBox } from "./LegalComponents";
import { LuShield, LuCookie, LuFileText, LuScale, LuMegaphone, LuInfo } from "react-icons/lu";

const LEGAL_DOCS = [
  { 
    title: "Privacy Policy", 
    href: "/legal/privacy-policy", 
    icon: <LuShield />, 
    desc: "How we collect, use, and protect your personal data in compliance with NDPA 2023." 
  },
  { 
    title: "Cookie Policy", 
    href: "/legal/cookie-policy", 
    icon: <LuCookie />, 
    desc: "Information about the cookies we use and how you can manage your preferences." 
  },
  { 
    title: "Terms & Conditions", 
    href: "/legal/terms-and-conditions", 
    icon: <LuFileText />, 
    desc: "The rules, requirements, and legal agreement for using the ZOVA platform." 
  },
  { 
    title: "IP Notice", 
    href: "/legal/ip-notice", 
    icon: <LuScale />, 
    desc: "Our policies regarding intellectual property, trademarks, and counterfeit goods." 
  },
  { 
    title: "Ad Choice", 
    href: "/legal/ad-choice", 
    icon: <LuMegaphone />, 
    desc: "Your rights and choices regarding personalised advertising on and off ZOVA." 
  },
];

export default function LegalLandingPage() {
  return (
    <LegalPageContainer
      title="Legal Framework"
      icon={<LuScale />}
      subtitle="Transparency and trust are at the core of ZOVA. Here you'll find all our legal documents, policies, and your protections as a user."
      lastUpdated="March 2026"
      tocItems={[
        { id: "overview", label: "Overview" },
        { id: "documents", label: "Legal Documents" },
        { id: "compliance", label: "Compliance Statement" },
      ]}
    >
      <section id="overview" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: B.charcoal, marginBottom: 16 }}>Welcome to the ZOVA Legal Centre</h2>
        <P>At ZOVA, we believe in being clear and upfront about how we operate. Our legal framework is designed to protect both our buyers and sellers, while ensuring compliance with Nigerian and international standards.</P>
        <P>Below you will find the modular policies that govern different aspects of our platform. We recommend that you familiarise yourself with the Terms and Conditions and our Privacy Policy before using ZOVA.</P>
        <InfoBox icon={<LuInfo />}>
          All our policies are governed by the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act (NDPA) 2023 and the Federal Competition and Consumer Protection Act (FCCPA).
        </InfoBox>
      </section>

      <section id="documents" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: B.charcoal, marginBottom: 24 }}>Legal Documents</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {LEGAL_DOCS.map((doc) => (
            <Link 
              key={doc.href} 
              href={doc.href}
              style={{ 
                textDecoration: "none", 
                background: B.surface, 
                border: `1px solid ${B.border}`, 
                borderRadius: 8, 
                padding: 24,
                transition: "all 0.2s cubic-bezier(0.19, 1, 0.22, 1)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = B.borderDark;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = B.border;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 6, background: B.hoverBg, border: `1px solid ${B.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {doc.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: B.charcoal, marginBottom: 8, marginTop: 0 }}>{doc.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: B.textSubtle, lineHeight: 1.5 }}>{doc.desc}</p>
              </div>
              <div style={{ marginTop: "auto", fontSize: 13, fontWeight: 600, color: B.green, display: "flex", alignItems: "center", gap: 6 }}>
                Read Document <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="compliance">
        <h2 style={{ fontSize: 20, fontWeight: 600, color: B.charcoal, marginBottom: 16 }}>Compliance Statement</h2>
        <P>ZOVA Limited is a registered entity in Nigeria. We are committed to ethical business practices and full regulatory compliance. This includes:</P>
        <ul style={{ fontSize: 15, color: B.charcoal, lineHeight: 1.6, marginBottom: 20, paddingLeft: 0, listStyle: "none" }}>
          {["Compliance with Nigeria Data Protection Commission (NDPC) guidelines", 
            "Strict adherence to Anti-Money Laundering (AML) and Know Your Customer (KYC) requirements",
            "Consumer protection in line with FCCPC standards (including standard return rights)",
            "Protection of Intellectual Property rights for brand owners"].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <span style={{ color: B.green, fontWeight: "bold", fontSize: 14, marginTop: 2 }}>•</span>
                <span>{item}</span>
              </li>
          ))}
        </ul>
        <P>For any legal enquiries, please contact our legal department at <a href="mailto:legal@zova.ng" style={{ color: B.green, fontWeight: 600, textDecoration: "none" }}>legal@zova.ng</a>.</P>
      </section>
    </LegalPageContainer>
  );
}
