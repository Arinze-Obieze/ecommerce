import { createPublicClient } from '@/utils/supabase/public';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zova.ng';

const STATIC_ROUTES = [
  { url: '/', changeFrequency: 'daily', priority: 1.0 },
  { url: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { url: '/stores', changeFrequency: 'daily', priority: 0.8 },
  { url: '/login', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/signup', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap() {
  const supabase = createPublicClient();

  const [productsResult, categoriesResult, storesResult] = await Promise.allSettled([
    supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5000),

    supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)
      .not('slug', 'is', null),

    supabase
      .from('stores')
      .select('slug')
      .eq('is_active', true)
      .not('slug', 'is', null),
  ]);

  const products = productsResult.status === 'fulfilled' ? (productsResult.value.data ?? []) : [];
  const categories = categoriesResult.status === 'fulfilled' ? (categoriesResult.value.data ?? []) : [];
  const stores = storesResult.status === 'fulfilled' ? (storesResult.value.data ?? []) : [];

  const staticEntries = STATIC_ROUTES.map(({ url, changeFrequency, priority }) => ({
    url: `${BASE_URL}${url}`,
    changeFrequency,
    priority,
  }));

  const productEntries = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${BASE_URL}/shop/${category.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const storeEntries = stores.map((store) => ({
    url: `${BASE_URL}/store/${store.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries, ...storeEntries];
}
