"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { buildSkuCode, buildVariantSku, COLORS_LIST, getColorSwatch, getSizeOptions, MATERIALS } from "@/features/product-wizard/lib/constants";
import { useToast } from "@/contexts/toast/ToastContext";

const ATTRIBUTE_OPTIONS = ["Color", "Size", "Material", "Style", "Pattern"];
const COLOR_OPTIONS = COLORS_LIST.filter((color) => color.family !== "Multi");

function deriveSkuFromName(productName) {
  if (!productName) return "";
  return buildSkuCode(
    productName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("") || productName,
    4
  );
}

function buildAutoSku(storeSlug, productName) {
  const storeCode = buildSkuCode(storeSlug || "STOR", 4);
  const productCode = deriveSkuFromName(productName) || buildSkuCode(productName, 4);
  return `ZVA-${storeCode}-${productCode}-0001`;
}

function normalizeToken(value) {
  return String(value || "").trim();
}

function sanitizeSkuToken(value) {
  return normalizeToken(value).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function makeVariantId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

function variantKey(color, size) {
  return `${String(color || "").toLowerCase()}__${String(size || "").toLowerCase()}`;
}

function normalizeExistingVariant(variant = {}) {
  const legacy = [
    { name: normalizeToken(variant.attr1Name) || "Color", value: normalizeToken(variant.attr1Value) || normalizeToken(variant.color) || "" },
    { name: normalizeToken(variant.attr2Name), value: normalizeToken(variant.attr2Value) || (normalizeToken(variant.size) !== "OS" ? normalizeToken(variant.size) : "") },
  ].filter((entry) => entry.name && entry.value);

  const fromVariant = Array.isArray(variant.attributes)
    ? variant.attributes.map((entry) => ({ name: normalizeToken(entry?.name), value: normalizeToken(entry?.value) })).filter((entry) => entry.name && entry.value)
    : [];

  const deduped = [];
  [...fromVariant, ...legacy].forEach((entry) => {
    if (!entry.name || !entry.value) return;
    if (!deduped.some((existing) => existing.name.toLowerCase() === entry.name.toLowerCase())) {
      deduped.push(entry);
    }
  });

  return {
    id: variant.id || makeVariantId(),
    color: normalizeToken(variant.color) || "Default",
    colorHex: normalizeToken(variant.colorHex),
    size: normalizeToken(variant.size) || "OS",
    price: Number(variant.price || 0),
    quantity: Number.parseInt(variant.quantity, 10) || 0,
    attr1Name: deduped[0]?.name || "Color",
    attr1Value: deduped[0]?.value || "",
    attr2Name: deduped[1]?.name || "",
    attr2Value: deduped[1]?.value || "",
    attributes: deduped.length ? deduped : [{ name: "Color", value: "" }],
    useVariantMedia: Boolean(variant.useVariantMedia),
  };
}

function deriveColorSizeFromAttributes(entries = []) {
  const validEntries = (entries || [])
    .map((entry) => ({ name: normalizeToken(entry?.name), value: normalizeToken(entry?.value) }))
    .filter((entry) => entry.name && entry.value);

  let color = "";
  let size = "";

  validEntries.forEach((entry) => {
    const lower = entry.name.toLowerCase();
    if (lower === "color" && !color) color = entry.value;
    if (lower === "size" && !size) size = entry.value;
  });

  if (!color && validEntries[0]) color = validEntries[0].value;
  if (!size) {
    const fallbackSize = validEntries.find((entry) => entry.name.toLowerCase() === "size")?.value || "";
    size = fallbackSize || "OS";
  }

  return {
    color: color || "Default",
    size: size || "OS",
  };
}

function variantDisplayLabel(variant) {
  const attrs = Array.isArray(variant.attributes) ? variant.attributes : [
    { name: variant.attr1Name, value: variant.attr1Value },
    { name: variant.attr2Name, value: variant.attr2Value },
  ];
  const values = attrs.map((entry) => normalizeToken(entry?.value)).filter(Boolean);
  if (values.length) return values.join(" / ");
  const c = variant.color === "Default" ? null : variant.color;
  const s = variant.size === "OS" ? null : variant.size;
  return [c, s].filter(Boolean).join(" / ") || "Default";
}

function buildVariantSkuFromPattern(baseSku, pattern, variant) {
  const fallback = buildVariantSku(baseSku, variant.color === "Default" ? "" : variant.color, variant.size === "OS" ? "" : variant.size);
  const cleanPattern = normalizeToken(pattern);
  if (!cleanPattern) return fallback;

  const attrText = (Array.isArray(variant.attributes) ? variant.attributes : [
    { name: variant.attr1Name, value: variant.attr1Value },
    { name: variant.attr2Name, value: variant.attr2Value },
  ])
    .map((entry) => normalizeToken(entry?.value))
    .filter(Boolean)
    .join("-");

  const mapped = cleanPattern
    .replace(/BASE|\{base\}/gi, baseSku)
    .replace(/\{color\}/gi, sanitizeSkuToken(variant.color === "Default" ? "" : variant.color))
    .replace(/\{size\}/gi, sanitizeSkuToken(variant.size === "OS" ? "" : variant.size))
    .replace(/\{attribute\}/gi, sanitizeSkuToken(attrText));

  const normalized = mapped
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function uploadImageFiles(files, makeKey, onUpload, showError) {
  Array.from(files || []).forEach((file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showError("Images must be 10 MB or smaller."); return; }
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isImage) { showError("Upload JPG, PNG, or WebP files only."); return; }
    const key = makeKey();
    onUpload(key, file, URL.createObjectURL(file));
  });
}

