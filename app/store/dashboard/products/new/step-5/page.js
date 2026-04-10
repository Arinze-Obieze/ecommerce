// app/store/dashboard/products/new/step-4/page.js
"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import {
  COUNTRIES,
  FIBER_TYPES,
  WASHING_OPTIONS,
  BLEACHING_OPTIONS,
  DRYING_OPTIONS,
  IRONING_OPTIONS,
  DRY_CLEANING_OPTIONS,
  CHILDREN_SAFETY_OPTIONS,
  FLAMMABILITY_OPTIONS,
  requiresComplianceForCategory,
} from "@/lib/product-wizard-constants";

function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <span ref={ref} className="relative inline-flex ml-1 align-middle" style={{ verticalAlign: "middle" }}>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setOpen((v) => !v); } }}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-[#2E5C45]/20 hover:text-[#2E5C45] transition-colors cursor-pointer select-none"
        aria-label="More info"
      >
        i
      </span>
      {open && (
        <span className="absolute z-50 left-5 top-0 w-64 rounded-xl bg-gray-900 text-white text-xs p-3 shadow-xl leading-relaxed block">
          {text}
          <span className="absolute -left-1.5 top-2 w-3 h-3 bg-gray-900 rotate-45 block" />
        </span>
      )}
    </span>
  );
}

