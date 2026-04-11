export const COLOR_FAMILIES = [
  "Black",
  "White",
  "Gray",
  "Blue",
  "Green",
  "Red",
  "Pink",
  "Purple",
  "Yellow",
  "Orange",
  "Brown",
  "Beige",
  "Gold",
  "Silver",
  "Multi",
];

export const COMMON_COLORS = [
  { name: "Black", hex: "#000000", family: "Black" },
  { name: "White", hex: "#FFFFFF", family: "White" },
  { name: "Off White", hex: "#F8F4E8", family: "White" },
  { name: "Ivory", hex: "#FFFFF0", family: "White" },
  { name: "Cream", hex: "#FFFDD0", family: "White" },
  { name: "Beige", hex: "#F5F5DC", family: "Beige" },
  { name: "Nude", hex: "#E3BC9A", family: "Beige" },
  { name: "Gray", hex: "#6B7280", family: "Gray" },
  { name: "Charcoal", hex: "#374151", family: "Gray" },
  { name: "Silver", hex: "#C0C0C0", family: "Silver" },
  { name: "Blue", hex: "#2563EB", family: "Blue" },
  { name: "Navy", hex: "#1E3A8A", family: "Blue" },
  { name: "Sky Blue", hex: "#7DD3FC", family: "Blue" },
  { name: "Teal", hex: "#0F766E", family: "Green" },
  { name: "Turquoise", hex: "#40E0D0", family: "Blue" },
  { name: "Green", hex: "#16A34A", family: "Green" },
  { name: "Olive", hex: "#808000", family: "Green" },
  { name: "Khaki", hex: "#C3B091", family: "Beige" },
  { name: "Red", hex: "#DC2626", family: "Red" },
  { name: "Burgundy", hex: "#800020", family: "Red" },
  { name: "Maroon", hex: "#800000", family: "Red" },
  { name: "Pink", hex: "#EC4899", family: "Pink" },
  { name: "Rose", hex: "#F43F5E", family: "Pink" },
  { name: "Purple", hex: "#9333EA", family: "Purple" },
  { name: "Lilac", hex: "#C8A2C8", family: "Purple" },
  { name: "Yellow", hex: "#EAB308", family: "Yellow" },
  { name: "Orange", hex: "#F97316", family: "Orange" },
  { name: "Brown", hex: "#92400E", family: "Brown" },
  { name: "Tan", hex: "#D2B48C", family: "Brown" },
  { name: "Gold", hex: "#D4AF37", family: "Gold" },
  { name: "Rose Gold", hex: "#B76E79", family: "Gold" },
  { name: "Multi", hex: "#A855F7", family: "Multi" },
];

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function normalizeHexColor(value) {
  const raw = String(value || "").trim();
  if (!HEX_RE.test(raw)) return "";
  return `#${raw.replace("#", "").toUpperCase()}`;
}

export function getKnownColor(name) {
  const normalized = String(name || "").trim().toLowerCase();
  return COMMON_COLORS.find((color) => color.name.toLowerCase() === normalized) || null;
}

export function getColorHex(name, fallback = "#9CA3AF") {
  const known = getKnownColor(name);
  if (known) return known.hex;
  return normalizeHexColor(name) || fallback;
}

export function getNearestColorFamily(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "Multi";

  let best = COMMON_COLORS[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const color of COMMON_COLORS.filter((entry) => entry.family !== "Multi")) {
    const candidate = hexToRgb(color.hex);
    if (!candidate) continue;
    const distance =
      ((rgb.r - candidate.r) ** 2) +
      ((rgb.g - candidate.g) ** 2) +
      ((rgb.b - candidate.b) ** 2);
    if (distance < bestDistance) {
      best = color;
      bestDistance = distance;
    }
  }

  return best.family;
}

export function resolveVariantColor(input = {}) {
  const colorName = String(input.color || input.name || "").trim();
  const known = getKnownColor(colorName);
  const hex = normalizeHexColor(input.color_hex || input.hex) || known?.hex || "";
  const family = COLOR_FAMILIES.includes(input.color_family)
    ? input.color_family
    : known?.family || (hex ? getNearestColorFamily(hex) : "");

  return {
    color: colorName || known?.name || family || "",
    color_hex: hex || null,
    color_family: family || null,
    color_source: input.color_source || input.source || (hex ? "manual" : "preset"),
  };
}

export function isLightHex(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000 > 170;
}
