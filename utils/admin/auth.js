import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/utils/supabase/server';

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPS_ADMIN: 'ops_admin',
  SUPPORT_ADMIN: 'support_admin',
  ANALYST: 'analyst',
};

function hasRole(role, requiredRoles) {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return true;
  return requiredRoles.includes(role);
}

async function getAalLevel(authClient) {
  try {
    const { data } = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.currentLevel ?? 'aal1';
  } catch {
    return 'aal1';
  }
}

export async function resolveAdminMembership() {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return { user: null, membership: null, adminClient: null, reason: 'unauthenticated' };
  }

  const adminClient = await createAdminClient();
  const { data: membership, error: membershipError } = await adminClient
    .from('admin_users')
    .select('id, user_id, role, is_active, mfa_enrolled')
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError) {
    return { user, membership: null, adminClient, reason: 'lookup_failed', error: membershipError };
  }

  if (!membership || !membership.is_active) {
    return { user, membership: null, adminClient, reason: 'not_admin' };
  }

  // Plan D: check AAL when the admin has enrolled MFA.
  const mfaEnrolled = Boolean(membership.mfa_enrolled);
  const aalLevel = mfaEnrolled ? await getAalLevel(authClient) : 'aal2';
  const needsMfa = mfaEnrolled && aalLevel !== 'aal2';

  return { user, membership, adminClient, reason: null, mfaEnrolled, needsMfa };
}

export async function requireAdminApi(requiredRoles = []) {
  const resolved = await resolveAdminMembership();

  if (!resolved.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  if (!resolved.membership) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  if (!hasRole(resolved.membership.role, requiredRoles)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Insufficient admin permissions' }, { status: 403 }),
    };
  }

  // Plan D: API callers that have MFA enrolled must be at AAL2.
  if (resolved.needsMfa) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Two-factor authentication required for admin access', require_mfa: true },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    user: resolved.user,
    membership: resolved.membership,
    adminClient: resolved.adminClient,
  };
}

export async function requireAdminPage(requiredRoles = []) {
  const resolved = await resolveAdminMembership();

  if (!resolved.user) {
    redirect('/login');
  }

  if (!resolved.membership || !hasRole(resolved.membership.role, requiredRoles)) {
    redirect('/');
  }

  // Plan D: return mfa state; the layout/shell decides how to present it.
  return {
    user: resolved.user,
    membership: resolved.membership,
    adminClient: resolved.adminClient,
    mfaEnrolled: resolved.mfaEnrolled ?? false,
    needsMfa: resolved.needsMfa ?? false,
  };
}
