"use client";

import { FiShield } from "react-icons/fi";

export default function FooterPayments({ icons }) {
  return (
    <div className="zova-footer-payment-column col-span-1">
      <p className="zova-footer-heading">We Accept</p>
      <div className="zova-footer-payment-row mt-1 flex flex-wrap gap-2">
        {icons.map((Icon, index) => (
          <div key={index} className="zova-footer-payment">
            <Icon className="text-xl" />
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[var(--zova-text-body)] sm:justify-start">
        <FiShield className="h-3.5 w-3.5 text-[var(--zova-primary-action)]" />
        Secure payment processing
      </p>
    </div>
  );
}
