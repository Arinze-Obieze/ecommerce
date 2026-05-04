function sanitizeWholeNairaInput(value) {
  return String(value ?? '')
    .replace(/[,\s]/g, '')
    .replace(/₦/g, '')
    .trim();
}

export function parseWholeNairaAmount(value, { allowZero = false } = {}) {
  if (value === null || value === undefined) {
    return { value: null, error: 'Amount is required.' };
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return { value: null, error: 'Amount must be a valid number.' };
    }
    if (!Number.isInteger(value)) {
      return { value: null, error: 'Amount must be a whole Naira value.' };
    }
    if (value < 0 || (!allowZero && value === 0)) {
      return { value: null, error: allowZero ? 'Amount cannot be negative.' : 'Amount must be greater than 0.' };
    }
    return { value, error: null };
  }

  const normalized = sanitizeWholeNairaInput(value);
  if (!normalized) {
    return { value: null, error: 'Amount is required.' };
  }

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return { value: null, error: 'Amount must contain digits only.' };
  }

  const [wholePart, fractionalPart = ''] = normalized.split('.');
  if (fractionalPart && /[1-9]/.test(fractionalPart)) {
    return { value: null, error: 'Amount must be a whole Naira value.' };
  }

  const parsed = Number.parseInt(wholePart, 10);
  if (!Number.isSafeInteger(parsed)) {
    return { value: null, error: 'Amount is too large.' };
  }
  if (parsed < 0 || (!allowZero && parsed === 0)) {
    return { value: null, error: allowZero ? 'Amount cannot be negative.' : 'Amount must be greater than 0.' };
  }

  return { value: parsed, error: null };
}
