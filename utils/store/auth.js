import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { createAdminClient, createClient } from '@/utils/supabase/server';

async function getAalLevel(authClient) {
  try {
    const { data } = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.currentLevel ?? 'aal1';
  } catch {
    return 'aal1';
  }
}

export const STORE_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
};

const rolePriority = {
  [STORE_ROLES.OWNER]: 3,
  [STORE_ROLES.MANAGER]: 2,
  [STORE_ROLES.STAFF]: 1,
};

function hasRole(role, requiredRoles) {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return true;
  return requiredRoles.includes(role);
}

function pickBestMembership(memberships) {
  if (!Array.isArray(memberships) || memberships.length === 0) return null;
  return [...memberships].sort((a, b) => {
    const prioDiff = (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0);
    if (prioDiff !== 0) return prioDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })[0];
}

export async function resolveStoreMembership(preferredStoreId = null) {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return { user: null, membership: null, store: null, adminClient: null, reason: 'unauthenticated' };
  }

  const adminClient = await createAdminClient();

  let query = adminClient
    .from('store_users')
    .select('id, store_id, user_id, role, status, created_at, mfa_enrolled, stores(id, name, slug, status, logo_url)')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (preferredStoreId) {
    query = query.eq('store_id', preferredStoreId);
  }

  const { data: memberships, error: membershipError } = await query;

  if (membershipError) {
    return { user, membership: null, store: null, adminClient, reason: 'lookup_failed', error: membershipError };
  }

  const membership = pickBestMembership(memberships || []);
  if (!membership) {
    return { user, membership: null, store: null, adminClient, reason: 'not_store' };
  }

  // Plan D: check AAL when the store user has enrolled MFA.
  const mfaEnrolled = Boolean(membership.mfa_enrolled);
  const aalLevel = mfaEnrolled ? await getAalLevel(authClient) : 'aal2';
  const needsMfa = mfaEnrolled && aalLevel !== 'aal2';

  return {
    user,
    membership,
    store: membership.stores || null,
    adminClient,
    reason: null,
    mfaEnrolled,
    needsMfa,
  };
}

export async function requireStoreApi(requiredRoles = [], preferredStoreId = null) {
  const resolved = await resolveStoreMembership(preferredStoreId);

  if (!resolved.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  if (!resolved.membership) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Store access required' }, { status: 403 }),
    };
  }

  if (!hasRole(resolved.membership.role, requiredRoles)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Insufficient store permissions' }, { status: 403 }),
    };
  }

  // Plan D: store users with MFA enrolled must be at AAL2.
  if (resolved.needsMfa) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Two-factor authentication required', require_mfa: true },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    user: resolved.user,
    membership: resolved.membership,
    store: resolved.store,
    adminClient: resolved.adminClient,
  };
}

export async function requireStorePage(requiredRoles = [], preferredStoreId = null) {
  const resolved = await resolveStoreMembership(preferredStoreId);

  if (!resolved.user) {
    redirect('/login');
  }

  if (!resolved.membership || !hasRole(resolved.membership.role, requiredRoles)) {
    redirect('/');
  }

  return {
    user: resolved.user,
    membership: resolved.membership,
    store: resolved.store,
    adminClient: resolved.adminClient,
    mfaEnrolled: resolved.mfaEnrolled ?? false,
    needsMfa: resolved.needsMfa ?? false,
  };
}
