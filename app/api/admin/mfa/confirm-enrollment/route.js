import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';

export async function POST() {
  const authClient = await createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Verify the session is actually at AAL2 — the client must have completed
  // challengeAndVerify before calling this endpoint.
  const { data: aalData } = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel !== 'aal2') {
    return NextResponse.json({ error: 'MFA not yet verified' }, { status: 403 });
  }

  const adminClient = await createAdminClient();
  const { error } = await adminClient
    .from('admin_users')
    .update({ mfa_enrolled: true, mfa_enrolled_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to record enrollment' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
