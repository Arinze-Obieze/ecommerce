"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { MATERIALS, GENDERS, AGE_GROUPS } from "@/lib/product-wizard-constants";

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

  const toggleMood = (key) => {
    const current = state.moodTags || [];
    if (current.includes(key)) {
      dispatch({ type: "SET_BASIC_INFO", payload: { moodTags: current.filter(k => k !== key) } });
    } else {
      if (current.length >= MAX_MOODS) return;
      dispatch({ type: "SET_BASIC_INFO", payload: { moodTags: [...current, key] } });
    }
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

  const handleBack = () => {
    if (state.productName || state.description || state.material) setShowBackWarn(true);
    else goBack();
  };

  const fc = (f) => `w-full px-3 py-3 rounded-xl border text-sm font-medium transition-all focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45] ${errors[f] ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"}`;

  return (
    <WizardShell
      title="Variants, Pricing, Inventory & Media"
      subtitle="Configure mode, SKU, inventory, and product/variant media in one flow."
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-400">*</span></label>
          <input className={fc("productName")} placeholder="e.g. Men's Cotton Casual Shirt" value={state.productName} onChange={(e) => set("productName", e.target.value)} />
          {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
            <input className={fc("brand")} placeholder="Optional" value={state.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material <span className="text-red-400">*</span></label>
            <select className={fc("material")} value={state.material} onChange={(e) => set("material", e.target.value)}>
              <option value="">Select material</option>
              {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.material && <p className="mt-1 text-xs text-red-500">{errors.material}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-red-400">*</span></label>
          <textarea rows={4} className={fc("description") + " resize-none"} placeholder="Describe the product…" value={state.description} onChange={(e) => set("description", e.target.value)} />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
            <span className="text-xs text-gray-400">{state.description?.length || 0}/2000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
            <select className={fc("gender")} value={state.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Optional</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age Group</label>
              <select className={fc("ageGroup")} value={state.ageGroup} onChange={(e) => set("ageGroup", e.target.value)}>
                <option value="">Select</option>
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <WizardNav onBack={handleBack} onNext={handleNext} nextLabel="Continue to Variants" />

      {showBackWarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Go Back?</h3>
            <p className="text-sm text-gray-500 mb-5">Changing category resets all product info.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBackWarn(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm">Stay</button>
              <button onClick={() => { dispatch({ type: "RESET" }); setShowBackWarn(false); goBack(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm">Go Back</button>
            </div>
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