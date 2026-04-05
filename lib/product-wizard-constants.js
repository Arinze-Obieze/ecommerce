// lib/product-wizard-constants.js

export const WIZARD_STEPS = [
  { num: 1, label: "Category",  slug: "step-1" },
  { num: 2, label: "Details",   slug: "step-2" },
  { num: 3, label: "Variants",  slug: "step-3" },
  { num: 4, label: "Images",    slug: "step-4" },
  { num: 5, label: "SKU",       slug: "step-5" },
  { num: 6, label: "Print",     slug: "step-6" },
  { num: 7, label: "Verify",    slug: "step-7" },
];

export const CATEGORIES = [
  { value: "men",      label: "Men's Apparel",   icon: "👔", desc: "Shirts, trousers, suits" },
  { value: "women",    label: "Women's Apparel",  icon: "👗", desc: "Dresses, tops, gowns" },
  { value: "kids",     label: "Kids Apparel",     icon: "🧒", desc: "Boys & girls clothing" },
  { value: "footwear", label: "Footwear",         icon: "👟", desc: "Sneakers, sandals, boots" },
];

export const SUBCATEGORIES = {
  men:      ["Shirts", "Trousers", "Jeans", "T-Shirts", "Suits", "Jackets", "Shorts"],
  women:    ["Dresses", "Tops", "Skirts", "Trousers", "Gowns", "Blouses", "Jackets"],
  kids:     ["Boys Shirts", "Girls Dresses", "Boys Trousers", "Girls Skirts", "T-Shirts", "Shorts"],
  footwear: ["Sneakers", "Sandals", "Boots", "Slippers", "Formal Shoes", "Heels"],
};

export const MATERIALS = ["Cotton", "Polyester", "Denim", "Silk", "Wool", "Leather", "Mixed"];
export const GENDERS   = ["Male", "Female", "Unisex", "Kids"];
export const AGE_GROUPS = ["0-2 years", "3-5 years", "6-8 years", "9-12 years", "13+ years"];

export const COLORS_LIST = [
  { name: "Black",  hex: "#000000",  tw: "bg-black"     },
  { name: "White",  hex: "#FFFFFF",  tw: "bg-white border border-gray-300" },
  { name: "Blue",   hex: "#3B82F6",  tw: "bg-blue-500"  },
  { name: "Red",    hex: "#EF4444",  tw: "bg-red-500"   },
  { name: "Green",  hex: "#10B981",  tw: "bg-emerald-500" },
  { name: "Yellow", hex: "#F59E0B",  tw: "bg-amber-500" },
  { name: "Pink",   hex: "#EC4899",  tw: "bg-pink-500"  },
  { name: "Brown",  hex: "#92400E",  tw: "bg-amber-800" },
  { name: "Gray",   hex: "#6B7280",  tw: "bg-gray-500"  },
  { name: "Multi",  hex: "multi",    tw: "bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400" },
];

export function getSizeOptions(category) {
  if (category === "footwear") return ["36","37","38","39","40","41","42","43","44","45"];
  return ["XS","S","M","L","XL","XXL","XXXL"];
}

export function getColorTw(name) {
  return COLORS_LIST.find(c => c.name === name)?.tw || "bg-gray-200";
}

// ─── SKU helpers ────────────────────────────────────────────

export function buildSkuCode(slug, len = 4) {
  const cleaned = (slug || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, len).padEnd(len, "X");
}

export function buildSkuPrefix(storeSlug, productSlug) {
  return `ZVA-${buildSkuCode(storeSlug, 4)}-${buildSkuCode(productSlug, 4)}`;
}

export function buildVariantSku(baseSku, color, size) {
  const c3 = (color || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3);
  const s  = (size  || "").replace(/\s/g, "").toUpperCase();
  return `${baseSku}-${c3}-${s}`;
}

// ─── Image slots ────────────────────────────────────────────

export const IMAGE_STRATEGIES = [
  { value: "general", label: "General Images",  desc: "One set for all variants",    icon: "layers" },
  { value: "variant", label: "Per-Variant",     desc: "Different per color variant", icon: "palette" },
  { value: "mixed",   label: "Mixed",           desc: "General + some per-variant",  icon: "combine" },
];

export const GENERAL_IMAGE_SLOTS = [
  { key: "front",      label: "Front View",         required: true },
  { key: "back",       label: "Back View",          required: true },
  { key: "side",       label: "Side View",          required: false },
  { key: "detail",     label: "Close-up / Detail",  required: false },
  { key: "material",   label: "Material / Texture", required: false },
  { key: "additional", label: "Additional",         required: false },
];

export const VARIANT_IMAGE_SLOTS = [
  { key: "front",  label: "Front View", required: true },
  { key: "back",   label: "Back View",  required: true },
  { key: "side",   label: "Side View",  required: false },
  { key: "detail", label: "Detail",     required: false },
];

// ─── Initial wizard state ───────────────────────────────────

export const INITIAL_WIZARD_STATE = {
  category: null, subcategory: null,
  productName: "", brand: "", material: "", description: "", gender: "", ageGroup: "",
  variants: [],
  imageStrategy: "general",
  images: {}, imagePreviews: {}, persistedImages: {}, variantNotes: {}, productNotes: "",
  baseSku: null, variantSkus: [],
  printCompleted: false, printType: "all", printCopies: 1,
  scannedSku: "", isVerified: false,
};
