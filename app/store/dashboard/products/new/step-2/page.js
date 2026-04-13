"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { buildSkuCode, buildVariantSku } from "@/lib/product-wizard-constants";
import { useToast } from "@/contexts/ToastContext";

const ATTRIBUTE_OPTIONS = ["Color", "Size", "Material", "Style", "Pattern", "Attribute"];

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
  const attr1Name = normalizeToken(variant.attr1Name) || "Color";
  const attr1Value = normalizeToken(variant.attr1Value) || normalizeToken(variant.color) || "";
  const attr2Name = normalizeToken(variant.attr2Name) || "Size";
  const attr2Value = normalizeToken(variant.attr2Value) || normalizeToken(variant.size) || "";

  return {
    id: variant.id || makeVariantId(),
    color: normalizeToken(variant.color) || "Default",
    size: normalizeToken(variant.size) || "OS",
    price: Number(variant.price || 0),
    quantity: Number.parseInt(variant.quantity, 10) || 0,
    attr1Name,
    attr1Value,
    attr2Name,
    attr2Value,
    useVariantMedia: Boolean(variant.useVariantMedia),
  };
}

function deriveColorSizeFromAttributes(attr1Name, attr1Value, attr2Name, attr2Value) {
  const entries = [
    { name: normalizeToken(attr1Name), value: normalizeToken(attr1Value) },
    { name: normalizeToken(attr2Name), value: normalizeToken(attr2Value) },
  ].filter((entry) => entry.value);

  let color = "";
  let size = "";

  entries.forEach((entry) => {
    const lower = entry.name.toLowerCase();
    if (lower === "color" && !color) color = entry.value;
    if (lower === "size" && !size) size = entry.value;
  });

  if (!color && entries[0]) color = entries[0].value;
  if (!size && entries[1]) size = entries[1].value;
  if (!size && entries[0]) size = entries[0].value;

  return {
    color: color || "Default",
    size: size || "OS",
  };
}

function variantDisplayLabel(variant) {
  const p1 = normalizeToken(variant.attr1Value);
  const p2 = normalizeToken(variant.attr2Value);
  if (p1 || p2) {
    return [p1, p2].filter(Boolean).join(" / ");
  }

  const c = variant.color === "Default" ? null : variant.color;
  const s = variant.size === "OS" ? null : variant.size;
  return [c, s].filter(Boolean).join(" / ") || "Default";
}

