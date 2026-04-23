export const CACHE_SECONDS = {
  publicShort: 30,
  publicCatalog: 120,
  publicDetail: 60,
};

export const CACHE_POLICIES = {
  publicShort: {
    name: 'publicShort',
    revalidate: CACHE_SECONDS.publicShort,
    headers: {
      'Cache-Control': `public, max-age=0, s-maxage=${CACHE_SECONDS.publicShort}, must-revalidate`,
    },
  },
  publicCatalog: {
    name: 'publicCatalog',
    revalidate: CACHE_SECONDS.publicCatalog,
    headers: {
      'Cache-Control': `public, max-age=0, s-maxage=${CACHE_SECONDS.publicCatalog}, must-revalidate`,
    },
  },
  publicDetail: {
    name: 'publicDetail',
    revalidate: CACHE_SECONDS.publicDetail,
    headers: {
      'Cache-Control': `public, max-age=0, s-maxage=${CACHE_SECONDS.publicDetail}, must-revalidate`,
    },
  },
  noStore: {
    name: 'noStore',
    revalidate: 0,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  },
};

export const API_CACHE_HEADERS = {
  publicShort: CACHE_POLICIES.publicShort.headers,
  publicCatalog: CACHE_POLICIES.publicCatalog.headers,
  publicDetail: CACHE_POLICIES.publicDetail.headers,
  privateUser: CACHE_POLICIES.noStore.headers,
  storeConsole: CACHE_POLICIES.noStore.headers,
  adminOps: CACHE_POLICIES.noStore.headers,
  mutation: CACHE_POLICIES.noStore.headers,
  noStore: CACHE_POLICIES.noStore.headers,
};

export function getCacheHeaders(policy = 'noStore') {
  return API_CACHE_HEADERS[policy] || API_CACHE_HEADERS.noStore;
}

export function nextCacheOptions({ policy = 'publicCatalog', tags = [] } = {}) {
  const resolved = CACHE_POLICIES[policy] || CACHE_POLICIES.publicCatalog;

  if (resolved.name === 'noStore') {
    return { cache: 'no-store' };
  }

  return {
    next: {
      revalidate: resolved.revalidate,
      tags,
    },
  };
}
