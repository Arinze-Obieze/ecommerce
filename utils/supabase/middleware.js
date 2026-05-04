import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { resolvePostLoginTarget } from "@/utils/auth/post-login-redirect";
import crypto from 'crypto';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Origin-Agent-Cluster': '?1',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

function getSupabaseHost() {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : '';
  } catch {
    return '';
  }
}

function buildEnforcedCsp(nonce) {
  const supabaseHost = getSupabaseHost();
  const supabaseSources = supabaseHost
    ? [`https://${supabaseHost}`, `wss://${supabaseHost}`]
    : ['https://*.supabase.co', 'wss://*.supabase.co'];

  const directives = [
    ["default-src", "'self'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["frame-ancestors", "'none'"],
    ["form-action", "'self'"],
    ["script-src", "'self'", `'nonce-${nonce}'`, "https://js.paystack.co", "https://checkout.paystack.com", ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])],
    ["style-src", "'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    ["font-src", "'self'", "data:", "https://fonts.gstatic.com"],
    [
      "img-src",
      "'self'",
      "data:",
      "blob:",
      "https://images.unsplash.com",
      "https://placehold.co",
      "https://api.qrserver.com",
      ...supabaseSources.filter((s) => s.startsWith('https://')),
    ],
    ["media-src", "'self'", "blob:", ...supabaseSources.filter((s) => s.startsWith('https://'))],
    [
      "connect-src",
      "'self'",
      ...supabaseSources,
      "https://api.paystack.co",
      "https://checkout.paystack.com",
    ],
    ["frame-src", "'self'", "https://js.paystack.co", "https://checkout.paystack.com"],
    ["worker-src", "'self'", "blob:"],
    ["manifest-src", "'self'"],
    ["report-uri", "/api/security/csp-report"],
    ["report-to", "csp-endpoint"],
  ];

  return directives
    .map(([name, ...values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

function applySecurityHeaders(response, nonce) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', buildEnforcedCsp(nonce));
  response.headers.set('Reporting-Endpoints', 'csp-endpoint="/api/security/csp-report"');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return response;
}

export async function updateSession(request) {
  const nonce = crypto.randomBytes(16).toString('base64');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // F013: guard all authenticated namespaces at the proxy layer.
  // Page-level requireStorePage/requireAdminPage remain the primary guard;
  // this is defence-in-depth so a forgotten page-level check doesn't go public.
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    (request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/orders") ||
      request.nextUrl.pathname.startsWith("/payments") ||
      request.nextUrl.pathname.startsWith("/settings") ||
      request.nextUrl.pathname.startsWith("/store") ||
      request.nextUrl.pathname.startsWith("/admin"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return applySecurityHeaders(NextResponse.redirect(url), nonce);
  }

  // Optional: Redirect authenticated users away from login/signup
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = await resolvePostLoginTarget(supabase, user.id);
    return applySecurityHeaders(NextResponse.redirect(url), nonce);
  }

  return applySecurityHeaders(response, nonce);
}
