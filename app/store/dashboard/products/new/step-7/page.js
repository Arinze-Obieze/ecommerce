// app/store/dashboard/products/new/step-7/page.js
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

export default function Step6() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [showSkip, setShowSkip] = useState(false);

  const hasVariants = state.variantSkus.length > 0;
  const effectivePrintType = hasVariants ? state.printType : "base";
  const total = effectivePrintType === "base" ? Math.max(state.printCopies, 1) : state.variantSkus.length * Math.max(state.printCopies, 1);

  const doPrint = () => {
    const barcodes = effectivePrintType === "base"
      ? [{ sku: state.baseSku, label: state.productName }]
      : state.variantSkus.map(v => ({ sku: v.sku, label: `${v.color} – ${v.size}` }));
    const labels = [];
    for (const bc of barcodes) for (let c = 0; c < state.printCopies; c++) labels.push(bc);

    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`<html><head><title>Barcodes</title><style>
      body{font-family:monospace;margin:0;padding:16px}
      .g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .l{border:1px solid #ccc;padding:14px;text-align:center;page-break-inside:avoid}
      .l h4{margin:0 0 6px;font-size:10px;color:#666}
      .l .s{font-size:13px;font-weight:bold;letter-spacing:1.5px}
      .b{display:flex;justify-content:center;gap:1px;margin:6px 0;height:45px;align-items:flex-end}
      .br{background:#000;border-radius:.5px}
      @media print{body{padding:8px}.g{gap:6px}}
    </style></head><body><div class="g">${labels.map(l => `<div class="l"><h4>${l.label}</h4><div class="b">${
      l.sku.split("").map(ch => `<div class="br" style="width:${ch === "-" ? 1 : (ch.charCodeAt(0) % 3) + 2}px;height:${55 + (ch.charCodeAt(0) % 40)}%"></div>`).join("")
    }</div><div class="s">${l.sku}</div></div>`).join("")}</div><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
    dispatch({ type: "SET_PRINT_STATUS", payload: { printCompleted: true, printType: state.printType, printCopies: state.printCopies } });
  };

  const handleNext = () => {
    if (!state.printCompleted) { setShowSkip(true); return; }
    goNext();
  };

  return (
    <WizardShell title="Print Barcodes" subtitle={`Print labels for ${state.variantSkus.length} variant${state.variantSkus.length !== 1 ? "s" : ""}`}>
      <div className="max-w-lg mx-auto">
        {/* Options */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Print Type</label>
            <select value={effectivePrintType} onChange={e => dispatch({ type: "SET_PRINT_STATUS", payload: { printType: e.target.value } })}
              disabled={!hasVariants}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm disabled:opacity-60">
              {hasVariants && <option value="all">All Variants ({state.variantSkus.length})</option>}
              <option value="base">Base Product Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Copies per Label</label>
            <input type="number" min={1} max={50} value={state.printCopies}
              onChange={e => dispatch({ type: "SET_PRINT_STATUS", payload: { printCopies: parseInt(e.target.value) || 1 } })}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm" />
          </div>
        </div>

        {/* Preview */}
        <div className="border-2 border-dashed border-[#dbe7e0] rounded-2xl p-4 mb-5">
          <p className="text-[10px] font-semibold text-gray-400 text-center mb-3 uppercase tracking-wide">Preview</p>
          <div className="space-y-2.5">
            {effectivePrintType === "base"
              ? <Barcode sku={state.baseSku} label={state.productName} />
              : <>
                  {state.variantSkus.slice(0, 3).map((v, i) => <Barcode key={i} sku={v.sku} label={`${v.color} – ${v.size}`} />)}
                  {state.variantSkus.length > 3 && <p className="text-xs text-gray-400 text-center">+ {state.variantSkus.length - 3} more</p>}
                </>
            }
          </div>
        </div>

        {/* Print button */}
        <button type="button" onClick={doPrint}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#2E5C45] text-white font-bold text-sm hover:bg-[#254a38] shadow-sm transition-all mb-3">
          🖨 Print {total} Label{total !== 1 ? "s" : ""}
        </button>

        {state.printCompleted && state.printCopies > 0 && (
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-2">
            <div className="w-7 h-7 rounded-full bg-[#2E5C45] flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Labels Ready</p>
              <p className="text-xs text-emerald-700">Attach to products, then proceed to verification.</p>
            </div>
          </div>
        )}
      </div>

      <WizardNav onBack={goBack} onNext={handleNext} nextLabel="Continue to Verify" />

      {showSkip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Skip Printing?</h3>
            <p className="text-sm text-gray-500 mb-5">You can print later from the product detail page.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSkip(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm">Print First</button>
              <button onClick={() => { dispatch({ type: "SET_PRINT_STATUS", payload: { printCompleted: true, printCopies: 0 } }); setShowSkip(false); goNext(); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm">Skip</button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
