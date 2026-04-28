"use client";

export default function FooterTrustBar({ items }) {
  return (
    <div className="zova-footer-trust">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-4">
          {items.map(({ Icon, icon, text }) => (
            <div key={text} className="zova-footer-trust-item sm:justify-start sm:text-left">
              <span className="zova-footer-trust-icon text-sm">
                {Icon ? <Icon className="h-4 w-4" /> : icon}
              </span>
              <span className="text-center text-xs font-bold text-[var(--zova-primary-action)] sm:text-left">
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
