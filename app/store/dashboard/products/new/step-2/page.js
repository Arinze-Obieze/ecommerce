"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { buildSkuCode, buildVariantSku, COLORS_LIST, getColorSwatch, getSizeOptions, MATERIALS } from "@/lib/product-wizard-constants";
import { useToast } from "@/contexts/ToastContext";

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
  if (values.length) {
    return values.join(" / ");
  }

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
    if (file.size > 10 * 1024 * 1024) {
      showError("Images must be 10 MB or smaller.");
      return;
    }

    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isImage) {
      showError("Upload JPG, PNG, or WebP files only.");
      return;
    }

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

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

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
        onClick={() => {
          setQuery(value || "");
          setOpen(true);
          setCustomMode(false);
        }}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-[#2E5C45]/40"
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-4 w-4 shrink-0 rounded-full border border-gray-300" style={{ backgroundColor: selectedSwatch }} />
          <span className={value ? "text-gray-900" : "text-gray-400"}>{value || "Select color"}</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-60 bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-6 max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h5 className="text-sm font-bold text-gray-800">Choose color</h5>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">✕</button>
            </div>
            <div className="space-y-3 p-4">
              <input
                id={`${idPrefix}-input`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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
                          onClick={() => {
                            onChange({ name: color.name, hex: color.hex || "" });
                            setQuery(color.name);
                            setCustomMode(false);
                            setOpen(false);
                          }}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                            selected ? "border-[#2E5C45] bg-[#2E5C45]/10 text-[#2E5C45]" : "border-gray-200 bg-white text-gray-700 hover:border-[#2E5C45]/40"
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
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ name: "", hex: "" });
                      setQuery("");
                      setOpen(false);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMode(true);
                      setCustomName(String(query || "").trim());
                      setCustomHex(normalizeHex(valueHex) || "#9CA3AF");
                    }}
                    className="flex-1 rounded-lg border border-[#2E5C45]/30 bg-[#2E5C45]/5 px-3 py-2 text-left text-xs font-semibold text-[#2E5C45] hover:bg-[#2E5C45]/10"
                  >
                    + Add custom color
                  </button>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-[#2E5C45]/20 bg-[#2E5C45]/5 p-2">
                  <p className="text-xs font-semibold text-gray-700">Custom color</p>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <input
                      value={customName}
                      onChange={(event) => setCustomName(event.target.value)}
                      placeholder="Color name"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="color"
                      value={customHex}
                      onChange={(event) => setCustomHex(event.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                      title="Pick swatch"
                    />
                    <input
                      value={customHex.toUpperCase()}
                      onChange={(event) => {
                        const next = event.target.value.toUpperCase();
                        setCustomHex(next.startsWith("#") ? next : `#${next}`);
                      }}
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
                        setQuery(next);
                        setCustomMode(false);
                        setOpen(false);
                      }}
                      disabled={!String(customName || "").trim() || !customHexValid}
                      className="rounded-lg bg-[#2E5C45] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add custom color
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomMode(false)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                    >
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
  });

  const [productImageOrder, setProductImageOrder] = useState([]);
  const [productImageTags, setProductImageTags] = useState({});
  const [editingProductTagKey, setEditingProductTagKey] = useState("");

  const productUploadRef = useRef(null);
  const variantUploadRef = useRef(null);
  const dragKeyRef = useRef("");

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

    if (changed) {
      dispatch({ type: "SET_VARIANTS", payload: normalized });
    }
  }, [dispatch, state.variants]);

  const variants = useMemo(() => (state.variants || []).map((v) => normalizeExistingVariant(v)), [state.variants]);

  const hasMedia = (key) => Boolean(state.images?.[key] || state.persistedImages?.[key]);

  const productImageKeys = useMemo(() => {
    const all = Object.keys({ ...(state.persistedImages || {}), ...(state.imagePreviews || {}) });
    return all.filter((key) => key.startsWith("general_"));
  }, [state.imagePreviews, state.persistedImages]);
  const productImageCount = productImageKeys.length;

  useEffect(() => {
    setProductImageOrder((prev) => {
      const validPrev = prev.filter((key) => productImageKeys.includes(key));
      const nextKeys = productImageKeys.filter((key) => !validPrev.includes(key));
      return [...validPrev, ...nextKeys];
    });
  }, [productImageKeys]);

  const nextProductImageKey = () => {
    if (!hasMedia("general_front")) return "general_front";
    if (!hasMedia("general_back")) return "general_back";

    let i = 1;
    while (hasMedia(`general_extra_${i}`)) i += 1;
    return `general_extra_${i}`;
  };

  const uploadSingle = (key, file, preview) => {
    dispatch({ type: "SET_IMAGE", key, file, preview });
  };

  const handleUploadProductImages = (files) => {
    uploadImageFiles(
      files,
      nextProductImageKey,
      (key, file, preview) => uploadSingle(key, file, preview),
      showError
    );
  };

  const setVariants = (next) => {
    dispatch({ type: "SET_VARIANTS", payload: next });
  };

  const setSimpleVariant = (patch) => {
    const base = variants[0] ? normalizeExistingVariant(variants[0]) : {
      id: makeVariantId(),
      color: "",
      colorHex: "",
      size: "OS",
      attr1Name: "Color",
      attr1Value: "",
      attr2Name: "Size",
      attr2Value: "OS",
      attributes: [{ name: "Color", value: "" }, { name: "Size", value: "OS" }],
      price: 0,
      quantity: 0,
      useVariantMedia: false,
    };
    setVariants([{ ...base, ...patch }]);
  };

  const updateVariantField = (variantId, field, value) => {
    setVariants(variants.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)));
  };

  const deleteVariant = (variantId) => {
    const next = variants.filter((variant) => variant.id !== variantId);
    setVariants(next);

    if (editingVariantId === variantId) {
      setEditingVariantId(null);
      setFormOpen(false);
    }
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingVariantId(null);
    setVariantForm({
      attributes: [{ name: "Color", value: "" }],
      colorHex: "",
      price: "",
      quantity: "",
      useVariantMedia: false,
    });
    setFormOpen(true);
  };

  const openEditForm = (variant) => {
    setFormMode("edit");
    setEditingVariantId(variant.id);
    const normalized = normalizeExistingVariant(variant);
    setVariantForm({
      attributes: normalized.attributes || [{ name: "Color", value: "" }],
      colorHex: normalized.colorHex || "",
      price: String(normalized.price || ""),
      quantity: String(normalized.quantity || ""),
      useVariantMedia: Boolean(normalized.useVariantMedia),
    });
    setFormOpen(true);
  };

  const availableTypeOptionsForRow = (index) => {
    const selectedElsewhere = variantForm.attributes
      .filter((_, i) => i !== index)
      .map((entry) => String(entry?.name || "").toLowerCase());
    return ATTRIBUTE_OPTIONS.filter((option) => !selectedElsewhere.includes(option.toLowerCase()));
  };

  const addVariantTypeRow = () => {
    const used = variantForm.attributes.map((entry) => String(entry?.name || "").toLowerCase());
    const nextType = ATTRIBUTE_OPTIONS.find((option) => !used.includes(option.toLowerCase()));
    if (!nextType) return;
    setVariantForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: nextType, value: "" }],
    }));
  };

  const removeVariantTypeRow = (index) => {
    setVariantForm((prev) => {
      const next = prev.attributes.filter((_, i) => i !== index);
      return { ...prev, attributes: next.length ? next : [{ name: "Color", value: "" }] };
    });
  };

  const getCurrentFormColor = () => {
    const colorEntry = (variantForm.attributes || []).find((entry) => String(entry?.name || "").toLowerCase() === "color");
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
    if (!colorName) {
      showError("Select a Color value before uploading variant images.");
      return;
    }
    const safe = colorName.replace(/\s+/g, "_");
    const existing = getVariantMediaKeysForColor(colorName);
    let extraIndex = 1;
    while (existing.some((key) => key === `variant_${safe}_extra_${extraIndex}`)) extraIndex += 1;

    uploadImageFiles(
      files,
      () => {
        if (!hasMedia(`variant_${safe}_front`)) return `variant_${safe}_front`;
        if (!hasMedia(`variant_${safe}_back`)) return `variant_${safe}_back`;
        const key = `variant_${safe}_extra_${extraIndex}`;
        extraIndex += 1;
        return key;
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
    const attributes = (variantForm.attributes || [])
      .map((entry) => ({ name: normalizeToken(entry?.name), value: normalizeToken(entry?.value) }))
      .filter((entry) => entry.name);
    const hasColorType = attributes.some((entry) => entry.name.toLowerCase() === "color");

    if (!hasColorType) {
      showError("Add Color as one of the variant types.");
      return;
    }

    const duplicateType = attributes.some((entry, index) =>
      attributes.findIndex((x) => x.name.toLowerCase() === entry.name.toLowerCase()) !== index
    );
    if (duplicateType) {
      showError("Variant types must not repeat.");
      return;
    }

    const missingValue = attributes.find((entry) => !entry.value);
    if (missingValue) {
      showError(`Enter a value for ${missingValue.name}.`);
      return;
    }

    const colorEntry = attributes.find((entry) => entry.name.toLowerCase() === "color");
    if (!colorEntry?.value) {
      showError("Select a color.");
      return;
    }

    const { color, size } = deriveColorSizeFromAttributes(attributes);

    const price = Number.parseFloat(variantForm.price || "0") || 0;
    const quantity = Number.parseInt(variantForm.quantity || "0", 10) || 0;

    if (!attributes.length) {
      showError("Add at least one attribute value.");
      return;
    }
    if (!(price > 0)) {
      showError("Price must be greater than 0.");
      return;
    }
    if (!(quantity >= 1)) {
      showError("Stock must be at least 1.");
      return;
    }

    const nextVariant = {
      id: editingVariantId || makeVariantId(),
      color,
      colorHex: normalizeToken(variantForm.colorHex),
      size,
      attr1Name: attributes[0]?.name || "Color",
      attr1Value: attributes[0]?.value || "",
      attr2Name: attributes[1]?.name || "",
      attr2Value: attributes[1]?.value || "",
      attributes,
      price,
      quantity,
      useVariantMedia: Boolean(variantForm.useVariantMedia),
    };

    const duplicate = variants.some((variant) => {
      if (formMode === "edit" && variant.id === editingVariantId) return false;
      return variantKey(variant.color, variant.size) === variantKey(nextVariant.color, nextVariant.size);
    });

    if (duplicate) {
      showError("This variant combination already exists.");
      return;
    }

    if (formMode === "edit") {
      setVariants(variants.map((variant) => (variant.id === editingVariantId ? nextVariant : variant)));
    } else {
      setVariants([...variants, nextVariant]);
    }

    setFormOpen(false);
    setEditingVariantId(null);
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
      if (!normalizeToken(variant.color) || variant.color === "Default") {
        return `Select a color for ${variantDisplayLabel(variant)}.`;
      }
    }
    if (productImageCount < 2) {
      return "Upload at least 2 product images.";
    }
  
    return null;
  };

  const handleNext = () => {
    const error = validate();
    if (error) {
      showError(error);
      return;
    }
    goNext();
  };

  const totalStock = variants.reduce((sum, variant) => sum + (Number.parseInt(variant.quantity, 10) || 0), 0);
  const renderProductMediaCard = (extraClassName = "") => (
    <div className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 ${extraClassName}`}>
      <h4 className="text-sm font-bold text-gray-800">SECTION 5: PRODUCT MEDIA</h4>
      <div className="rounded-xl border border-[#dbe7e0] bg-[#f8fbf9] px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-600">
          Upload product-level images here. <span className="font-semibold text-gray-800">Minimum 2 images are required</span> before you can continue.
        </p>
      </div>
      <p className="text-xs text-gray-500">
        Uploaded: <span className="font-semibold text-gray-700">{productImageCount}</span> / 2 minimum
      </p>

      <>
        <input
          ref={productUploadRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            handleUploadProductImages(event.target.files);
            event.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => productUploadRef.current?.click()}
          className="px-3 py-2 rounded-xl border border-[#2E5C45]/35 text-[#2E5C45] text-sm font-semibold hover:bg-[#2E5C45]/5"
        >
          + Upload images
        </button>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {productImageOrder.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 px-3 py-5 text-sm text-gray-500 min-w-[180px]">
              No product images yet.
            </div>
          )}

          {productImageOrder.map((key) => (
            <div
              key={key}
              draggable
              onDragStart={() => { dragKeyRef.current = key; }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                const from = dragKeyRef.current;
                if (!from || from === key) return;
                setProductImageOrder((prev) => {
                  const list = [...prev];
                  const fromIndex = list.indexOf(from);
                  const toIndex = list.indexOf(key);
                  if (fromIndex === -1 || toIndex === -1) return prev;
                  list.splice(fromIndex, 1);
                  list.splice(toIndex, 0, from);
                  return list;
                });
              }}
              className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border ${editingProductTagKey === key ? "border-[#2E5C45]" : "border-gray-200"}`}
            >
              <button type="button" onClick={() => setEditingProductTagKey(key)} className="h-full w-full">
                <img src={state.imagePreviews[key]} alt={key} className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "REMOVE_IMAGE", key })}
                className="absolute top-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white"
              >
                x
              </button>
            </div>
          ))}
        </div>

        {editingProductTagKey && (
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Image tags (optional)</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              placeholder="Front, Back, Detail, Size chart"
              value={productImageTags[editingProductTagKey] || ""}
              onChange={(event) => setProductImageTags((prev) => ({ ...prev, [editingProductTagKey]: event.target.value }))}
            />
          </div>
        )}
      </>
    </div>
  );
  return (
    <WizardShell
      title="Variants, Pricing, Inventory & Media"
      subtitle="Configure mode, SKU, inventory, and product/variant media in one flow."
    >
      <div className="space-y-5">
        <div className={`grid gap-4 ${state.hasOptions ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
          <h4 className="text-sm font-bold text-gray-800">SECTION 1: PRODUCT MODE</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_HAS_OPTIONS", payload: false })}
              className={`text-left rounded-xl border p-3 transition-colors ${
                !state.hasOptions ? "border-[#2E5C45] bg-[#2E5C45]/5" : "border-gray-200 bg-white hover:border-[#2E5C45]/35"
              }`}
            >
              <p className="text-sm font-bold text-gray-900"> Simple product</p>
              <p className="text-xs text-gray-500 mt-1">For products with one varient</p>
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: "SET_HAS_OPTIONS", payload: true })}
              className={`text-left rounded-xl border p-3 transition-colors ${
                state.hasOptions ? "border-[#2E5C45] bg-[#2E5C45]/5" : "border-gray-200 bg-white hover:border-[#2E5C45]/35"
              }`}
            >
              <p className="text-sm font-bold text-gray-900">Advanced (variants)</p>
              <p className="text-xs text-gray-500 mt-1">Add variants by color, size, or other attributes. Each variant has its own price and stock.</p>
            </button>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 ${state.hasOptions ? "lg:col-span-2" : ""}`}>
          <h4 className="text-sm font-bold text-gray-800">SECTION 2: SKU FIELD</h4>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">
                {state.hasOptions ? "Base SKU" : "SKU"} <span className="text-red-400">*</span>
              </label>
              {!skuOverride ? (
                <button type="button" onClick={() => setSkuOverride(true)} className="text-xs font-semibold text-[#2E5C45] hover:underline">
                  Edit manually
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSkuOverride(false);
                    dispatch({ type: "SET_BASIC_INFO", payload: { baseSku: autoSku } });
                  }}
                  className="text-xs font-semibold text-gray-500 hover:underline"
                >
                  Reset auto
                </button>
              )}
            </div>

            <input
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono font-semibold tracking-wide focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45] uppercase"
              value={state.baseSku || ""}
              onChange={(event) => {
                setSkuOverride(true);
                dispatch({ type: "SET_BASIC_INFO", payload: { baseSku: event.target.value.toUpperCase() } });
              }}
              placeholder={autoSku || "ZVA-XXXX-XXXX-0001"}
            />
          </div>

          {state.hasOptions && (<></>
            // <div>
            //   <label className="text-sm font-semibold text-gray-700 block mb-1.5">Variant SKU pattern (optional)</label>
            //   <input
            //     className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]"
            //     value={variantSkuPattern}
            //     onChange={(event) => dispatch({ type: "SET_BASIC_INFO", payload: { variantSkuPattern: event.target.value } })}
            //     placeholder="BASE-{color}-{size}"
            //   />
            //   <p className="mt-1 text-xs text-gray-500">Use {"{color}"}, {"{size}"}, {"{attribute}"} to auto-generate variant SKUs.</p>
            // </div>
          )}
        </div>
        </div>

        {!state.hasOptions && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 xl:col-span-7">
            <h4 className="text-sm font-bold text-gray-800">SECTION 3: PRICING & INVENTORY</h4>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color <span className="text-red-400">*</span></label>
              <ColorSearchDropdown
                value={variants[0]?.color === "Default" ? "" : variants[0]?.color || ""}
                valueHex={variants[0]?.colorHex || ""}
                onChange={({ name, hex }) => {
                  setSimpleVariant({
                    color: name,
                    colorHex: normalizeHex(hex),
                    attr1Name: "Color",
                    attr1Value: name,
                    attributes: [{ name: "Color", value: name }, { name: "Size", value: "OS" }],
                  });
                }}
                idPrefix="simple-color"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₦)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  value={variants[0]?.price || ""}
                  onChange={(event) => {
                    const next = Number.parseFloat(event.target.value);
                    setSimpleVariant({
                      price: Number.isFinite(next) ? Math.max(0, next) : 0,
                    });
                  }}
                />
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock quantity</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  value={variants[0]?.quantity || ""}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    setSimpleVariant({
                      quantity: Number.isFinite(next) ? Math.max(1, next) : 1,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          {renderProductMediaCard("xl:col-span-5")}
          </div>
        )}

        {state.hasOptions && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 xl:col-span-8">
            <h4 className="text-sm font-bold text-gray-800">SECTION 4: VARIANTS TABLE</h4>

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
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-center text-gray-500">No variants added yet.</td>
                    </tr>
                  )}

                  {variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50/40">
                      <td className="px-4 py-3 font-medium text-gray-900">{variantDisplayLabel(variant)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#2E5C45] font-semibold whitespace-nowrap">{variantSku(variant)}</td>
                      <td className="px-4 py-3">{Number(variant.price || 0).toLocaleString("en-NG")}</td>
                      <td className="px-4 py-3">{variant.quantity || 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {variant.useVariantMedia ? "Variant-specific media" : "Uses product media"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEditForm(variant)} className="text-xs font-semibold text-[#2E5C45] hover:underline">Edit</button>
                          <button type="button" onClick={() => deleteVariant(variant.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <button
                type="button"
                onClick={openAddForm}
                className="px-3 py-2 rounded-xl border border-[#2E5C45]/35 text-[#2E5C45] text-sm font-semibold hover:bg-[#2E5C45]/5"
              >
                + Add variant
              </button>
            </div>

            {formOpen && (
              <div className="rounded-xl border border-[#dbe7e0] bg-[#f8fbf9] p-3.5 space-y-3">
                <div className="space-y-2">
                  {variantForm.attributes.map((attribute, index) => {
                    const typeOptions = availableTypeOptionsForRow(index);
                    const selectedName = normalizeToken(attribute?.name) || typeOptions[0] || "Color";
                    const selectedValue = normalizeToken(attribute?.value);
                    const isColor = selectedName.toLowerCase() === "color";
                    const presets = getPresetOptionsForAttribute(selectedName);

                    return (
                      <div key={`attr-row-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            value={selectedName}
                            onChange={(event) => {
                              const nextName = event.target.value;
                              setVariantForm((prev) => {
                                const next = [...prev.attributes];
                                next[index] = { ...next[index], name: nextName, value: "" };
                                return { ...prev, attributes: next };
                              });
                            }}
                          >
                            {typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                          {isColor ? (
                            <ColorSearchDropdown
                              compact
                              idPrefix={`attr-color-${index}`}
                              value={selectedValue}
                              valueHex={variantForm.colorHex}
                              onChange={({ name, hex }) =>
                                setVariantForm((prev) => {
                                  const next = [...prev.attributes];
                                  next[index] = { ...next[index], name: "Color", value: name };
                                  return { ...prev, attributes: next, colorHex: normalizeHex(hex) };
                                })
                              }
                            />
                          ) : presets ? (
                            <select
                              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                              value={selectedValue}
                              onChange={(event) =>
                                setVariantForm((prev) => {
                                  const next = [...prev.attributes];
                                  next[index] = { ...next[index], value: event.target.value };
                                  return { ...prev, attributes: next };
                                })
                              }
                            >
                              <option value="">Select</option>
                              {presets.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          ) : (
                            <input
                              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                              placeholder="Value"
                              value={selectedValue}
                              onChange={(event) =>
                                setVariantForm((prev) => {
                                  const next = [...prev.attributes];
                                  next[index] = { ...next[index], value: event.target.value };
                                  return { ...prev, attributes: next };
                                })
                              }
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariantTypeRow(index)}
                          disabled={variantForm.attributes.length <= 1}
                          className="px-3 py-2 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Remove type
                        </button>
                      </div>
                    );
                  })}

                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(variantForm.useVariantMedia)}
                      onChange={(event) => setVariantForm((prev) => ({ ...prev, useVariantMedia: event.target.checked }))}
                    />
                    Add variant-specific images for this variant
                  </label>
                  {variantForm.useVariantMedia && (
                    <div className="space-y-2">
                      <input
                        ref={variantUploadRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          uploadVariantImageFiles(event.target.files);
                          event.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => variantUploadRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-[#2E5C45]/35 text-[#2E5C45] text-xs font-semibold hover:bg-[#2E5C45]/5"
                      >
                        + Upload variant images
                      </button>
                      <p className="text-xs text-gray-500">Select a color first. Uploaded images will be linked to that color variant.</p>
                      <div className="flex flex-wrap gap-2">
                        {currentVariantMediaKeys.length === 0 && (
                          <p className="text-xs text-gray-400">No variant image preview yet.</p>
                        )}
                        {currentVariantMediaKeys.map((key) => {
                          const src = getMediaPreviewUrl(key);
                          if (!src) return null;
                          return (
                            <div key={key} className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                              <img src={src} alt={key} className="h-full w-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={addVariantTypeRow}
                  disabled={variantForm.attributes.length >= ATTRIBUTE_OPTIONS.length}
                  className="px-3 py-2 rounded-lg border border-[#2E5C45]/35 bg-white text-xs font-semibold text-[#2E5C45] hover:bg-[#2E5C45]/5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Add variant type
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0.01"
                    placeholder="Price (required)"
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    value={variantForm.price}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, price: event.target.value }))}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Stock (required)"
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    value={variantForm.quantity}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  />
                </div>

                <div className="rounded-lg border border-[#dbe7e0] bg-white px-3 py-2 text-xs text-gray-600">
                  Variant SKU preview:{" "}
                  <span className="font-mono font-semibold text-[#2E5C45]">
                    {(() => {
                      const normalizedAttributes = (variantForm.attributes || [])
                        .map((entry) => ({ name: normalizeToken(entry?.name), value: normalizeToken(entry?.value) }))
                        .filter((entry) => entry.name && entry.value);
                      const { color, size } = deriveColorSizeFromAttributes(normalizedAttributes);
                      if (!normalizeToken(state.baseSku)) return "Set base SKU first";
                      return buildVariantSkuFromPattern(state.baseSku, variantSkuPattern, { color, size, attributes: normalizedAttributes });
                    })()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={saveVariantForm} className="px-3 py-2 rounded-lg bg-[#2E5C45] text-white text-sm font-semibold hover:bg-[#254a38]">
                    {formMode === "edit" ? "Save" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingVariantId(null);
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">Total stock across variants: <span className="font-semibold text-gray-700">{totalStock}</span></div>
          </div>
          {renderProductMediaCard("hidden xl:block xl:col-span-4")}
          </div>
        )}

        {state.hasOptions && (
          <div className="xl:hidden">
            {renderProductMediaCard()}
          </div>
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
