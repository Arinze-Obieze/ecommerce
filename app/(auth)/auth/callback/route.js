import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { resolvePostLoginTarget } from '@/utils/auth/post-login-redirect';

// F003: allowlist of hosts that may appear in X-Forwarded-Host.
// Add staging/preview domains here as needed; never trust the header blindly.
const ALLOWED_FORWARDED_HOSTS = new Set([
  'zova.ng',
  'www.zova.ng',
]);

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser?.user?.id || null;
      let targetPath = next;

      if (userId && (next === '/' || next === '/login' || next === '/signup')) {
        targetPath = await resolvePostLoginTarget(supabase, userId);
      }

      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetPath}`);
      }

      // F003: only trust X-Forwarded-Host if it's in the explicit allowlist.
      const forwardedHost = request.headers.get('x-forwarded-host');
      const safeHost = forwardedHost && ALLOWED_FORWARDED_HOSTS.has(forwardedHost)
        ? forwardedHost
        : null;

      if (safeHost) {
        return NextResponse.redirect(`https://${safeHost}${targetPath}`);
      }
      return NextResponse.redirect(`${origin}${targetPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
