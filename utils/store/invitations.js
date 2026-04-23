const STORE_INVITATIONS_MIGRATION_HINT =
  'Database is missing public.store_team_invitations. Apply documentation/migrations/2026-04-10_marketplace_ops_extensions.sql and retry.';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function deriveNameFromEmail(email) {
  const local = String(email || '').split('@')[0] || 'Team Member';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase()) || 'Team Member';
}

function getSiteUrl() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function isMissingStoreInvitationsTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' ||
    (message.includes('store_team_invitations') && message.includes('does not exist'));
}

export function getStoreInvitationsMigrationHint() {
  return STORE_INVITATIONS_MIGRATION_HINT;
}

export async function findAuthUserByEmail(adminClient, email) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      return { user: null, error };
    }

    const users = data?.users || [];
    const match = users.find((user) => normalizeEmail(user.email) === normalizedEmail);
    if (match) {
      return { user: match, error: null };
    }

    if (users.length < perPage) {
      return { user: null, error: null };
    }

    page += 1;
  }
}

export async function ensureUserProfile(adminClient, { userId, email, fullName = null }) {
  const normalizedEmail = normalizeEmail(email);
  const name = String(fullName || '').trim() || deriveNameFromEmail(normalizedEmail);

  const { data: existing, error: existingError } = await adminClient
    .from('users')
    .select('id, email, full_name')
    .eq('id', userId)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  if (existing) {
    return { ok: true, user: existing };
  }

  const { data, error } = await adminClient
    .from('users')
    .insert({
      id: userId,
      email: normalizedEmail,
      full_name: name,
      phone: null,
      state: null,
      avatar: null,
    })
    .select('id, email, full_name')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, user: data };
}

export async function generateStoreInviteLink(adminClient, email, fullName) {
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email: normalizeEmail(email),
    options: {
      redirectTo: `${getSiteUrl()}/reset-password`,
      data: {
        full_name: String(fullName || '').trim() || deriveNameFromEmail(email),
      },
    },
  });

  if (error || !data?.properties?.action_link || !data?.user?.id) {
    return {
      ok: false,
      status: 400,
      error: error?.message || 'Failed to create invite link',
    };
  }

  return {
    ok: true,
    user: data.user,
    actionLink: data.properties.action_link,
  };
}

export async function acceptPendingStoreInvitations(adminClient, { userId, email }) {
  const normalizedEmail = normalizeEmail(email);
  if (!userId || !normalizedEmail) {
    return { accepted: 0 };
  }

  const invitationsResult = await adminClient
    .from('store_team_invitations')
    .select('id, store_id, role, status, email')
    .eq('status', 'pending')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: true });

  if (isMissingStoreInvitationsTableError(invitationsResult.error) || invitationsResult.error) {
    return { accepted: 0 };
  }

  const invites = invitationsResult.data || [];
  let accepted = 0;

  for (const invite of invites) {
    const upsertAssignment = await adminClient
      .from('store_users')
      .upsert(
        {
          store_id: invite.store_id,
          user_id: userId,
          role: invite.role,
          status: 'active',
        },
        { onConflict: 'store_id,user_id' }
      );

    if (upsertAssignment.error) {
      continue;
    }

    await adminClient
      .from('store_team_invitations')
      .update({
        status: 'accepted',
        invited_user_id: userId,
        accepted_by: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id);

    accepted += 1;
  }

  return { accepted };
}
