import { NextResponse } from 'next/server';
import { getCacheHeaders } from '@/utils/platform/cache-policy';
import { toPositiveInt } from '@/utils/platform/pagination';

export { toPositiveInt };

export const API_HEADERS = {
  noStore: getCacheHeaders('noStore'),
  publicShort: getCacheHeaders('publicShort'),
  publicCatalog: getCacheHeaders('publicCatalog'),
  publicDetail: getCacheHeaders('publicDetail'),
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
  const policy = init.policy || 'publicCatalog';
  return apiJson(payload, {
    ...init,
    headers: {
      ...getCacheHeaders(policy),
      ...(init.headers || {}),
    },
  });
}

export function privateJson(payload, init = {}) {
  const policy = init.policy || 'noStore';
  return apiJson(payload, {
    ...init,
    headers: {
      ...getCacheHeaders(policy),
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

export async function parseJsonBody(request, fallback = {}) {
  try {
    return await request.json();
  } catch {
    return fallback;
  }
}