function normalizeHex(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9A-Fa-f]{6}$/.test(withHash) ? withHash.toUpperCase() : "";
}

function ColorSearchDropdown({ value, valueHex = "", onChange, idPrefix = "color-search" }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#9CA3AF");

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    if (!customMode) return;
    setCustomHex((prev) => normalizeHex(prev) || normalizeHex(valueHex) || "#9CA3AF");
  }, [customMode, valueHex]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return COLOR_OPTIONS;
    return COLOR_OPTIONS.filter((color) => color.name.toLowerCase().includes(q));
  }, [query]);

  const shown = filtered.slice(0, 30);
  const selectedSwatch = getColorSwatch(value || "", normalizeHex(valueHex) || undefined);
  const customHexValid = Boolean(normalizeHex(customHex));

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => { setQuery(value || ""); setOpen(true); setCustomMode(false); }}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-[#2E6417]/40"
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-4 w-4 shrink-0 rounded-full border border-gray-300" style={{ backgroundColor: selectedSwatch }} />
          <span className={value ? "text-gray-900" : "text-gray-400"}>{value || "Select color"}</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-60 bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h5 className="text-sm font-bold text-gray-800">Choose color</h5>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">✕</button>
            </div>
            <div className="space-y-3 p-4">
              <input
                id={`${idPrefix}-input`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search colors"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />

              {shown.length === 0 ? (
                <p className="px-1 py-2 text-xs text-gray-500">No preset match.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {shown.map((color) => {
                      const selected = value === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => { onChange({ name: color.name, hex: color.hex || "" }); setQuery(color.name); setCustomMode(false); setOpen(false); }}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                            selected ? "border-[#2E6417] bg-[#2E6417]/10 text-[#2E6417]" : "border-gray-200 bg-white text-gray-700 hover:border-[#2E6417]/40"
                          }`}
                        >
                          <span className="inline-flex h-4 w-4 shrink-0 rounded-full border border-gray-300" style={{ backgroundColor: getColorSwatch(color.name, color.hex) }} />
                          <span className="truncate">{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!customMode ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => { onChange({ name: "", hex: "" }); setQuery(""); setOpen(false); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    Clear
                  </button>
                  <button type="button" onClick={() => { setCustomMode(true); setCustomName(String(query || "").trim()); setCustomHex(normalizeHex(valueHex) || "#9CA3AF"); }} className="flex-1 rounded-lg border border-[#2E6417]/30 bg-[#2E6417]/5 px-3 py-2 text-left text-xs font-semibold text-[#2E6417] hover:bg-[#2E6417]/10">
                    + Add custom color
                  </button>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-[#2E6417]/20 bg-[#2E6417]/5 p-2">
                  <p className="text-xs font-semibold text-gray-700">Custom color</p>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Color name" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                    <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" title="Pick swatch" />
                    <input
                      value={customHex.toUpperCase()}
                      onChange={(e) => { const next = e.target.value.toUpperCase(); setCustomHex(next.startsWith("#") ? next : `#${next}`); }}
                      placeholder="#9CA3AF"
                      className="h-10 w-28 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-mono uppercase"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Swatch</span>
                    <code className="rounded bg-white px-1.5 py-0.5 text-xs text-gray-700 border border-gray-200">{normalizeHex(customHex) || "Invalid HEX"}</code>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = String(customName || "").trim();
                        if (!next) return;
                        const normalized = normalizeHex(customHex);
                        if (!normalized) return;
                        onChange({ name: next, hex: normalized });
                        setQuery(next); setCustomMode(false); setOpen(false);
                      }}
                      disabled={!String(customName || "").trim() || !customHexValid}
                      className="rounded-lg bg-[#2E6417] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add custom color
                    </button>
                    <button type="button" onClick={() => setCustomMode(false)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PRODUCT_SLOTS = [
  { key: "general_front",      label: "Front View",          hint: "Full front shot on a clean/neutral background", badge: "Required",    badgeStyle: "bg-red-50 text-red-600" },
  { key: "general_back",       label: "Back View",           hint: "Full back of the product",                       badge: "Required",    badgeStyle: "bg-red-50 text-red-600" },
  { key: "general_label_care", label: "Care & Size Label",   hint: "Tag showing size, fabric & wash instructions",   badge: "Recommended", badgeStyle: "bg-amber-50 text-amber-700" },
  { key: "general_label_neck", label: "Brand / Neck Label",  hint: "Close-up of the brand tag or neck label",        badge: "Recommended", badgeStyle: "bg-amber-50 text-amber-700" },
  { key: "general_size_chart", label: "Size Chart",          hint: "Your brand's measurement guide for buyers",      badge: "Recommended", badgeStyle: "bg-amber-50 text-amber-700" },
  { key: "general_detail",     label: "Detail / Close-up",   hint: "Texture, print, embroidery or key feature",      badge: "Optional",    badgeStyle: "bg-gray-100 text-gray-500" },
  { key: "general_lifestyle",  label: "Lifestyle / On Model",hint: "Product worn or styled — shows real-world fit",  badge: "Optional",    badgeStyle: "bg-gray-100 text-gray-500" },
];

export default function Step2() {
  const { state, dispatch, storeContext, goNext, goBack } = useWizard();
  const { error: showError } = useToast();

  const [skuOverride, setSkuOverride] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingVariantId, setEditingVariantId] = useState(null);

  const [variantForm, setVariantForm] = useState({
    attributes: [{ name: "Color", value: "" }],
    colorHex: "",
    price: "",
    quantity: "",
    useVariantMedia: false,
    selectedSizes: [],
  });

  const [targetSlotKey, setTargetSlotKey] = useState(null);

  const productUploadRef = useRef(null);
  const variantUploadRef = useRef(null);

  const autoSku = buildAutoSku(storeContext?.slug || storeContext?.name, state.productName);
  const variantSkuPattern = state.variantSkuPattern || "";

  useEffect(() => {
    if (!state.baseSku) {
      dispatch({ type: "SET_BASIC_INFO", payload: { baseSku: autoSku } });
    }
  }, [autoSku, dispatch, state.baseSku]);

  useEffect(() => {
    if (!skuOverride) {
      dispatch({ type: "SET_BASIC_INFO", payload: { baseSku: autoSku } });
    }
  }, [autoSku, dispatch, skuOverride]);

  useEffect(() => {
    dispatch({ type: "SET_IMAGE_STRATEGY", payload: state.hasOptions ? "variant" : "general" });
  }, [dispatch, state.hasOptions]);

  useEffect(() => {
    const normalized = (state.variants || []).map((variant) => normalizeExistingVariant(variant));
    const changed =
      normalized.length !== (state.variants || []).length ||
      normalized.some((variant, index) => {
        const current = state.variants[index] || {};
        return (
          variant.id !== current.id ||
          variant.attr1Name !== current.attr1Name ||
          variant.attr1Value !== current.attr1Value ||
          variant.attr2Name !== current.attr2Name ||
          variant.attr2Value !== current.attr2Value ||
          normalizeToken(variant.colorHex) !== normalizeToken(current.colorHex) ||
          variant.useVariantMedia !== Boolean(current.useVariantMedia)
        );
      });
    if (changed) dispatch({ type: "SET_VARIANTS", payload: normalized });
  }, [dispatch, state.variants]);

  const variants = useMemo(() => (state.variants || []).map((v) => normalizeExistingVariant(v)), [state.variants]);

  const hasMedia = (key) => Boolean(state.images?.[key] || state.persistedImages?.[key]);

  const uploadSingle = (key, file, preview) => dispatch({ type: "SET_IMAGE", key, file, preview });

  const handleSlotUpload = (files, slotKey) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showError("Images must be 10 MB or smaller."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { showError("Upload JPG, PNG, or WebP files only."); return; }
    uploadSingle(slotKey, file, URL.createObjectURL(file));
  };

  const setVariants = (next) => dispatch({ type: "SET_VARIANTS", payload: next });

  const setSimpleVariant = (patch) => {
    const base = variants[0] ? normalizeExistingVariant(variants[0]) : {
      id: makeVariantId(), color: "", colorHex: "", size: "OS",
      attr1Name: "Color", attr1Value: "", attr2Name: "Size", attr2Value: "OS",
      attributes: [{ name: "Color", value: "" }, { name: "Size", value: "OS" }],
      price: 0, quantity: 0, useVariantMedia: false,
    };
    setVariants([{ ...base, ...patch }]);
  };

  const deleteVariant = (variantId) => {
    setVariants(variants.filter((v) => v.id !== variantId));
    if (editingVariantId === variantId) { setEditingVariantId(null); setFormOpen(false); }
  };

  const openAddForm = () => {
    setFormMode("add"); setEditingVariantId(null);
    setVariantForm({ attributes: [{ name: "Color", value: "" }], colorHex: "", price: "", quantity: "", useVariantMedia: false, selectedSizes: [] });
    setFormOpen(true);
  };

  const openEditForm = (variant) => {
    setFormMode("edit"); setEditingVariantId(variant.id);
    const normalized = normalizeExistingVariant(variant);
    const existingSize = normalized.size && normalized.size !== "OS" ? [normalized.size] : [];
    setVariantForm({ attributes: normalized.attributes || [{ name: "Color", value: "" }], colorHex: normalized.colorHex || "", price: String(normalized.price || ""), quantity: String(normalized.quantity || ""), useVariantMedia: Boolean(normalized.useVariantMedia), selectedSizes: existingSize });
    setFormOpen(true);
  };

  const availableTypeOptionsForRow = (index) => {
    const selectedElsewhere = variantForm.attributes.filter((_, i) => i !== index).map((e) => String(e?.name || "").toLowerCase());
    return ATTRIBUTE_OPTIONS.filter((opt) => !selectedElsewhere.includes(opt.toLowerCase()));
  };

  const addVariantTypeRow = () => {
    const used = variantForm.attributes.map((e) => String(e?.name || "").toLowerCase());
    const nextType = ATTRIBUTE_OPTIONS.find((opt) => !used.includes(opt.toLowerCase()));
    if (!nextType) return;
    setVariantForm((prev) => ({ ...prev, attributes: [...prev.attributes, { name: nextType, value: "" }] }));
  };

  const removeVariantTypeRow = (index) => {
    setVariantForm((prev) => {
      const next = prev.attributes.filter((_, i) => i !== index);
      return { ...prev, attributes: next.length ? next : [{ name: "Color", value: "" }] };
    });
  };

  const getCurrentFormColor = () => {
    const colorEntry = (variantForm.attributes || []).find((e) => String(e?.name || "").toLowerCase() === "color");
    return normalizeToken(colorEntry?.value);
  };

  const getPresetOptionsForAttribute = (attributeName) => {
    const normalized = String(attributeName || "").trim().toLowerCase();
    if (normalized === "size") return getSizeOptions(state.category);
    if (normalized === "material") return MATERIALS;
    if (normalized === "pattern") return ["Plain", "Striped", "Checked", "Floral", "Graphic", "Printed"];
    return null;
  };

  const getVariantMediaKeysForColor = (colorName) => {
    const safe = String(colorName || "").trim().replace(/\s+/g, "_");
    if (!safe) return [];
    const keys = Object.keys({ ...(state.persistedImages || {}), ...(state.imagePreviews || {}) });
    return keys.filter((key) => key.startsWith(`variant_${safe}_`));
  };

  const getMediaPreviewUrl = (key) => state.imagePreviews?.[key] || state.persistedImages?.[key]?.publicUrl || null;

  const uploadVariantImageFiles = (files) => {
    const colorName = getCurrentFormColor();
    if (!colorName) { showError("Select a Color value before uploading variant images."); return; }
    const safe = colorName.replace(/\s+/g, "_");
    const existing = getVariantMediaKeysForColor(colorName);
    let extraIndex = 1;
    while (existing.some((key) => key === `variant_${safe}_extra_${extraIndex}`)) extraIndex += 1;
    uploadImageFiles(
      files,
      () => {
        if (!hasMedia(`variant_${safe}_front`)) return `variant_${safe}_front`;
        if (!hasMedia(`variant_${safe}_back`)) return `variant_${safe}_back`;
        const key = `variant_${safe}_extra_${extraIndex}`; extraIndex += 1; return key;
      },
      (key, file, preview) => uploadSingle(key, file, preview),
      showError
    );
  };

  const currentFormColor = getCurrentFormColor();
  const currentVariantMediaKeys = useMemo(
    () => (currentFormColor ? getVariantMediaKeysForColor(currentFormColor) : []),
    [currentFormColor, state.imagePreviews, state.persistedImages]
  );

  const saveVariantForm = () => {
    const baseAttributes = (variantForm.attributes || [])
      .map((entry) => ({ name: normalizeToken(entry?.name), value: normalizeToken(entry?.value) }))
      .filter((entry) => entry.name);

    if (!baseAttributes.some((e) => e.name.toLowerCase() === "color")) { showError("Add Color as one of the variant types."); return; }
    if (baseAttributes.some((e, i) => baseAttributes.findIndex((x) => x.name.toLowerCase() === e.name.toLowerCase()) !== i)) { showError("Variant types must not repeat."); return; }
    if (!baseAttributes.find((e) => e.name.toLowerCase() === "color")?.value) { showError("Select a color."); return; }

    const hasSizeRow = baseAttributes.some((e) => e.name.toLowerCase() === "size");
    const sizesToSave = hasSizeRow
      ? (variantForm.selectedSizes || []).filter(Boolean)
      : ["OS"];

    if (hasSizeRow && sizesToSave.length === 0) { showError("Select at least one size."); return; }

    const nonSizeAttrs = baseAttributes.filter((e) => e.name.toLowerCase() !== "size");
    const missingValue = nonSizeAttrs.find((e) => !e.value);
    if (missingValue) { showError(`Enter a value for ${missingValue.name}.`); return; }

    const price = Number.parseFloat(variantForm.price || "0") || 0;
    const quantity = Number.parseInt(variantForm.quantity || "0", 10) || 0;
    if (!(price > 0)) { showError("Price must be greater than 0."); return; }
    if (!(quantity >= 1)) { showError("Stock must be at least 1."); return; }

    if (formMode === "edit") {
      // Edit: single size only
      const size = sizesToSave[0] || "OS";
      const attributes = hasSizeRow
        ? [...nonSizeAttrs, { name: "Size", value: size }]
        : nonSizeAttrs;
      const { color } = deriveColorSizeFromAttributes(attributes);
      const nextVariant = {
        id: editingVariantId, color, colorHex: normalizeToken(variantForm.colorHex), size,
        attr1Name: attributes[0]?.name || "Color", attr1Value: attributes[0]?.value || "",
        attr2Name: attributes[1]?.name || "", attr2Value: attributes[1]?.value || "",
        attributes, price, quantity, useVariantMedia: Boolean(variantForm.useVariantMedia),
      };
      if (variants.some((v) => v.id !== editingVariantId && variantKey(v.color, v.size) === variantKey(nextVariant.color, nextVariant.size))) {
        showError("This variant combination already exists."); return;
      }
      setVariants(variants.map((v) => (v.id === editingVariantId ? nextVariant : v)));
    } else {
      // Add: one variant per selected size
      const { color } = deriveColorSizeFromAttributes(nonSizeAttrs);
      const skipped = [];
      const toAdd = [];

      sizesToSave.forEach((size) => {
        const attributes = hasSizeRow
          ? [...nonSizeAttrs, { name: "Size", value: size }]
          : nonSizeAttrs;
        if (variants.some((v) => variantKey(v.color, v.size) === variantKey(color, size))) {
          skipped.push(size); return;
        }
        toAdd.push({
          id: makeVariantId(), color, colorHex: normalizeToken(variantForm.colorHex), size,
          attr1Name: attributes[0]?.name || "Color", attr1Value: attributes[0]?.value || "",
          attr2Name: attributes[1]?.name || "", attr2Value: attributes[1]?.value || "",
          attributes, price, quantity, useVariantMedia: Boolean(variantForm.useVariantMedia),
        });
      });

      if (toAdd.length === 0) { showError("All selected sizes already exist for this color."); return; }
      if (skipped.length > 0) showError(`Skipped already-existing sizes: ${skipped.join(", ")}`);
      setVariants([...variants, ...toAdd]);
    }

    setFormOpen(false); setEditingVariantId(null);
  };

  const variantSku = (variant) => {
    const baseSku = normalizeToken(state.baseSku);
    if (!baseSku) return "—";
    return buildVariantSkuFromPattern(baseSku, variantSkuPattern, variant);
  };

  const validate = () => {
    if (!normalizeToken(state.baseSku)) return "SKU is required.";
    if (!variants.length) return "Add at least one variant.";
    for (const variant of variants) {
      if (!(variant.price > 0)) return `Set price for ${variantDisplayLabel(variant)}.`;
      if (!(variant.quantity > 0)) return `Set stock for ${variantDisplayLabel(variant)}.`;
      if (!normalizeToken(variant.color) || variant.color === "Default") return `Select a color for ${variantDisplayLabel(variant)}.`;
    }
    if (!hasMedia("general_front")) return "Upload a front view photo (required).";
    if (!hasMedia("general_back")) return "Upload a back view photo (required).";
    return null;
  };

  const handleNext = () => {
    const error = validate();
    if (error) { showError(error); return; }
    goNext();
  };

  const totalStock = variants.reduce((sum, v) => sum + (Number.parseInt(v.quantity, 10) || 0), 0);

  const renderProductMediaCard = (extraClassName = "") => {
    const filledCount = PRODUCT_SLOTS.filter((s) => hasMedia(s.key)).length;
    const requiredFilled = hasMedia("general_front") && hasMedia("general_back");

    return (
      <div className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 ${extraClassName}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800">PRODUCT MEDIA</h4>
            <p className="text-xs text-gray-500 mt-0.5">Upload each image in the right slot — this helps buyers see exactly what they're getting.</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${requiredFilled ? "bg-[#2E6417]/10 text-[#2E6417]" : "bg-amber-50 text-amber-700"}`}>
            {filledCount} / {PRODUCT_SLOTS.length}
          </span>
        </div>

        <input
          ref={productUploadRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { if (targetSlotKey) { handleSlotUpload(e.target.files, targetSlotKey); setTargetSlotKey(null); } e.target.value = ""; }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRODUCT_SLOTS.map((slot) => {
            const preview = state.imagePreviews?.[slot.key] || state.persistedImages?.[slot.key]?.publicUrl;
            const filled = hasMedia(slot.key);

            if (filled) {
              return (
                <div key={slot.key} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={preview} alt={slot.label} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                    <p className="text-[10px] text-white font-semibold leading-tight">{slot.label}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => { setTargetSlotKey(slot.key); productUploadRef.current?.click(); }}
                      className="rounded-full bg-black/60 px-2 py-1 text-[10px] text-white font-semibold hover:bg-black/80"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REMOVE_IMAGE", key: slot.key })}
                      className="rounded-full bg-black/60 px-2 py-1 text-[10px] text-white font-semibold hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => { setTargetSlotKey(slot.key); productUploadRef.current?.click(); }}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#2E6417]/50 hover:bg-[#2E6417]/5 transition-colors flex flex-col items-center justify-center gap-1.5 p-3 text-center"
              >
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${slot.badgeStyle}`}>{slot.badge}</span>
                <span className="text-xs font-bold text-gray-800">{slot.label}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{slot.hint}</span>
                <span className="mt-1 text-[10px] font-semibold text-[#2E6417]">+ Upload</span>
              </button>
            );
          })}
        </div>

        {!requiredFilled && (
          <p className="text-xs text-amber-700 font-medium">Front and back views are required to continue.</p>
        )}
      </div>
    );
  };

  return (
    <WizardShell
      title="Variants, Pricing, Inventory & Media"
      subtitle="Configure mode, SKU, inventory, and product/variant media in one flow."
    >
      <div className="space-y-5">

        {/* SECTION 1 + 2: Mode + SKU */}
        <div className={`grid gap-4 ${state.hasOptions ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
            <h4 className="text-sm font-bold text-gray-800">PRODUCT MODE</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_HAS_OPTIONS", payload: false })}
                className={`text-left rounded-xl border p-3 transition-colors ${!state.hasOptions ? "border-[#2E6417] bg-[#2E6417]/5" : "border-gray-200 bg-white hover:border-[#2E6417]/35"}`}
              >
                <p className="text-sm font-bold text-gray-900">Simple product</p>
                <p className="text-xs text-gray-500 mt-1">For products with one variant</p>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_HAS_OPTIONS", payload: true })}
                className={`text-left rounded-xl border p-3 transition-colors ${state.hasOptions ? "border-[#2E6417] bg-[#2E6417]/5" : "border-gray-200 bg-white hover:border-[#2E6417]/35"}`}
              >
                <p className="text-sm font-bold text-gray-900">Advanced (variants)</p>
                <p className="text-xs text-gray-500 mt-1">Add variants by color, size, or other attributes. Each variant has its own price and stock.</p>
              </button>
            </div>
          </div>

          <div className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 ${state.hasOptions ? "lg:col-span-2" : ""}`}>
            <h4 className="text-sm font-bold text-gray-800">SKU</h4>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  {state.hasOptions ? "Base SKU" : "SKU"} <span className="text-red-400">*</span>
                </label>
                {!skuOverride ? (
                  <button type="button" onClick={() => setSkuOverride(true)} className="text-xs font-semibold text-[#2E6417] hover:underline">Edit manually</button>
                ) : (
                  <button type="button" onClick={() => { setSkuOverride(false); dispatch({ type: "SET_BASIC_INFO", payload: { baseSku: autoSku } }); }} className="text-xs font-semibold text-gray-500 hover:underline">Reset auto</button>
                )}
              </div>
              <input
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono font-semibold tracking-wide focus:ring-2 focus:ring-[#2E6417]/20 focus:border-[#2E6417] uppercase"
                value={state.baseSku || ""}
                onChange={(e) => { setSkuOverride(true); dispatch({ type: "SET_BASIC_INFO", payload: { baseSku: e.target.value.toUpperCase() } }); }}
                placeholder={autoSku || "ZVA-XXXX-XXXX-0001"}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Simple product pricing + media */}
        {!state.hasOptions && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 xl:col-span-7">
              <h4 className="text-sm font-bold text-gray-800">PRICING & INVENTORY</h4>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color <span className="text-red-400">*</span></label>
                <ColorSearchDropdown
                  value={variants[0]?.color === "Default" ? "" : variants[0]?.color || ""}
                  valueHex={variants[0]?.colorHex || ""}
                  onChange={({ name, hex }) => setSimpleVariant({ color: name, colorHex: normalizeHex(hex), attr1Name: "Color", attr1Value: name, attributes: [{ name: "Color", value: name }, { name: "Size", value: "OS" }] })}
                  idPrefix="simple-color"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₦)</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                    value={variants[0]?.price || ""}
                    onChange={(e) => { const next = Number.parseFloat(e.target.value); setSimpleVariant({ price: Number.isFinite(next) ? Math.max(0, next) : 0 }); }}
                  />
                </div>
                <div className="rounded-xl border border-gray-100 p-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock quantity</label>
                  <input
                    type="number" min="1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                    value={variants[0]?.quantity || ""}
                    onChange={(e) => { const next = Number.parseInt(e.target.value, 10); setSimpleVariant({ quantity: Number.isFinite(next) ? Math.max(1, next) : 1 }); }}
                  />
                </div>
              </div>
            </div>
            {renderProductMediaCard("xl:col-span-5")}
          </div>
        )}

        {/* SECTION 4: Variants table + media */}
        {state.hasOptions && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 xl:col-span-8">
              <h4 className="text-sm font-bold text-gray-800">VARIANTS</h4>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 border-b">Variant</th>
                      <th className="px-4 py-3 border-b">SKU</th>
                      <th className="px-4 py-3 border-b">Price (₦)</th>
                      <th className="px-4 py-3 border-b">Stock</th>
                      <th className="px-4 py-3 border-b">Media</th>
                      <th className="px-4 py-3 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variants.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-5 text-center text-gray-500">No variants added yet.</td></tr>
                    )}
                    {variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-gray-50/40">
                        <td className="px-4 py-3 font-medium text-gray-900">{variantDisplayLabel(variant)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#2E6417] font-semibold whitespace-nowrap">{variantSku(variant)}</td>
                        <td className="px-4 py-3">{Number(variant.price || 0).toLocaleString("en-NG")}</td>
                        <td className="px-4 py-3">{variant.quantity || 0}</td>
                        <td className="px-4 py-3"><span className="text-xs text-gray-500">{variant.useVariantMedia ? "Variant-specific" : "Product media"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEditForm(variant)} className="text-xs font-semibold text-[#2E6417] hover:underline">Edit</button>
                            <button type="button" onClick={() => deleteVariant(variant.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button type="button" onClick={openAddForm} className="px-3 py-2 rounded-xl border border-[#2E6417]/35 text-[#2E6417] text-sm font-semibold hover:bg-[#2E6417]/5">
                + Add variant
              </button>

              {formOpen && (
                <div className="rounded-xl border border-[#E8E4DC] bg-[#f8fbf9] p-3.5 space-y-3">
                  <div className="space-y-2">
                    {variantForm.attributes.map((attribute, index) => {
                      const typeOptions = availableTypeOptionsForRow(index);
                      const selectedName = normalizeToken(attribute?.name) || typeOptions[0] || "Color";
                      const selectedValue = normalizeToken(attribute?.value);
                      const isColor = selectedName.toLowerCase() === "color";
                      const presets = getPresetOptionsForAttribute(selectedName);

                      const removeBtn = (
                        <button
                          type="button"
                          onClick={() => removeVariantTypeRow(index)}
                          disabled={variantForm.attributes.length <= 1}
                          className="self-start shrink-0 px-3 py-2 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      );

                      const isSizeWithPresets = selectedName.toLowerCase() === "size" && presets;

                      if (isSizeWithPresets) {
                        return (
                          <div key={`attr-row-${index}`} className="flex items-start gap-2">
                            <div className="flex-1 space-y-2">
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                value={selectedName}
                                onChange={(e) => {
                                  const nextName = e.target.value;
                                  setVariantForm((prev) => { const next = [...prev.attributes]; next[index] = { ...next[index], name: nextName, value: "" }; return { ...prev, attributes: next }; });
                                }}
                              >
                                {typeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              <div className="flex flex-wrap gap-1.5">
                                {presets.map((opt) => {
                                  const active = (variantForm.selectedSizes || []).includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setVariantForm((prev) => {
                                        const cur = prev.selectedSizes || [];
                                        return { ...prev, selectedSizes: active ? cur.filter((s) => s !== opt) : [...cur, opt] };
                                      })}
                                      className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                                      style={{
                                        background: active ? "#eaf2e3" : "#fff",
                                        borderColor: active ? "#2E6417" : "#e5e7eb",
                                        color: active ? "#2E6417" : "#6b7280",
                                        boxShadow: active ? "0 0 0 1.5px #2E6417" : "none",
                                      }}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {(variantForm.selectedSizes || []).length > 0 && (
                                <p className="text-[11px] text-[#2E6417] font-medium">
                                  {(variantForm.selectedSizes || []).length} size{(variantForm.selectedSizes || []).length > 1 ? "s" : ""} selected
                                  {formMode === "add" && (variantForm.selectedSizes || []).length > 1 ? " — will create one variant per size" : ""}
                                </p>
                              )}
                            </div>
                            {removeBtn}
                          </div>
                        );
                      }

                      return (
                        <div key={`attr-row-${index}`} className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <select
                              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                              value={selectedName}
                              onChange={(e) => {
                                const nextName = e.target.value;
                                setVariantForm((prev) => { const next = [...prev.attributes]; next[index] = { ...next[index], name: nextName, value: "" }; return { ...prev, attributes: next }; });
                              }}
                            >
                              {typeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>

                            {isColor ? (
                              <ColorSearchDropdown
                                idPrefix={`attr-color-${index}`}
                                value={selectedValue}
                                valueHex={variantForm.colorHex}
                                onChange={({ name, hex }) =>
                                  setVariantForm((prev) => { const next = [...prev.attributes]; next[index] = { ...next[index], name: "Color", value: name }; return { ...prev, attributes: next, colorHex: normalizeHex(hex) }; })
                                }
                              />
                            ) : presets ? (
                              <select
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                value={selectedValue}
                                onChange={(e) => setVariantForm((prev) => { const next = [...prev.attributes]; next[index] = { ...next[index], value: e.target.value }; return { ...prev, attributes: next }; })}
                              >
                                <option value="">Select</option>
                                {presets.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                placeholder="Value"
                                value={selectedValue}
                                onChange={(e) => setVariantForm((prev) => { const next = [...prev.attributes]; next[index] = { ...next[index], value: e.target.value }; return { ...prev, attributes: next }; })}
                              />
                            )}
                          </div>
                          {removeBtn}
                        </div>
                      );
                    })}
                  </div>

                  {/* Variant media */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(variantForm.useVariantMedia)}
                        onChange={(e) => setVariantForm((prev) => ({ ...prev, useVariantMedia: e.target.checked }))}
                      />
                      Add variant-specific images for this variant
                    </label>
                    {variantForm.useVariantMedia && (
                      <div className="space-y-2">
                        <input ref={variantUploadRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { uploadVariantImageFiles(e.target.files); e.target.value = ""; }} />
                        <button type="button" onClick={() => variantUploadRef.current?.click()} className="px-3 py-1.5 rounded-lg border border-[#2E6417]/35 text-[#2E6417] text-xs font-semibold hover:bg-[#2E6417]/5">
                          + Upload variant images
                        </button>
                        <p className="text-xs text-gray-500">Select a color first. Images will be linked to that color variant.</p>
                        <div className="flex flex-wrap gap-2">
                          {currentVariantMediaKeys.length === 0 && <p className="text-xs text-gray-400">No variant images yet.</p>}
                          {currentVariantMediaKeys.map((key) => {
                            const src = getMediaPreviewUrl(key);
                            if (!src) return null;
                            return <div key={key} className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200"><img src={src} alt={key} className="h-full w-full object-cover" /></div>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={addVariantTypeRow} disabled={variantForm.attributes.length >= ATTRIBUTE_OPTIONS.length} className="px-3 py-2 rounded-lg border border-[#2E6417]/35 bg-white text-xs font-semibold text-[#2E6417] hover:bg-[#2E6417]/5 disabled:opacity-40 disabled:cursor-not-allowed">
                    + Add variant type
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="number" min="0.01" placeholder="Price (required)" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" value={variantForm.price} onChange={(e) => setVariantForm((prev) => ({ ...prev, price: e.target.value }))} />
                    <input type="number" min="1" placeholder="Stock (required)" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" value={variantForm.quantity} onChange={(e) => setVariantForm((prev) => ({ ...prev, quantity: e.target.value }))} />
                  </div>

                  <div className="rounded-lg border border-[#E8E4DC] bg-white px-3 py-2 text-xs text-gray-600">
                    Variant SKU preview:{" "}
                    <span className="font-mono font-semibold text-[#2E6417]">
                      {(() => {
                        const hasSizeAttr = (variantForm.attributes || []).some((e) => normalizeToken(e?.name).toLowerCase() === "size");
                        const firstSize = hasSizeAttr ? ((variantForm.selectedSizes || [])[0] || "") : "";
                        const attrsForPreview = (variantForm.attributes || [])
                          .map((e) => {
                            if (normalizeToken(e?.name).toLowerCase() === "size") return { name: "Size", value: firstSize };
                            return { name: normalizeToken(e?.name), value: normalizeToken(e?.value) };
                          })
                          .filter((e) => e.name && e.value);
                        const { color, size } = deriveColorSizeFromAttributes(attrsForPreview);
                        if (!normalizeToken(state.baseSku)) return "Set base SKU first";
                        const preview = buildVariantSkuFromPattern(state.baseSku, variantSkuPattern, { color, size, attributes: attrsForPreview });
                        const extra = hasSizeAttr && (variantForm.selectedSizes || []).length > 1 ? ` +${(variantForm.selectedSizes || []).length - 1} more` : "";
                        return preview + extra;
                      })()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={saveVariantForm} className="px-3 py-2 rounded-lg bg-[#2E6417] text-white text-sm font-semibold hover:bg-[#245213]">
                      {formMode === "edit" ? "Save" : "Add"}
                    </button>
                    <button type="button" onClick={() => { setFormOpen(false); setEditingVariantId(null); }} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Total stock across variants: <span className="font-semibold text-gray-700">{totalStock}</span>
              </div>
            </div>

            {renderProductMediaCard("hidden xl:block xl:col-span-4")}
          </div>
        )}

        {/* Media card on mobile when variants mode active */}
        {state.hasOptions && (
          <div className="xl:hidden">
            {renderProductMediaCard()}
          </div>
        )}

      </div>

      {/* ── Mood Tags ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">When would someone wear this?</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select every occasion that fits. Buyers use these to filter products — the more accurate you are, the more people find you.
            </p>
          </div>
          {(state.moodTags || []).length > 0 && (
            <span className="shrink-0 rounded-full bg-[#2E6417]/10 px-2.5 py-1 text-xs font-semibold text-[#2E6417]">
              {(state.moodTags || []).length} selected
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {[
            { key: "owambe",         emoji: "🎉", label: "Owambe / Party",     desc: "Celebrations, weddings, and owambe events" },
            { key: "casual_chill",   emoji: "😎", label: "Casual & Everyday",  desc: "Relaxed looks for regular days" },
            { key: "office_ready",   emoji: "💼", label: "Work & Office",       desc: "Professional or business-casual settings" },
            { key: "date_night",     emoji: "🌙", label: "Date Night",          desc: "Dinner, night out, or romantic settings" },
            { key: "sunday_best",    emoji: "⛪", label: "Sunday Best",         desc: "Church, family gatherings, and worship" },
            { key: "street_trendy",  emoji: "🛹", label: "Street Style",        desc: "Bold, trendy, and fashion-forward looks" },
            { key: "soft_luxury",    emoji: "✨", label: "Soft Luxury",         desc: "Elevated, polished, and premium feel" },
            { key: "travel_weekend", emoji: "✈️", label: "Travel & Outings",    desc: "Trips, picnics, and weekend activities" },
          ].map(({ key, emoji, label, desc }) => {
            const selected = (state.moodTags || []).includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const current = state.moodTags || [];
                  const next = selected ? current.filter((t) => t !== key) : [...current, key];
                  dispatch({ type: "SET_MOOD_TAGS", payload: next });
                }}
                className="relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all"
                style={{
                  background: selected ? "#eaf2e3" : "#fff",
                  borderColor: selected ? "#2E6417" : "#e5e7eb",
                  boxShadow: selected ? "0 0 0 1.5px #2E6417" : "none",
                }}
              >
                {selected && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E6417] text-white text-[10px] font-bold">✓</span>
                )}
                <span className="text-xl leading-none">{emoji}</span>
                <span className="text-xs font-bold mt-1" style={{ color: selected ? "#2E6417" : "#111827" }}>{label}</span>
                <span className="text-[11px] leading-snug text-gray-400">{desc}</span>
              </button>
            );
          })}
        </div>

        {(state.moodTags || []).length === 0 && (
          <p className="text-xs text-amber-600 font-medium">Tip: products tagged with moods appear in more discovery feeds.</p>
        )}
      </div>

      <WizardNav
        showBack={true}
        showCancel={false}
        onBack={goBack}
        onNext={handleNext}
        nextLabel="Continue to Specs"
      />
    </WizardShell>
  );
}