import { NextResponse } from 'next/server';

export const API_HEADERS = {
  noStore: {
    'Cache-Control': 'no-store, max-age=0',
  },
  publicShort: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
  publicCatalog: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
  },
};

export function apiJson(payload, init = {}) {
  return NextResponse.json(payload, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Vary: 'Accept-Encoding',
    },
  });
}

export function publicJson(payload, init = {}) {
  return apiJson(payload, {
    ...init,
    headers: {
      ...API_HEADERS.publicCatalog,
      ...(init.headers || {}),
    },
  });
}

export function privateJson(payload, init = {}) {
  return apiJson(payload, {
    ...init,
    headers: {
      ...API_HEADERS.noStore,
      ...(init.headers || {}),
    },
  });
}

export function errorJson(message, status = 500, extra = {}, headers = {}) {
  return privateJson(
    {
      success: false,
      error: message || 'Internal Server Error',
      ...extra,
    },
    { status, headers }
  );
}

export function toPositiveInt(value, fallback, { min = 1, max = 100 } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function parseJsonBody(request, fallback = {}) {
  try {
    return await request.json();
  } catch {
    return fallback;
  }
}
