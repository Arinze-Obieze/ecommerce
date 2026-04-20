// components/product-wizard/WizardShell.jsx
"use client";
import React from "react";
import { useWizard } from "./WizardProvider";

export default function WizardShell({ title, subtitle, children }) {
  const {
    loading,
    draftStatus,
    draftUpdatedAt,
    draftStorageReady,
  } = useWizard();

  const savedTime = draftUpdatedAt
    ? new Date(draftUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const draftUi = (() => {
    if (!draftStorageReady) {
      return { text: "Draft saving unavailable", tone: "text-amber-600 bg-amber-50 border-amber-200" };
    }
    if (draftStatus === "saving") {
      return { text: `Last saved: ${savedTime} ● Saving…`, tone: "text-[#2E6417] bg-[#EDF5E6] border-[#B8D4A0]" };
    }
    if (draftStatus === "saved" && draftUpdatedAt) {
      return { text: `Last saved: ${savedTime} ✓`, tone: "text-[#2E6417] bg-[#EDF5E6] border-[#B8D4A0]" };
    }
    if (draftStatus === "error") {
      return { text: "Save failed. Retrying on next change.", tone: "text-red-600 bg-red-50 border-red-200" };
    }
    return { text: "Last saved: —", tone: "text-gray-500 bg-gray-50 border-gray-200" };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#E8E4DC] border-t-[#2E6417] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading store…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
      <div className="border-b border-[#E8E4DC]/60 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{subtitle}</p>}
          </div>
          <div className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${draftUi.tone}`}>
            {draftUi.text}
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        {children}
      </div>
    </div>
  );
}
