const CATEGORY_GENDER_RULES = {
  men: {
    showGender: true,
    required: true,
    allowed: ["Male", "Unisex"],
    defaultValue: "Male",
  },
  women: {
    showGender: true,
    required: true,
    allowed: ["Female", "Unisex"],
    defaultValue: "Female",
  },
  kids: {
    showGender: true,
    required: true,
    allowed: ["Male", "Female", "Unisex"],
    defaultValue: "Unisex",
  },
  footwear: {
    showGender: true,
    required: false,
    allowed: ["Male", "Female", "Unisex"],
    defaultValue: "",
  },
  default: {
    showGender: true,
    required: false,
    allowed: ["Male", "Female", "Unisex"],
    defaultValue: "",
  },
};

function normalizeCategoryKey(category) {
  return String(category || "").trim().toLowerCase();
}

function getRule(category) {
  return CATEGORY_GENDER_RULES[normalizeCategoryKey(category)] || CATEGORY_GENDER_RULES.default;
}

function normalizeGenderLabel(gender) {
  const raw = String(gender || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "male" || raw === "man" || raw === "men") return "Male";
  if (raw === "female" || raw === "woman" || raw === "women") return "Female";
  if (raw === "unisex" || raw === "uni sex") return "Unisex";
  if (raw === "kids" || raw === "kid" || raw === "children") return "Kids";
  return "";
}

export function getAllowedGendersForCategory(category) {
  return getRule(category).allowed;
}

export function isGenderFieldVisibleForCategory(category) {
  return getRule(category).showGender;
}

export function isGenderRequiredForCategory(category) {
  return getRule(category).required;
}

export function isGenderAllowedForCategory(category, gender) {
  const normalized = normalizeGenderLabel(gender);
  if (!normalized) return false;
  return getAllowedGendersForCategory(category).includes(normalized);
}

export function normalizeGenderForCategory(category, gender) {
  const rule = getRule(category);
  if (!rule.showGender) return "";

  const normalized = normalizeGenderLabel(gender);
  if (normalized && rule.allowed.includes(normalized)) return normalized;
  return rule.defaultValue || "";
}

export function getGenderValidationError(category, gender) {
  const rule = getRule(category);
  const normalized = normalizeGenderLabel(gender);

  if (!rule.showGender) {
    return normalized ? "Gender must be empty for Kids Apparel." : null;
  }

  if (rule.required && !normalized) {
    return "Gender is required for this category.";
  }

  if (normalized && !rule.allowed.includes(normalized)) {
    return `Gender "${normalized}" is not allowed for this category.`;
  }

  return null;
}
