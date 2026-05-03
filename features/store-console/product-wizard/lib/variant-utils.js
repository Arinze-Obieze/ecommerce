import { buildSkuCode, buildVariantSku } from "@/features/product-wizard/lib/constants";

export function normalizeToken(value) {
  return String(value || "").trim();
}

export function sanitizeSkuToken(value) {
  return normalizeToken(value).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function makeVariantId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

export function variantKey(color, size) {
  return `${String(color || "").toLowerCase()}__${String(size || "").toLowerCase()}`;
}

export function normalizeHex(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9A-Fa-f]{6}$/.test(withHash) ? withHash.toUpperCase() : "";
}

export function normalizeExistingVariant(variant = {}) {
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

export function deriveColorSizeFromAttributes(entries = []) {
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

export function variantDisplayLabel(variant) {
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

export function deriveSkuFromName(productName) {
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

export function buildAutoSku(storeSlug, productName) {
  const storeCode = buildSkuCode(storeSlug || "STOR", 4);
  const productCode = deriveSkuFromName(productName) || buildSkuCode(productName, 4);
  return `ZVA-${storeCode}-${productCode}-0001`;
}

export function buildVariantSkuFromPattern(baseSku, pattern, variant) {
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

export function uploadImageFiles(files, makeKey, onUpload, showError) {
  Array.from(files || []).forEach((file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showError("Images must be 10 MB or smaller."); return; }
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isImage) { showError("Upload JPG, PNG, or WebP files only."); return; }
    const key = makeKey();
    onUpload(key, file, URL.createObjectURL(file));
  });
}
