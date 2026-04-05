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
        {children}
      </div>

      {pendingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Resume Saved Draft?</h3>
            <p className="text-sm text-gray-500 mb-5">
              We found an unfinished product draft for this store. You can continue where you left off or start fresh.
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-gray-50 rounded-xl p-3 border border-[#dbe7e0]">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Saved Step</p>
                <p className="text-sm font-bold text-gray-900">{pendingDraft.currentStep || 1}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-[#dbe7e0]">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Product</p>
                <p className="text-sm font-bold text-gray-900 truncate">{pendingDraft.state?.productName || "Untitled draft"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={discardPendingDraft}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200"
              >
                Start Fresh
              </button>
              <button
                type="button"
                onClick={() => applyDraft(pendingDraft)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm hover:bg-[#254a38]"
              >
                Resume Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
