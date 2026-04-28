export const ROLE_OPTIONS = ['manager', 'staff'];
export const STATUS_OPTIONS = ['active', 'revoked'];

export function roleLabel(role) {
  return String(role || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}
