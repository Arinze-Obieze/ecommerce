import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resolvePostLoginTarget } from '@/utils/postLoginRedirect';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ success: true, target: '/login' });
  }

  const target = await resolvePostLoginTarget(supabase, user.id);
  return NextResponse.json({ success: true, target });
}
