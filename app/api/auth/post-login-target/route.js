import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { resolvePostLoginTarget } from '@/utils/postLoginRedirect';
import { acceptPendingStoreInvitations, ensureUserProfile } from '@/utils/storeInvitations';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ success: true, target: '/login' });
  }

  try {
    const adminClient = await createAdminClient();
    const email = String(user.email || '').trim().toLowerCase();

    if (email) {
      await ensureUserProfile(adminClient, {
        userId: user.id,
        email,
        fullName: user.user_metadata?.full_name || null,
      });

      await acceptPendingStoreInvitations(adminClient, {
        userId: user.id,
        email,
      });
    }
  } catch {
    // Best effort only. Redirect resolution should not fail if invite acceptance cannot run.
  }

  const target = await resolvePostLoginTarget(supabase, user.id);
  return NextResponse.json({ success: true, target });
}
