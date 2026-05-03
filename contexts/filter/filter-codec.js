const INITIAL_FILTERS = {
  search: '',
  category: '',
  collection: '',
  minPrice: null,
  maxPrice: null,
  sizes: [],
  colors: [],
  sortBy: 'newest',
  page: 1,
  inStock: false,
  onSale: false,
};

function getShopPathCategory(pathname) {
  const match = pathname?.match(/^\/shop\/([^/]+)\/?$/);
  if (!match) return '';

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function isShopPath(pathname) {
  return pathname === '/shop' || pathname?.startsWith('/shop/');
}

export function getInitialFilters() {
  return {
    ...INITIAL_FILTERS,
    sizes: [...INITIAL_FILTERS.sizes],
    colors: [...INITIAL_FILTERS.colors],
  };
}

export function urlToFilterState(searchParams, pathname = '') {
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(searchParams || '');
  const categoryParam = params.get('category');
  const pathCategory = getShopPathCategory(pathname);
  const resolvedCategory = categoryParam ?? pathCategory;

  return {
    search: params.get('search') || '',
    category: resolvedCategory === 'all' ? '' : resolvedCategory || '',
    collection: params.get('collection') || '',
    minPrice: params.get('minPrice') ? Number.parseFloat(params.get('minPrice')) : null,
    maxPrice: params.get('maxPrice') ? Number.parseFloat(params.get('maxPrice')) : null,
    sizes: params.get('sizes') ? params.get('sizes').split(',').filter(Boolean) : [],
    colors: params.get('colors') ? params.get('colors').split(',').filter(Boolean) : [],
    sortBy: params.get('sortBy') || 'newest',
    page: Number.parseInt(params.get('page') || '1', 10),
    inStock: params.get('inStock') === 'true',
    onSale: params.get('onSale') === 'true',
  };
}

export function filterStateToUrl(filters, pathname) {
  const params = new URLSearchParams();
  const includeCategory = !isShopPath(pathname);

  if (filters.search) params.set('search', filters.search);
  if (includeCategory && filters.category) params.set('category', filters.category);
  if (filters.collection) params.set('collection', filters.collection);
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.sizes.length) params.set('sizes', filters.sizes.join(','));
  if (filters.colors.length) params.set('colors', filters.colors.join(','));
  if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.onSale) params.set('onSale', 'true');

  return {
    pathname: isShopPath(pathname)
      ? filters.category
        ? `/shop/${encodeURIComponent(filters.category)}`
        : '/shop'
      : pathname,
    queryString: params.toString(),
  };
}