function CountrySelect({ value, onChange, placeholder = "Select country…", id }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())
  );
  const selected = COUNTRIES.find((c) => c.code === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" id={id} onClick={() => { setOpen((v) => !v); setQuery(""); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
        <span className={selected ? "text-gray-900 truncate" : "text-gray-400 truncate"}>
          {selected ? selected.name : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Search country…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#2E5C45]" />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            <li>
              <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50">— None —</button>
            </li>
            {filtered.map((country) => (
              <li key={country.code}>
                <button type="button" onClick={() => { onChange(country.code); setOpen(false); setQuery(""); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f0f7f3] ${value === country.code ? "bg-[#2E5C45]/5 text-[#2E5C45] font-semibold" : "text-gray-700"}`}>
                  <span className="mr-2 text-gray-400 text-xs font-mono">{country.code}</span>{country.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CareTile({ option, selected, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(option.value)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(option.value); }}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer select-none min-h-[88px] justify-center ${selected ? "border-[#2E5C45] bg-[#2E5C45]/5 shadow-sm" : "border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40"}`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#2E5C45] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className="text-base font-mono font-bold text-gray-700 leading-none">{option.symbol}</span>
      <span className={`text-[10px] leading-tight font-medium break-words w-full ${selected ? "text-[#2E5C45]" : "text-gray-500"}`}>{option.label}</span>
      <Tooltip text={option.desc} />
    </div>
  );
}

function CareMultiTile({ option, selected, onToggle }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(option.value)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(option.value); }}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer select-none min-h-[88px] justify-center ${selected ? "border-[#2E5C45] bg-[#2E5C45]/5 shadow-sm" : "border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40"}`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#2E5C45] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className="text-base font-mono font-bold text-gray-700 leading-none">{option.symbol}</span>
      <span className={`text-[10px] leading-tight font-medium break-words w-full ${selected ? "text-[#2E5C45]" : "text-gray-500"}`}>{option.label}</span>
      <Tooltip text={option.desc} />
    </div>
  );
}

function CareSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[#dbe7e0] overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8fbf9] hover:bg-[#f0f7f3] transition-colors">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-4 bg-white">{children}</div>}
    </div>
  );
}

function FiberRow({ fiber, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <select value={fiber.type} onChange={(e) => onChange({ ...fiber, type: e.target.value })} className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
        <option value="">Select fiber…</option>
        {FIBER_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <div className="relative flex-shrink-0 w-20">
        <input type="number" min="1" max="100" value={fiber.percent} onChange={(e) => onChange({ ...fiber, percent: e.target.value === "" ? "" : Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)) })} placeholder="0" className="w-full pl-3 pr-7 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">%</span>
      </div>
      {canRemove ? (
        <button type="button" onClick={onRemove} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">×</button>
      ) : (
        <div className="flex-shrink-0 w-8" />
      )}
    </div>
  );
}

export default function SpecificationsStep() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [errors, setErrors] = useState({});

  const complianceRequired = requiresComplianceForCategory(state.category);
  const fibers = state.fiberComposition?.length ? state.fiberComposition : [{ type: "", percent: "" }];
  const totalPercent = fibers.reduce((sum, fiber) => sum + (parseInt(fiber.percent, 10) || 0), 0);
  const percentOk = totalPercent === 100;
  const percentColor = totalPercent > 100 ? "text-red-500" : totalPercent === 100 ? "text-[#2E5C45]" : "text-amber-500";
  const progressColor = totalPercent > 100 ? "bg-red-400" : totalPercent === 100 ? "bg-[#2E5C45]" : "bg-amber-400";

  const specs = useMemo(
    () => (Array.isArray(state.specifications) && state.specifications.length ? state.specifications : [{ key: "", value: "" }]),
    [state.specifications]
  );

  const setLabelField = (field, value) => {
    dispatch({ type: "SET_LABEL_INFO", payload: { [field]: value } });
    if (errors[field]) setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setFibers = (updated) => dispatch({ type: "SET_LABEL_INFO", payload: { fiberComposition: updated } });
  const addFiber = () => { if (fibers.length < 10) setFibers([...fibers, { type: "", percent: "" }]); };
  const updateFiber = (idx, val) => setFibers(fibers.map((fiber, i) => (i === idx ? val : fiber)));
  const removeFiber = (idx) => setFibers(fibers.filter((_, i) => i !== idx));

  const updateSpec = (index, field, value) => {
    const next = specs.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec));
    dispatch({ type: "SET_SPECIFICATIONS", payload: next });
  };
  const addSpec = () => dispatch({ type: "SET_SPECIFICATIONS", payload: [...specs, { key: "", value: "" }] });
  const removeSpec = (index) => dispatch({ type: "SET_SPECIFICATIONS", payload: specs.filter((_, i) => i !== index) });

  const toggleMulti = (field, value) => {
    const current = Array.isArray(state[field]) ? state[field] : [];
    setLabelField(field, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const validate = () => {
    const nextErrors = {};
    const filledSpecs = specs.filter((spec) => String(spec.key || "").trim() || String(spec.value || "").trim());
    if (!String(state.specificationSummary || "").trim() && filledSpecs.length === 0) {
      nextErrors.specifications = "Add a buyer-facing specification summary or at least one key specification.";
    } else if (filledSpecs.some((spec) => !String(spec.key || "").trim() || !String(spec.value || "").trim())) {
      nextErrors.specifications = "Each specification row needs both a label and a value.";
    }

    if (complianceRequired) {
      const filledFibers = fibers.filter((fiber) => fiber.type || fiber.percent);
      if (filledFibers.some((fiber) => !fiber.type || !fiber.percent)) {
        nextErrors.fiberComposition = "Each fiber row needs both a type and a percentage.";
      } else if (filledFibers.length > 0 && !percentOk) {
        nextErrors.fiberComposition = `Fiber percentages must total 100% (currently ${totalPercent}%).`;
      } else if (filledFibers.length === 0) {
        nextErrors.fiberComposition = "Fiber composition is required before publishing apparel.";
      }

      if (!String(state.countryOfOrigin || "").trim()) {
        nextErrors.countryOfOrigin = "Country of origin is required before publishing apparel.";
      }

      if (!(state.careWashing || state.careBleaching || state.careDrying || state.careIroning || state.careDryCleaning)) {
        nextErrors.care = "Add at least one care instruction before publishing apparel.";
      }
    }

    return nextErrors;
  };

  const handleNext = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    goNext();
  };

  return (
    <WizardShell
      title="Specifications & Labels"
      subtitle="Start with buyer-facing specifications, then add apparel label details for compliance if they apply."
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#dbe7e0] bg-[#f7fbf8] p-4">
          <p className="text-sm font-bold text-gray-900">How this step works</p>
          <p className="mt-1 text-sm text-gray-600">
            Product specifications help buyers understand what they are buying. Label details help your team meet apparel requirements. Specifications are always recommended. Label data is required for publish-ready apparel listings.
          </p>
        </div>

        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Specification Summary
              <Tooltip text="Use this as the default freeform field to describe fit, fabric feel, use case, what is included, and anything buyers should know before adding to cart." />
            </label>
            <textarea
              rows={4}
              value={state.specificationSummary}
              onChange={(e) => dispatch({ type: "SET_SPECIFICATION_SUMMARY", payload: e.target.value })}
              placeholder="Example: Soft mid-weight cotton tee with a relaxed fit, ribbed collar, and breathable feel. Great for everyday wear."
              className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-white resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Structured Specifications</label>
              <button type="button" onClick={addSpec} className="text-sm font-semibold text-[#2E5C45] hover:underline">+ Add specification</button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input value={spec.key} onChange={(e) => updateSpec(index, "key", e.target.value)} placeholder="Label e.g. Fit" className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  <input value={spec.value} onChange={(e) => updateSpec(index, "value", e.target.value)} placeholder="Value e.g. Relaxed" className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  <button type="button" onClick={() => removeSpec(index)} disabled={specs.length === 1} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-red-600 disabled:opacity-40">Remove</button>
                </div>
              ))}
            </div>
            {errors.specifications && <p className="mt-1.5 text-xs text-red-500">{errors.specifications}</p>}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Existing Garment Label Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                {complianceRequired
                  ? "Required for publish-ready apparel. Complete the fields below before you submit."
                  : "Optional for this category. Add them now if they apply."}
              </p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${complianceRequired ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
              {complianceRequired ? "Required before publish" : "Optional"}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Fiber Composition
                <Tooltip text="List every fiber in the garment with its exact percentage. This should match the physical label when applicable." />
              </label>
              <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${percentColor}`}>{totalPercent}% / 100%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${progressColor}`} style={{ width: `${Math.min(100, totalPercent)}%` }} />
            </div>
            <div className="space-y-2">
              {fibers.map((fiber, idx) => (
                <FiberRow key={idx} fiber={fiber} onChange={(val) => updateFiber(idx, val)} onRemove={() => removeFiber(idx)} canRemove={fibers.length > 1} />
              ))}
            </div>
            {errors.fiberComposition && <p className="mt-1.5 text-xs text-red-500">{errors.fiberComposition}</p>}
            {fibers.length < 10 && (
              <button type="button" onClick={addFiber} className="mt-2.5 flex items-center gap-1.5 text-sm text-[#2E5C45] font-semibold hover:underline">
                <span className="text-lg leading-none">+</span> Add fiber
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Country of Origin
                <Tooltip text="The country where the garment was primarily manufactured. This should match the label when applicable." />
              </label>
              <CountrySelect id="country_of_origin" value={state.countryOfOrigin || ""} onChange={(v) => setLabelField("countryOfOrigin", v)} placeholder="Select country…" />
              {errors.countryOfOrigin && <p className="mt-1.5 text-xs text-red-500">{errors.countryOfOrigin}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Country of Transformation
                <Tooltip text="Use this when the product was substantially transformed in a different country from where the raw material or base item originated." />
              </label>
              <CountrySelect id="country_of_transformation" value={state.countryOfTransformation || ""} onChange={(v) => setLabelField("countryOfTransformation", v)} placeholder="Same as origin (optional)" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Label Brand / Trademark
              <Tooltip text="This can be different from the store brand if the physical product label uses another brand or trademark." />
            </label>
            <input value={state.labelBrand || state.brand || ""} onChange={(e) => setLabelField("labelBrand", e.target.value)} placeholder="e.g. Acme Apparel" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Care Instructions
              <Tooltip text="Add the care instructions that buyers or internal teams will need. For publish-ready apparel, include at least one care instruction." />
            </p>
            {errors.care && <p className="mb-3 text-xs text-red-500">{errors.care}</p>}
            <div className="space-y-3">
              <CareSection title="Washing" defaultOpen>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-stretch">
                  {WASHING_OPTIONS.map((opt) => <CareTile key={opt.value} option={opt} selected={state.careWashing === opt.value} onSelect={(v) => setLabelField("careWashing", state.careWashing === v ? null : v)} />)}
                </div>
              </CareSection>
              <CareSection title="Bleaching">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-stretch">
                  {BLEACHING_OPTIONS.map((opt) => <CareTile key={opt.value} option={opt} selected={state.careBleaching === opt.value} onSelect={(v) => setLabelField("careBleaching", state.careBleaching === v ? null : v)} />)}
                </div>
              </CareSection>
              <CareSection title="Drying">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-stretch">
                  {DRYING_OPTIONS.map((opt) => <CareTile key={opt.value} option={opt} selected={state.careDrying === opt.value} onSelect={(v) => setLabelField("careDrying", state.careDrying === v ? null : v)} />)}
                </div>
              </CareSection>
              <CareSection title="Ironing">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-stretch">
                  {IRONING_OPTIONS.map((opt) => <CareTile key={opt.value} option={opt} selected={state.careIroning === opt.value} onSelect={(v) => setLabelField("careIroning", state.careIroning === v ? null : v)} />)}
                </div>
              </CareSection>
              <CareSection title="Dry Cleaning">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-stretch">
                  {DRY_CLEANING_OPTIONS.map((opt) => <CareTile key={opt.value} option={opt} selected={state.careDryCleaning === opt.value} onSelect={(v) => setLabelField("careDryCleaning", state.careDryCleaning === v ? null : v)} />)}
                </div>
              </CareSection>
              <CareSection title="Children's Safety Warnings">
                <p className="text-xs text-gray-400 mb-3">Select all that apply.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-stretch">
                  {CHILDREN_SAFETY_OPTIONS.map((opt) => <CareMultiTile key={opt.value} option={opt} selected={(state.childrenSafetyFlags || []).includes(opt.value)} onToggle={(v) => toggleMulti("childrenSafetyFlags", v)} />)}
                </div>
              </CareSection>
              <CareSection title="Flammability">
                <p className="text-xs text-gray-400 mb-3">Select all that apply.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-stretch">
                  {FLAMMABILITY_OPTIONS.map((opt) => <CareMultiTile key={opt.value} option={opt} selected={(state.flammabilityFlags || []).includes(opt.value)} onToggle={(v) => toggleMulti("flammabilityFlags", v)} />)}
                </div>
              </CareSection>
            </div>
          </div>
        </section>
      </div>

      <WizardNav onBack={goBack} onNext={handleNext} nextLabel="Continue to Review" />
    </WizardShell>
  );
}
