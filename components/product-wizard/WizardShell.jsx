// components/product-wizard/WizardShell.jsx
"use client";
import React from "react";
import { useWizard } from "./WizardProvider";

export default function WizardShell({ title, subtitle, children }) {
  const { storeContext, loading } = useWizard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#dbe7e0] border-t-[#2E5C45] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading store…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dbe7e0] bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#dbe7e0]/60">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {children}
      </div>
    </div>
  );
}
