export const NOTIFICATIONS_MIGRATION_HINT =
  'Database is missing public.user_notifications. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

export function isMissingNotificationsTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('user_notifications') && message.includes('does not exist'));
}

export async function createUserNotification(adminClient, input) {
  const payload = {
    user_id: input.userId,
    store_id: input.storeId || null,
    type: normalizeText(input.type, 'system'),
    title: normalizeText(input.title, 'Update'),
    body: normalizeText(input.body),
    action_url: normalizeText(input.actionUrl) || null,
    entity_type: normalizeText(input.entityType) || null,
    entity_id: input.entityId ? String(input.entityId) : null,
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
    status: 'unread',
  };

  const result = await adminClient
    .from('user_notifications')
    .insert(payload)
    .select('id, user_id, type, title, body, action_url, entity_type, entity_id, status, metadata, read_at, created_at')
    .single();

  if (isMissingNotificationsTableError(result.error)) {
    return { data: null, error: new Error(NOTIFICATIONS_MIGRATION_HINT), missingTable: true };
  }

  if (result.error) {
    return { data: null, error: result.error, missingTable: false };
  }

  return { data: result.data, error: null, missingTable: false };
}
