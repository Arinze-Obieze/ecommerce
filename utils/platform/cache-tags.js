export const CACHE_TAGS = {
  products: 'products',
  productsList: 'products:list',
  categories: 'categories',
  collections: 'collections',
  stores: 'stores',
  storesList: 'stores:list',
  storesTop: 'stores:top',
  storefrontHome: 'storefront:home',
  returnPolicy: 'return-policy',
};

export function productDetailTag(id) {
  return `products:detail:${id}`;
}

export function productsByStoreTag(storeId) {
  return `products:store:${storeId}`;
}

export function storeDetailTag(id) {
  return `stores:detail:${id}`;
}

export function productReviewsTag(productId) {
  return `reviews:product:${productId}`;
}
