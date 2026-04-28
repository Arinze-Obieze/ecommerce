import { DEFAULT_RETURN_POLICY } from '@/utils/catalog/return-policy';

export function createEditablePolicyRow(row = {}) {
  return {
    id: row.id || `row-${Math.random().toString(36).slice(2, 8)}`,
    scenario: row.scenario || '',
    window: row.window || '',
    condition: row.condition || '',
    resolution: row.resolution || '',
    notes: row.notes || '',
  };
}

export function normalizeReturnPolicy(policy = DEFAULT_RETURN_POLICY) {
  return {
    title: policy.title || DEFAULT_RETURN_POLICY.title,
    subtitle: policy.subtitle || DEFAULT_RETURN_POLICY.subtitle,
    support_text: policy.support_text || DEFAULT_RETURN_POLICY.support_text,
    rows: (policy.rows || DEFAULT_RETURN_POLICY.rows).map(createEditablePolicyRow),
  };
}

export function serializeReturnPolicy(policy = {}) {
  return JSON.stringify({
    title: policy.title || '',
    subtitle: policy.subtitle || '',
    support_text: policy.support_text || '',
    rows: Array.isArray(policy.rows) ? policy.rows : [],
  });
}
