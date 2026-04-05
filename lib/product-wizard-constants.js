// lib/product-wizard-constants.js


export const WIZARD_STEPS = [
  { num: 1, label: "Category",  slug: "step-1" },
  { num: 2, label: "Details",   slug: "step-2" },
  { num: 3, label: "Label",     slug: "step-3" },
  { num: 4, label: "Variants",  slug: "step-4" },
  { num: 5, label: "Images",    slug: "step-5" },
  { num: 6, label: "SKU",       slug: "step-6" },
  { num: 7, label: "Print",     slug: "step-7" },
  { num: 8, label: "Verify",    slug: "step-8" },
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
  // Step 3 — Label & care
  fiberComposition: [],
  countryOfOrigin: "",
  countryOfTransformation: "",
  labelBrand: "",
  careWashing: null,
  careBleaching: null,
  careDrying: null,
  careIroning: null,
  careDryCleaning: null,
  childrenSafetyFlags: [],
  flammabilityFlags: [],
};


// ─── ADD THESE TO YOUR /lib/product-wizard-constants.js ───────────────────────

// ── Countries ──────────────────────────────────────────────────────────────────
export const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BD", name: "Bangladesh" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BR", name: "Brazil" },
  { code: "BG", name: "Bulgaria" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "CI", name: "Ivory Coast" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LB", name: "Lebanon" },
  { code: "LY", name: "Libya" },
  { code: "LT", name: "Lithuania" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" },
  { code: "MN", name: "Mongolia" },
  { code: "MA", name: "Morocco" },
  { code: "MM", name: "Myanmar" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" },
  { code: "PA", name: "Panama" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

// ── Fiber types ────────────────────────────────────────────────────────────────
export const FIBER_TYPES = [
  "Cotton",
  "Organic Cotton",
  "Recycled Cotton",
  "Polyester",
  "Recycled Polyester",
  "Nylon / Polyamide",
  "Wool",
  "Merino Wool",
  "Cashmere",
  "Angora",
  "Mohair",
  "Alpaca",
  "Silk",
  "Linen / Flax",
  "Hemp",
  "Bamboo",
  "Viscose / Rayon",
  "Modal",
  "Lyocell / Tencel",
  "Cupro",
  "Acrylic",
  "Spandex / Elastane / Lycra",
  "Polypropylene",
  "Acetate",
  "Triacetate",
  "Leather",
  "Faux Leather / PU",
  "Down",
  "Feather",
  "Other",
];

// ── Care instruction options ───────────────────────────────────────────────────

export const WASHING_OPTIONS = [
  {
    value: "machine_cold",
    label: "Machine wash cold",
    symbol: "30°",
    desc: "Machine wash in cold water up to 30°C / 86°F. Suitable for delicate and lightly soiled items.",
  },
  {
    value: "machine_warm",
    label: "Machine wash warm",
    symbol: "40°",
    desc: "Machine wash in warm water up to 40°C / 104°F. Good for everyday cottons and synthetics.",
  },
  {
    value: "machine_hot",
    label: "Machine wash hot",
    symbol: "60°",
    desc: "Machine wash in hot water up to 60°C / 140°F. Kills bacteria — ideal for bedding and towels.",
  },
  {
    value: "machine_very_hot",
    label: "Machine wash very hot",
    symbol: "95°",
    desc: "Machine wash up to 95°C / 203°F. Only for white cotton that is heavily soiled.",
  },
  {
    value: "gentle_cold",
    label: "Gentle / delicate cold",
    symbol: "30̲°",
    desc: "Machine wash on a gentle or delicate cycle in cold water. For fragile fabrics like silk or lace.",
  },
  {
    value: "gentle_warm",
    label: "Gentle / delicate warm",
    symbol: "40̲°",
    desc: "Machine wash on a gentle cycle in warm water. For wool blends and structured garments.",
  },
  {
    value: "hand_wash",
    label: "Hand wash only",
    symbol: "✋",
    desc: "Wash by hand in lukewarm water. Do not wring or twist. For delicate embellishments or knits.",
  },
  {
    value: "do_not_wash",
    label: "Do not wash",
    symbol: "✕W",
    desc: "This item cannot be laundered with water. Dry clean or spot clean only.",
  },
];

export const BLEACHING_OPTIONS = [
  {
    value: "any_bleach",
    label: "Bleach allowed",
    symbol: "△",
    desc: "Any bleach may be used when needed. Suitable for white cotton and linen.",
  },
  {
    value: "non_chlorine_bleach",
    label: "Non-chlorine bleach only",
    symbol: "△̲",
    desc: "Use only oxygen-based or colour-safe bleach. Protects dyes while still sanitising.",
  },
  {
    value: "do_not_bleach",
    label: "Do not bleach",
    symbol: "✕△",
    desc: "Do not use any bleach. The fabric or dye will be damaged by bleaching agents.",
  },
];

export const DRYING_OPTIONS = [
  {
    value: "tumble_high",
    label: "Tumble dry high heat",
    symbol: "⊙⊙",
    desc: "Tumble dry on high heat. Suitable for sturdy cottons and towels.",
  },
  {
    value: "tumble_medium",
    label: "Tumble dry medium heat",
    symbol: "⊙",
    desc: "Tumble dry on medium heat. Good for most everyday garments.",
  },
  {
    value: "tumble_low",
    label: "Tumble dry low heat",
    symbol: "⊙·",
    desc: "Tumble dry on low heat. For synthetics, blends, and items prone to shrinkage.",
  },
  {
    value: "tumble_no_heat",
    label: "Tumble dry no heat (air only)",
    symbol: "⊙✕",
    desc: "Tumble dry with no heat — air fluff only. Refreshes without heat damage.",
  },
  {
    value: "do_not_tumble",
    label: "Do not tumble dry",
    symbol: "✕⊙",
    desc: "Do not use a tumble dryer. Heat or tumbling will damage this item.",
  },
  {
    value: "line_dry",
    label: "Line dry / hang dry",
    symbol: "▭|",
    desc: "Hang the garment on a line to dry. Preserves shape and reduces energy use.",
  },
  {
    value: "dry_flat",
    label: "Dry flat",
    symbol: "▭—",
    desc: "Lay the garment flat to dry. Prevents stretching — essential for knitwear.",
  },
  {
    value: "drip_dry",
    label: "Drip dry",
    symbol: "▭↓",
    desc: "Hang to drip dry without wringing. For items that must not be twisted.",
  },
  {
    value: "dry_shade",
    label: "Dry in shade",
    symbol: "▭☁",
    desc: "Dry away from direct sunlight to prevent colour fading.",
  },
];

export const IRONING_OPTIONS = [
  {
    value: "iron_low",
    label: "Iron low heat (110°C)",
    symbol: "·",
    desc: "Iron on low heat up to 110°C / 230°F. For synthetics — acetate, acrylic, nylon, polyester.",
  },
  {
    value: "iron_medium",
    label: "Iron medium heat (150°C)",
    symbol: "··",
    desc: "Iron on medium heat up to 150°C / 300°F. For wool, polyester blends, and silk.",
  },
  {
    value: "iron_high",
    label: "Iron high heat (200°C)",
    symbol: "···",
    desc: "Iron on high heat up to 200°C / 390°F. For cotton and linen.",
  },
  {
    value: "iron_steam",
    label: "Iron with steam",
    symbol: "~·",
    desc: "Steam ironing is recommended or safe for this fabric.",
  },
  {
    value: "no_steam",
    label: "Iron without steam",
    symbol: "✕~",
    desc: "Do not use steam — moisture may damage or mark this fabric.",
  },
  {
    value: "do_not_iron",
    label: "Do not iron",
    symbol: "✕☐",
    desc: "Do not iron this item. Heat will damage the fabric, print, or embellishment.",
  },
];

export const DRY_CLEANING_OPTIONS = [
  {
    value: "dry_clean_any",
    label: "Dry clean (any solvent)",
    symbol: "○",
    desc: "Dry cleaning is safe with any standard solvent. Recommended for structured or tailored garments.",
  },
  {
    value: "dry_clean_petroleum",
    label: "Dry clean — petroleum solvent only",
    symbol: "○P",
    desc: "Dry clean using petroleum-based solvent only. Perchloroethylene (PCE) will damage this item.",
  },
  {
    value: "dry_clean_short",
    label: "Dry clean — short cycle",
    symbol: "○F",
    desc: "Dry clean with a short / gentle cycle and minimal moisture.",
  },
  {
    value: "wet_clean",
    label: "Professional wet clean",
    symbol: "○W",
    desc: "Professional wet cleaning is recommended. Gentler than dry cleaning and more eco-friendly.",
  },
  {
    value: "do_not_dry_clean",
    label: "Do not dry clean",
    symbol: "✕○",
    desc: "Dry cleaning solvents will damage this item. Wash according to wash instructions only.",
  },
];

export const CHILDREN_SAFETY_OPTIONS = [
  {
    value: "choking_hazard_under3",
    label: "Choking hazard — not for under 3",
    symbol: "⚠3",
    desc: "Contains small parts. Not suitable for children under 3 years. Risk of choking.",
  },
  {
    value: "draw_cord_warning",
    label: "Draw cord / hood cord warning",
    symbol: "⚠cord",
    desc: "This garment has draw cords or hood cords. Follow EN 14682 / ASTM F1816 restrictions. Not for children under 7.",
  },
  {
    value: "keep_away_fire",
    label: "KEEP AWAY FROM FIRE",
    symbol: "🔥✕",
    desc: "This garment is not flame resistant. Keep away from fire and open flames. Required on UK, AU, NZ, and EU children's nightwear.",
  },
  {
    value: "nightwear_snug",
    label: "Children's sleepwear — wear snug fitting",
    symbol: "😴",
    desc: "Wear snug-fitting, not flame resistant. Required on US children's sleepwear (FTC / CPSC) when garment is not flame-treated.",
  },
  {
    value: "age_range",
    label: "Age range stated on label",
    symbol: "👶",
    desc: "The age range for which this garment is designed is stated on the label as required by EU and US regulations.",
  },
];

export const FLAMMABILITY_OPTIONS = [
  {
    value: "class1",
    label: "Class 1 — Normal flammability",
    symbol: "F1",
    desc: "US CPSC Class 1: normal flammability. Safe for general use including children's sleepwear (if snug-fitting).",
  },
  {
    value: "class2",
    label: "Class 2 — Intermediate flammability",
    symbol: "F2",
    desc: "US CPSC Class 2: intermediate flammability. Not acceptable for children's sleepwear.",
  },
  {
    value: "flame_resistant",
    label: "Flame resistant / flame retardant treated",
    symbol: "FR",
    desc: "This garment has been treated with a flame-retardant finish to meet sleepwear or workwear standards.",
  },
  {
    value: "en_iso_11612",
    label: "EN ISO 11612 — Industrial flame protection",
    symbol: "🔥▣",
    desc: "Meets EN ISO 11612 for protective clothing against heat and flame. For industrial / workwear use.",
  },
  {
    value: "not_flame_resistant",
    label: "Not flame resistant",
    symbol: "FR✕",
    desc: "This item has not been treated for flame resistance. Pair with 'Keep Away from Fire' warning if applicable.",
  },
];