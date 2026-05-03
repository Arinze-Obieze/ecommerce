"use client";

export default function SettingsField({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="zova-account-label">{label}</label>
      {children}
      {hint ? <p className="m-0 text-[11px] text-(--zova-text-muted)">{hint}</p> : null}
    </div>
  );
}
