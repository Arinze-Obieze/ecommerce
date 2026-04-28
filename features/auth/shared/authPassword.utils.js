export const AUTH_STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Perfect'];

export const AUTH_STRENGTH_COLORS = [
  '#E8E4DC',
  'var(--zova-error)',
  '#F97316',
  'var(--zova-accent-emphasis)',
  'var(--zova-primary-action)',
  'var(--zova-primary-action-hover)',
];

export function getPasswordChecks(password) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export function getPasswordStrengthMeta(password) {
  const checks = getPasswordChecks(password);
  const passStrength = Object.values(checks).filter(Boolean).length;

  return {
    checks,
    passStrength,
    strengthLabel: AUTH_STRENGTH_LABELS[passStrength],
    strengthColor: AUTH_STRENGTH_COLORS[passStrength],
  };
}

export function sanitizePhoneInput(value) {
  return String(value || '').replace(/[^\d+\s()-]/g, '');
}
