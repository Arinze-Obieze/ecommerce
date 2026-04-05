export const DEFAULT_RETURN_POLICY = {
  title: 'Returns & Refunds',
  subtitle: 'A standard return policy applied to every product on the catalog.',
  rows: [
    {
      id: 'unused-with-tags',
      scenario: 'Unused item with tags',
      window: 'Within 30 days of delivery',
      condition: 'Item must be unworn, unwashed, and in original packaging.',
      resolution: 'Full refund or exchange',
      notes: 'Original tags and proof of purchase are required.',
    },
    {
      id: 'damaged-or-wrong-item',
      scenario: 'Damaged, defective, or wrong item',
      window: 'Within 7 days of delivery',
      condition: 'Share photos and report the issue after delivery.',
      resolution: 'Full refund or replacement',
      notes: 'Return shipping is covered when the issue is verified.',
    },
    {
      id: 'change-of-mind',
      scenario: 'Change of mind',
      window: 'Within 14 days of delivery',
      condition: 'Item must be unused and still resaleable.',
      resolution: 'Store credit or exchange',
      notes: 'Shipping fees may be deducted where applicable.',
    },
  ],
  support_text: 'For help with a return, contact support before sending the item back.',
};

export function normalizeReturnPolicyRows(value) {
  if (!Array.isArray(value)) return DEFAULT_RETURN_POLICY.rows;

  const rows = value
    .map((row, index) => {
      if (!row || typeof row !== 'object') return null;

      const scenario = String(row.scenario || '').trim();
      const window = String(row.window || '').trim();
      const condition = String(row.condition || '').trim();
      const resolution = String(row.resolution || '').trim();
      const notes = String(row.notes || '').trim();

      if (!scenario && !window && !condition && !resolution && !notes) {
        return null;
      }

      return {
        id: String(row.id || `row-${index + 1}`).trim() || `row-${index + 1}`,
        scenario: scenario.slice(0, 120),
        window: window.slice(0, 120),
        condition: condition.slice(0, 280),
        resolution: resolution.slice(0, 120),
        notes: notes.slice(0, 280),
      };
    })
    .filter(Boolean);

  return rows.length ? rows : DEFAULT_RETURN_POLICY.rows;
}

export function normalizeReturnPolicyRecord(record) {
  const data = record?.data && typeof record.data === 'object' ? record.data : {};

  return {
    title: String(record?.title || DEFAULT_RETURN_POLICY.title).trim() || DEFAULT_RETURN_POLICY.title,
    subtitle: String(record?.description || DEFAULT_RETURN_POLICY.subtitle).trim() || DEFAULT_RETURN_POLICY.subtitle,
    rows: normalizeReturnPolicyRows(data.rows),
    support_text:
      String(data.support_text || DEFAULT_RETURN_POLICY.support_text).trim() || DEFAULT_RETURN_POLICY.support_text,
    updated_at: record?.updated_at || null,
    updated_by: record?.updated_by || null,
  };
}

export function buildReturnPolicyUpdatePayload(body = {}) {
  const title = String(body.title || '').trim();
  const subtitle = String(body.subtitle || '').trim();
  const supportText = String(body.support_text || '').trim();
  const rows = normalizeReturnPolicyRows(body.rows);

  if (!title) {
    return { error: 'Policy title is required' };
  }

  return {
    title: title.slice(0, 120),
    description: subtitle.slice(0, 240) || null,
    data: {
      rows,
      support_text: supportText.slice(0, 240) || null,
    },
  };
}
