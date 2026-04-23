import { nextCacheOptions } from '@/utils/platform/cache-policy';

export function publicCatalogFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    ...nextCacheOptions({ policy: 'publicCatalog', tags: options.tags || [] }),
  });
}

export function publicShortFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    ...nextCacheOptions({ policy: 'publicShort', tags: options.tags || [] }),
  });
}

export function noStoreFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    cache: 'no-store',
  });
}
