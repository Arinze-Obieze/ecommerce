export async function writeAdminAuditLog(adminClient, {
  actorUserId,
  actorAdminUserId,
  action,
  targetType,
  targetId,
  beforeData = null,
  afterData = null,
  metadata = {},
}) {
  try {
    await adminClient.from('admin_audit_logs').insert({
      actor_user_id: actorUserId || null,
      actor_admin_user_id: actorAdminUserId || null,
      action,
      target_type: targetType,
      target_id: String(targetId),
      before_data: beforeData,
      after_data: afterData,
      metadata,
    });
  } catch (error) {
    // Audit failures should not break admin operation, but should be visible in server logs.
    console.error('Admin audit log write failed:', error);
  }
}