function buildVariantSkuFromPattern(baseSku, pattern, variant) {
  const fallback = buildVariantSku(baseSku, variant.color === "Default" ? "" : variant.color, variant.size === "OS" ? "" : variant.size);
  const cleanPattern = normalizeToken(pattern);
  if (!cleanPattern) return fallback;

  const attrText = [normalizeToken(variant.attr1Value), normalizeToken(variant.attr2Value)].filter(Boolean).join("-");
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

export default function Step2() {
  const { state, dispatch, storeContext, goNext, goBack } = useWizard();
  const { error: showError } = useToast();

  const [skuOverride, setSkuOverride] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [mediaEditingVariantId, setMediaEditingVariantId] = useState(null);

  const [variantForm, setVariantForm] = useState({
    attr1Name: "Color",
    attr1Value: "",
    attr2Name: "Size",
    attr2Value: "",
    price: "",
    quantity: "",
  });

  const [productImageOrder, setProductImageOrder] = useState([]);
  const [variantImageOrder, setVariantImageOrder] = useState({});
  const [productImageTags, setProductImageTags] = useState({});
  const [editingProductTagKey, setEditingProductTagKey] = useState("");
  const [showProductMediaManager, setShowProductMediaManager] = useState(false);

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
    dispatch({ type: "SET_IMAGE_STRATEGY", payload: "general" });
  }, [dispatch]);

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
          variant.useVariantMedia !== Boolean(current.useVariantMedia)
        );
      });

    if (changed) {
      dispatch({ type: "SET_VARIANTS", payload: normalized });
    }
  }, [dispatch, state.variants]);

  useEffect(() => {
    if (state.hasOptions) return;

    const first = normalizeExistingVariant(state.variants?.[0]);
    const simple = [{
      ...first,
      color: "Default",
      size: "OS",
      attr1Name: "Color",
      attr1Value: "Default",
      attr2Name: "Size",
      attr2Value: "OS",
    }];

    dispatch({ type: "SET_VARIANTS", payload: simple });
  }, [dispatch, state.hasOptions]);

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

  const variantMediaKeysFor = (variantId) => {
    const prefix = `variant_item_${variantId}_`;
    const all = Object.keys({ ...(state.persistedImages || {}), ...(state.imagePreviews || {}) });
    return all.filter((key) => key.startsWith(prefix));
  };

  useEffect(() => {
    const nextMap = {};
    variants.forEach((variant) => {
      const keys = variantMediaKeysFor(variant.id);
      const prev = variantImageOrder[variant.id] || [];
      const kept = prev.filter((key) => keys.includes(key));
      const added = keys.filter((key) => !kept.includes(key));
      nextMap[variant.id] = [...kept, ...added];
    });
    setVariantImageOrder(nextMap);
  }, [state.imagePreviews, state.persistedImages, variants]);

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

  const currentMediaVariant = variants.find((variant) => variant.id === mediaEditingVariantId) || null;

  const nextVariantImageKey = (variantId) => {
    const keys = variantMediaKeysFor(variantId);
    let i = 1;
    while (keys.includes(`variant_item_${variantId}_${i}`)) i += 1;
    return `variant_item_${variantId}_${i}`;
  };

  const handleUploadVariantImages = (variantId, files) => {
    uploadImageFiles(
      files,
      () => nextVariantImageKey(variantId),
      (key, file, preview) => uploadSingle(key, file, preview),
      showError
    );
  };

  const setVariants = (next) => {
    dispatch({ type: "SET_VARIANTS", payload: next });
  };

  const updateVariantField = (variantId, field, value) => {
    setVariants(variants.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)));
  };

  const deleteVariant = (variantId) => {
    const next = variants.filter((variant) => variant.id !== variantId);
    setVariants(next);

    const keys = variantMediaKeysFor(variantId);
    keys.forEach((key) => dispatch({ type: "REMOVE_IMAGE", key }));

    if (mediaEditingVariantId === variantId) setMediaEditingVariantId(null);
    if (editingVariantId === variantId) {
      setEditingVariantId(null);
      setFormOpen(false);
    }
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingVariantId(null);
    setVariantForm({
      attr1Name: "Color",
      attr1Value: "",
      attr2Name: "Size",
      attr2Value: "",
      price: "",
      quantity: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (variant) => {
    setFormMode("edit");
    setEditingVariantId(variant.id);
    setVariantForm({
      attr1Name: variant.attr1Name || "Color",
      attr1Value: variant.attr1Value || "",
      attr2Name: variant.attr2Name || "Size",
      attr2Value: variant.attr2Value || "",
      price: String(variant.price || ""),
      quantity: String(variant.quantity || ""),
    });
    setFormOpen(true);
  };

  const saveVariantForm = () => {
    const { color, size } = deriveColorSizeFromAttributes(
      variantForm.attr1Name,
      variantForm.attr1Value,
      variantForm.attr2Name,
      variantForm.attr2Value
    );

    const price = Number.parseFloat(variantForm.price || "0") || 0;
    const quantity = Number.parseInt(variantForm.quantity || "0", 10) || 0;

    if (!normalizeToken(variantForm.attr1Value) && !normalizeToken(variantForm.attr2Value)) {
      showError("Add at least one attribute value.");
      return;
    }

    const nextVariant = {
      id: editingVariantId || makeVariantId(),
      color,
      size,
      attr1Name: normalizeToken(variantForm.attr1Name) || "Attribute",
      attr1Value: normalizeToken(variantForm.attr1Value),
      attr2Name: normalizeToken(variantForm.attr2Name) || "Attribute",
      attr2Value: normalizeToken(variantForm.attr2Value),
      price,
      quantity,
      useVariantMedia: formMode === "edit"
        ? Boolean(variants.find((variant) => variant.id === editingVariantId)?.useVariantMedia)
        : false,
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

  const hasVariantCustomMedia = (variant) => {
    if (!variant.useVariantMedia) return false;
    const keys = variantMediaKeysFor(variant.id);
    return keys.some((key) => hasMedia(key));
  };

  const validate = () => {
    if (!normalizeToken(state.baseSku)) return "SKU is required.";

    if (!hasMedia("general_front") || !hasMedia("general_back")) {
      return "Upload at least two product images (first two act as required cover images).";
    }

    if (!variants.length) return "Add at least one variant.";

    for (const variant of variants) {
      if (!(variant.price > 0)) return `Set price for ${variantDisplayLabel(variant)}.`;
      if (!(variant.quantity > 0)) return `Set stock for ${variantDisplayLabel(variant)}.`;

      if (variant.useVariantMedia) {
        const keys = variantMediaKeysFor(variant.id);
        if (!keys.length) return `Upload variant-specific images for ${variantDisplayLabel(variant)} or use product images.`;
      }
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

  return (
    <WizardShell
      title="Variants, Pricing, Inventory & Media"
      subtitle="Configure mode, SKU, inventory, and product/variant media in one flow."
    >
      <div className="space-y-5">
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

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
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

          {state.hasOptions && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Variant SKU pattern (optional)</label>
              <input
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]"
                value={variantSkuPattern}
                onChange={(event) => dispatch({ type: "SET_BASIC_INFO", payload: { variantSkuPattern: event.target.value } })}
                placeholder="BASE-{color}-{size}"
              />
              <p className="mt-1 text-xs text-gray-500">Use {"{color}"}, {"{size}"}, {"{attribute}"} to auto-generate variant SKUs.</p>
            </div>
          )}
        </div>

        {!state.hasOptions && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
            <h4 className="text-sm font-bold text-gray-800">SECTION 3: PRICING & INVENTORY</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  value={variants[0]?.price || ""}
                  onChange={(event) => updateVariantField(variants[0]?.id, "price", Number.parseFloat(event.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock quantity</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  value={variants[0]?.quantity || ""}
                  onChange={(event) => updateVariantField(variants[0]?.id, "quantity", Number.parseInt(event.target.value, 10) || 0)}
                />
              </div>
            </div>
          </div>
        )}

        {state.hasOptions && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
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
                        <button
                          type="button"
                          onClick={() => setMediaEditingVariantId((prev) => (prev === variant.id ? null : variant.id))}
                          className="text-sm font-semibold text-[#2E5C45] hover:underline"
                        >
                          {hasVariantCustomMedia(variant) ? "📷" : "—"}
                        </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      value={variantForm.attr1Name}
                      onChange={(event) => setVariantForm((prev) => ({ ...prev, attr1Name: event.target.value }))}
                    >
                      {ATTRIBUTE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <input
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      placeholder="Value"
                      value={variantForm.attr1Value}
                      onChange={(event) => setVariantForm((prev) => ({ ...prev, attr1Value: event.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      value={variantForm.attr2Name}
                      onChange={(event) => setVariantForm((prev) => ({ ...prev, attr2Name: event.target.value }))}
                    >
                      <option value="">Optional</option>
                      {ATTRIBUTE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <input
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      placeholder="Optional value"
                      value={variantForm.attr2Value}
                      onChange={(event) => setVariantForm((prev) => ({ ...prev, attr2Value: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Price (optional)"
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    value={variantForm.price}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, price: event.target.value }))}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock (optional)"
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    value={variantForm.quantity}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  />
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
        )}

        {state.hasOptions && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
            <h4 className="text-sm font-bold text-gray-800">SECTION 5: MEDIA (PRODUCT LEVEL)</h4>
            <div className="rounded-xl border border-[#dbe7e0] bg-[#f8fbf9] px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-gray-600">
                Using <span className="font-semibold text-gray-800">{productImageCount}</span> product image{productImageCount === 1 ? "" : "s"} from Step 1.
              </p>
              <button
                type="button"
                onClick={() => setShowProductMediaManager((prev) => !prev)}
                className="text-xs font-semibold text-[#2E5C45] hover:underline"
              >
                {showProductMediaManager ? "Hide image manager" : "Manage product images"}
              </button>
            </div>

            {showProductMediaManager && (
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
            )}
          </div>
        )}

        {state.hasOptions && currentMediaVariant && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
            <h4 className="text-sm font-bold text-gray-800">SECTION 6: VARIANT MEDIA OVERRIDE</h4>
            <p className="text-sm text-gray-700">For variant: <span className="font-semibold">{variantDisplayLabel(currentMediaVariant)}</span></p>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name={`media_${currentMediaVariant.id}`}
                  checked={!currentMediaVariant.useVariantMedia}
                  onChange={() => updateVariantField(currentMediaVariant.id, "useVariantMedia", false)}
                />
                <span>[ ◉ ] Use product images (default)</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name={`media_${currentMediaVariant.id}`}
                  checked={Boolean(currentMediaVariant.useVariantMedia)}
                  onChange={() => updateVariantField(currentMediaVariant.id, "useVariantMedia", true)}
                />
                <span>[ ○ ] Use variant-specific images instead</span>
              </label>
            </div>

            {currentMediaVariant.useVariantMedia && (
              <>
                <input
                  ref={variantUploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleUploadVariantImages(currentMediaVariant.id, event.target.files);
                    event.target.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={() => variantUploadRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-[#2E5C45]/35 text-[#2E5C45] text-sm font-semibold hover:bg-[#2E5C45]/5"
                >
                  + Upload images for this variant
                </button>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(variantImageOrder[currentMediaVariant.id] || []).length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 px-3 py-5 text-sm text-gray-500 min-w-[220px]">
                      No variant-specific images yet.
                    </div>
                  )}

                  {(variantImageOrder[currentMediaVariant.id] || []).map((key) => (
                    <div key={key} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                      <img src={state.imagePreviews[key]} alt={key} className="h-full w-full object-cover" />
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
              </>
            )}
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
