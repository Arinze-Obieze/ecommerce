// components/product-wizard/WizardShell.jsx
"use client";
import React from "react";
import { useWizard } from "./WizardProvider";

export default function WizardShell({ title, subtitle, children }) {
  const {
    storeContext,
    loading,
    draftStatus,
    draftUpdatedAt,
    draftStorageReady,
    pendingDraft,
    applyDraft,
    discardPendingDraft,
  } = useWizard();

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
        <div className="mt-2 text-xs text-gray-400">
          {!draftStorageReady ? (
            <span>Draft saving unavailable until the draft storage migration is applied.</span>
          ) : draftStatus === "saving" ? (
            <span>Saving draft…</span>
          ) : draftStatus === "saved" && draftUpdatedAt ? (
            <span>Draft saved.</span>
          ) : draftStatus === "error" ? (
            <span>Draft save failed. We’ll retry on the next change.</span>
          ) : (
            <span>Drafts autosave while you work.</span>
          )}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {pendingDraft ? (
          <div className="mb-5 rounded-2xl border border-[#cfe1d7] bg-gradient-to-r from-[#f4fbf7] via-white to-[#eef7f1] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2E5C45]">Saved draft found</p>
                <h3 className="mt-1 text-base font-bold text-gray-900">Resume this product before starting from scratch.</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {pendingDraft.state?.productName || "Untitled draft"} on step {pendingDraft.currentStep || 1}
                </p>
                {pendingDraft.updatedAt ? (
                  <p className="mt-1 text-xs text-gray-400">Last updated {new Date(pendingDraft.updatedAt).toLocaleString()}</p>
                ) : null}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={discardPendingDraft}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200"
                >
                  Start Fresh
                </button>
                <button
                  type="button"
                  onClick={() => applyDraft(pendingDraft)}
                  className="px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm hover:bg-[#254a38]"
                >
                  Resume Draft
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
