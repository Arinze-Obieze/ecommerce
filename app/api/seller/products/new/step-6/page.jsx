// app/seller/products/new/step-6/page.jsx
"use client";
import React, { useState, useRef } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { getColorTw } from "@/lib/product-wizard-constants";
import { FiPrinter, FiCheck, FiChevronDown, FiClock, FiAlertTriangle } from "react-icons/fi";

function BarcodeVisual({ sku, label }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 text-center">
      {label && <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>}
      {/* Barcode bars */}
      <div className="flex items-end justify-center gap-[1px] h-12 mb-2">
        {(sku || "").split("").map((char, i) => (
          <div key={i} className="bg-gray-900 rounded-[0.5px]"
            style={{
              width: char === "-" ? 1 : (char.charCodeAt(0) % 3) + 1.5,
              height: `${60 + (char.charCodeAt(0) % 40)}%`,
            }} />
        ))}
      </div>
      <p className="text-xs font-mono text-gray-700 tracking-wide">{sku}</p>
    </div>
  );
}

export default function Step6Page() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [showSkipModal, setShowSkipModal] = useState(false);
  const printRef = useRef(null);

  const totalLabels = (() => {
    if (state.printType === "base") return state.printCopies;
    return state.variantSkus.length * state.printCopies;
  })();

  const handlePrint = () => {
    // Trigger browser print
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const barcodes = state.printType === "base"
      ? [{ sku: state.baseSku, label: state.productName }]
      : state.variantSkus.map((v) => ({ sku: v.sku, label: `${v.color} - ${v.size}` }));

    const labels = [];
    for (const bc of barcodes) {
      for (let c = 0; c < state.printCopies; c++) {
        labels.push(bc);
      }
    }

    printWindow.document.write(`
      <html><head><title>Barcode Labels</title>
      <style>
        body { font-family: monospace; margin: 0; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .label { border: 1px solid #ccc; padding: 16px; text-align: center; page-break-inside: avoid; }
        .label h4 { margin: 0 0 8px; font-size: 11px; color: #666; }
        .label .sku { font-size: 14px; font-weight: bold; letter-spacing: 2px; }
        .bars { display: flex; justify-content: center; gap: 1px; margin: 8px 0; height: 50px; align-items: flex-end; }
        .bar { background: #000; border-radius: 0.5px; }
        @media print { body { padding: 10px; } .grid { gap: 8px; } }
      </style></head><body>
      <div class="grid">
        ${labels.map((l) => `
          <div class="label">
            <h4>${l.label}</h4>
            <div class="bars">
              ${l.sku.split("").map((ch) =>
                `<div class="bar" style="width:${ch === "-" ? 1 : (ch.charCodeAt(0) % 3) + 2}px;height:${60 + (ch.charCodeAt(0) % 40)}%"></div>`
              ).join("")}
            </div>
            <div class="sku">${l.sku}</div>
          </div>
        `).join("")}
      </div>
      <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `);
    printWindow.document.close();

    // Mark as printed
    dispatch({
      type: "SET_PRINT_STATUS",
      payload: {
        printCompleted: true,
        printType: state.printType,
        printCopies: state.printCopies,
      },
    });
  };

  const handleNext = () => {
    if (!state.printCompleted) {
      setShowSkipModal(true);
      return;
    }
    goNext();
  };

  const confirmSkip = () => {
    dispatch({
      type: "SET_PRINT_STATUS",
      payload: { printCompleted: true, printType: state.printType, printCopies: 0 },
    });
    setShowSkipModal(false);
    goNext();
  };

  return (
    <WizardShell
      title="Print Barcodes"
      subtitle={`Print labels for ${state.variantSkus.length} variant${state.variantSkus.length !== 1 ? "s" : ""}`}
    >
      <div className="max-w-xl mx-auto">
        {/* ── Print Options ────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Print Type</label>
            <div className="relative">
              <select value={state.printType}
                onChange={(e) => dispatch({ type: "SET_PRINT_STATUS", payload: { printType: e.target.value } })}
                className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white text-sm font-medium appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]">
                <option value="all">All Variants ({state.variantSkus.length} labels)</option>
                <option value="base">Base Product Only (1 label)</option>
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Copies per Label</label>
            <input type="number" min={1} max={50} value={state.printCopies}
              onChange={(e) => dispatch({ type: "SET_PRINT_STATUS", payload: { printCopies: parseInt(e.target.value) || 1 } })}
              className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
          </div>
        </div>

        {/* ── Preview ──────────────────────────────────────────── */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 text-center mb-4 uppercase tracking-wide">Preview</p>
          <div className="space-y-3" ref={printRef}>
            {state.printType === "base" ? (
              <BarcodeVisual sku={state.baseSku} label={state.productName} />
            ) : (
              <>
                {state.variantSkus.slice(0, 3).map((v, i) => (
                  <BarcodeVisual key={i} sku={v.sku} label={`${v.color} – ${v.size}`} />
                ))}
                {state.variantSkus.length > 3 && (
                  <p className="text-xs text-gray-400 text-center font-medium">
                    + {state.variantSkus.length - 3} more variant{state.variantSkus.length - 3 !== 1 ? "s" : ""}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Print Button ─────────────────────────────────────── */}
        <button type="button" onClick={handlePrint}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                     bg-[#2E5C45] text-white font-bold text-sm
                     hover:bg-[#254a38] active:scale-[0.98]
                     shadow-[0_4px_14px_rgba(46,92,69,0.35)]
                     transition-all mb-4">
          <FiPrinter className="w-5 h-5" />
          Print {totalLabels} Label{totalLabels !== 1 ? "s" : ""}
        </button>

        {/* Print status */}
        {state.printCompleted && state.printCopies > 0 && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-2 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-full bg-[#2E5C45] flex items-center justify-center shrink-0">
              <FiCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Labels Ready</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {state.printType === "all" ? "All variants" : "Base product"} · {state.printCopies} cop{state.printCopies === 1 ? "y" : "ies"} each
              </p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <FiClock className="w-3 h-3" /> Attach labels to products, then proceed to verification.
              </p>
            </div>
          </div>
        )}
      </div>

      <WizardNav
        onBack={goBack}
        onNext={handleNext}
        nextLabel="Continue to Verify"
      />

      {/* Skip print modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <FiAlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Skip Printing?</h3>
              <p className="text-sm text-gray-500">
                Barcode labels help with inventory tracking. You can always print later from the product detail page.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowSkipModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm hover:bg-[#254a38] transition-colors">
                Go Back & Print
              </button>
              <button onClick={confirmSkip}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
