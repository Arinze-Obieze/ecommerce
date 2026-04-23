import { revalidatePath, revalidateTag } from 'next/cache';
import {
  CACHE_TAGS,
  productDetailTag,
  productReviewsTag,
  productsByStoreTag,
  storeDetailTag,
} from '@/utils/platform/cache-tags';

export function invalidateCacheTags(tags = []) {
  const uniqueTags = [...new Set(tags.filter(Boolean).map(String))];

  for (const tag of uniqueTags) {
    revalidateTag(tag);
  }
}

export function invalidateProductCache(product = {}) {
  invalidateCacheTags([
    CACHE_TAGS.products,
    CACHE_TAGS.productsList,
    CACHE_TAGS.storefrontHome,
    product.id ? productDetailTag(product.id) : null,
    product.store_id ? productsByStoreTag(product.store_id) : null,
    product.store_id ? storeDetailTag(product.store_id) : null,
  ]);

  revalidatePath('/');
  revalidatePath('/shop');
  if (product.slug) revalidatePath(`/products/${product.slug}`);
}

export function invalidateProductsCache(products = []) {
  const tags = [
    CACHE_TAGS.products,
    CACHE_TAGS.productsList,
    CACHE_TAGS.storefrontHome,
  ];

  for (const product of products) {
    if (product?.id) tags.push(productDetailTag(product.id));
    if (product?.store_id) {
      tags.push(productsByStoreTag(product.store_id));
      tags.push(storeDetailTag(product.store_id));
    }
  }

  invalidateCacheTags(tags);

  revalidatePath('/');
  revalidatePath('/shop');
  for (const product of products) {
    if (product?.slug) revalidatePath(`/products/${product.slug}`);
  }
}

export function invalidateStoreCache(store = {}) {
  invalidateCacheTags([
    CACHE_TAGS.stores,
    CACHE_TAGS.storesList,
    CACHE_TAGS.storesTop,
    CACHE_TAGS.storefrontHome,
    store.id ? storeDetailTag(store.id) : null,
    store.id ? productsByStoreTag(store.id) : null,
  ]);

  revalidatePath('/');
  revalidatePath('/stores');
  if (store.slug) revalidatePath(`/store/${store.slug}`);
  if (store.id) revalidatePath(`/store/${store.id}`);
}

export function invalidateReviewCache(review = {}) {
  invalidateCacheTags([
    CACHE_TAGS.products,
    CACHE_TAGS.productsList,
    review.product_id ? productDetailTag(review.product_id) : null,
    review.product_id ? productReviewsTag(review.product_id) : null,
  ]);

  revalidatePath('/shop');
}

export function invalidateReturnPolicyCache() {
  invalidateCacheTags([CACHE_TAGS.returnPolicy]);
  revalidatePath('/return-policy');
}
