'use client';

import { useCallback, useState } from 'react';

export default function useProductEditorActions({
  product,
  productId,
  loadProduct,
  setError,
  setNotice,
  onDuplicateComplete,
  onDeleteComplete,
}) {
  const [acting, setActing] = useState('');

  const printProductLabel = useCallback(() => {
    if (!product?.sku) {
      setError('A product SKU is required.');
      return;
    }

    const escHtml = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const label = escHtml(product.name || 'Product');
    const safeSku = escHtml(product.sku);
    const printWindow = window.open('', '_blank', 'width=820,height=620');
    if (!printWindow) return;

    // Barcode bars are generated from character codes only — no user content enters the DOM
    const bars = product.sku.split('').map((character) => {
      const w = character === '-' ? 1 : (character.charCodeAt(0) % 3) + 2;
      const h = 55 + (character.charCodeAt(0) % 40);
      return `<div class="br" style="width:${w}px;height:${h}%"></div>`;
    }).join('');

    printWindow.document.write(`<html><head><title>Print Labels</title><style>body{font-family:monospace;margin:0;padding:16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.l{border:1px solid #ccc;padding:14px;text-align:center}.l h4{margin:0 0 6px;font-size:10px;color:#666}.l .s{font-size:13px;font-weight:bold;letter-spacing:1.5px}.b{display:flex;justify-content:center;gap:1px;margin:6px 0;height:45px;align-items:flex-end}.br{background:#000;border-radius:.5px}</style></head><body><div class="g"><div class="l"><h4>${label}</h4><div class="b">${bars}</div><div class="s">${safeSku}</div></div></div></body></html>`);
    printWindow.document.close();
    printWindow.addEventListener('load', () => printWindow.print(), { once: true });
    setNotice('Print view opened.');
  }, [product, setError, setNotice]);

  const duplicateProduct = useCallback(async () => {
    try {
      setActing('duplicate');
      setError('');

      const response = await fetch(`/api/store/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed');

      onDuplicateComplete?.(json.data.id);
    } catch (err) {
      setError(err.message || 'Failed to duplicate');
    } finally {
      setActing('');
    }
  }, [onDuplicateComplete, productId, setError]);

  const toggleArchive = useCallback(async (archive) => {
    try {
      setActing(archive ? 'archive' : 'unarchive');

      const response = await fetch(`/api/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive }),
      });
      if (!response.ok) throw new Error('Failed');

      await loadProduct();
      setNotice(archive ? 'Archived.' : 'Unarchived.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActing('');
    }
  }, [loadProduct, productId, setError, setNotice]);

  const deleteProduct = useCallback(async () => {
    try {
      setActing('delete');
      const response = await fetch(`/api/store/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');
      onDeleteComplete?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActing('');
    }
  }, [onDeleteComplete, productId, setError]);

  return {
    acting,
    printProductLabel,
    duplicateProduct,
    toggleArchive,
    deleteProduct,
  };
}
