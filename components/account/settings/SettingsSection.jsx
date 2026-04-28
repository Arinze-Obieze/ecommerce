"use client";

export default function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section className="zova-account-section-card">
      <div className="zova-account-section-head">
        <div className="zova-account-section-icon">
          <Icon size={16} />
        </div>
        <h3 className="m-0 text-[15px] font-extrabold tracking-[-0.015em] text-[var(--zova-text-strong)]">
          {title}
        </h3>
      </div>
      <div className="zova-account-section-body">{children}</div>
    </section>
  );
}
