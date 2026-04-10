// app/store/dashboard/products/new/step-6/page.js
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";

function Barcode({ sku, label }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      {label && <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>}
      <div className="flex items-end justify-center gap-[1px] h-10 mb-1.5">
        {(sku || "").split("").map((ch, i) => (
          <div key={i} className="bg-gray-900 rounded-[0.5px]"
            style={{ width: ch === "-" ? 1 : (ch.charCodeAt(0) % 3) + 1.5, height: `${55 + (ch.charCodeAt(0) % 40)}%` }} />
        ))}
      </div>
      <p className="text-[11px] font-mono text-gray-700 tracking-wide">{sku}</p>
    </div>
  );
}

export default function LegacyStep7Redirect() {
  redirect("/store/dashboard/products/new/step-6");
}
