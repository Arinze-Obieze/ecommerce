'use client';

import { useCallback, useEffect, useState } from 'react';

export default function useProductEditorResource(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadProduct = useCallback(async ({ preserveNotice = true } = {}) => {
    try {
      setLoading(true);
      setError('');
      if (!preserveNotice) setNotice('');

      const response = await fetch(`/api/store/products/${productId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load product');

      setProduct(json.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    void loadProduct({ preserveNotice: false });
  }, [loadProduct, productId]);

  return {
    product,
    loading,
    error,
    setError,
    notice,
    setNotice,
    loadProduct,
  };
}
