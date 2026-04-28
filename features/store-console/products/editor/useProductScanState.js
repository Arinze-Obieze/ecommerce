'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildVariantLabel,
  normalizeQuickSellQuantity,
  resolveQuickSellState,
} from '@/features/store-console/products/editor/productDetailEditor.utils';

export default function useProductScanState({
  product,
  loadProduct,
  setError,
  setNotice,
}) {
  const [quickSelling, setQuickSelling] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellQuantityInput, setSellQuantityInput] = useState('1');
  const [selectedScanVariantId, setSelectedScanVariantId] = useState('');

  useEffect(() => {
    setSellQuantityInput(String(sellQuantity));
  }, [sellQuantity]);

  useEffect(() => {
    const nextVariants = Array.isArray(product?.variants) ? product.variants : [];
    if (nextVariants.length > 0) {
      const firstInStock = nextVariants.find(
        (variant) => (Number.parseInt(variant?.stock_quantity, 10) || 0) > 0
      );
      setSelectedScanVariantId(String(firstInStock?.id || nextVariants[0]?.id || ''));
    } else {
      setSelectedScanVariantId('');
    }
  }, [product]);

  const sellOneViaScan = useCallback(async () => {
    if (!product?.id) return;

    const normalizedQuantity = normalizeQuickSellQuantity(sellQuantityInput);
    if (normalizedQuantity !== sellQuantity) {
      setSellQuantity(normalizedQuantity);
    }

    const productVariants = Array.isArray(product?.variants) ? product.variants : [];
    const hasVariants = productVariants.length > 0;
    const selectedVariant = hasVariants
      ? productVariants.find((variant) => String(variant.id) === String(selectedScanVariantId))
      : null;

    try {
      setQuickSelling(true);
      setError('');
      setNotice('');

      let response;
      if (hasVariants) {
        if (!selectedVariant?.id) {
          throw new Error('Select a variant before selling.');
        }
        if ((Number.parseInt(selectedVariant?.stock_quantity, 10) || 0) < normalizedQuantity) {
          throw new Error(`Selected variant has less than ${normalizedQuantity} in stock.`);
        }

        response = await fetch('/api/store/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'adjust_variant',
            variantId: String(selectedVariant.id),
            mode: 'subtract',
            quantity: normalizedQuantity,
            reason: 'count',
            note: 'POS quick sale via QR scan',
          }),
        });
      } else {
        if ((Number.parseInt(product.stock_quantity, 10) || 0) < normalizedQuantity) {
          throw new Error(`Stock is less than ${normalizedQuantity}.`);
        }

        response = await fetch('/api/store/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'adjust_product',
            productId: Number.parseInt(product.id, 10),
            mode: 'subtract',
            quantity: normalizedQuantity,
            reason: 'count',
            note: 'POS quick sale via QR scan',
          }),
        });
      }

      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || 'Failed to reduce inventory');

      await loadProduct({ preserveNotice: false });
      if (hasVariants && selectedVariant) {
        setNotice(
          `Sold ${normalizedQuantity} unit(s) (${buildVariantLabel(selectedVariant)}). Inventory updated.`
        );
      } else {
        setNotice(`Sold ${normalizedQuantity} unit(s). Inventory updated.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to reduce inventory');
    } finally {
      setQuickSelling(false);
    }
  }, [loadProduct, product, selectedScanVariantId, sellQuantity, sellQuantityInput, setError, setNotice]);

  const quickSellState = useMemo(
    () =>
      resolveQuickSellState({
        product,
        selectedScanVariantId,
        sellQuantityInput,
        quickSelling,
      }),
    [product, quickSelling, selectedScanVariantId, sellQuantityInput]
  );

  return {
    quickSelling,
    sellQuantity,
    setSellQuantity,
    sellQuantityInput,
    setSellQuantityInput,
    selectedScanVariantId,
    setSelectedScanVariantId,
    sellOneViaScan,
    quickSellState,
  };
}
