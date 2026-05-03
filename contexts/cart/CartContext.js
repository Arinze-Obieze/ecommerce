"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/contexts/toast/ToastContext';
import { trackAnalyticsEvent } from '@/utils/telemetry/analytics';
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/storage-keys';
import { findCartItem, isSameCartItem, migrateStorageKey } from '@/contexts/cart/cart-utils';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { success, error } = useToast();
  const sessionIdRef = React.useRef(null);

  const trackCartServerEvent = (eventType, item = {}) => {
    if (typeof window === 'undefined') return;

    if (!sessionIdRef.current) {
      const existing = migrateStorageKey(STORAGE_KEYS.CART_SESSION_ID, LEGACY_STORAGE_KEYS.CART_SESSION_ID);
      if (existing) {
        sessionIdRef.current = existing;
      } else {
        const generated = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionIdRef.current = generated;
        localStorage.setItem(STORAGE_KEYS.CART_SESSION_ID, generated);
      }
    }

    fetch('/api/analytics/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        session_id: sessionIdRef.current,
        item: {
          product_id: item.id,
          variant_id: item.variant_id || null,
          quantity: Number(item.quantity || 1),
          store_id: item.store_id || null,
        },
      }),
    }).catch(() => null);
  };

  const normalizeMaxStock = (item) => {
    const stock = Number(item?.stock_quantity);
    if (Number.isFinite(stock) && stock > 0) {
      return Math.floor(stock);
    }
    return Infinity;
  };

  const buildVariantLabel = (item) => {
    const parts = [item?.selectedColor, item?.selectedSize].filter(Boolean);
    return parts.length ? parts.join(' / ') : '';
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = migrateStorageKey(STORAGE_KEYS.CART, LEGACY_STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const incomingQuantity = Math.max(1, Number(product.quantity) || 1);
    const maxStock = normalizeMaxStock(product);
    const incomingVariantId = product.variant_id === undefined ? null : product.variant_id;
    const existingCartItem = findCartItem(cart, product.id, incomingVariantId);
    const effectiveMaxStock = normalizeMaxStock(existingCartItem || product);
    const addedQuantity = existingCartItem
      ? Math.max(0, Math.min(effectiveMaxStock, existingCartItem.quantity + incomingQuantity) - existingCartItem.quantity)
      : Math.min(maxStock, incomingQuantity);

    if (maxStock <= 0) {
      error(`${product.name} is out of stock`);
      return;
    }

    setCart((prevCart) => {
      // Find item with same Product ID AND same Variant ID
      const existing = findCartItem(prevCart, product.id, incomingVariantId);

      if (existing) {
        return prevCart.map((p) => {
          const itemMaxStock = normalizeMaxStock(p);
          return isSameCartItem(p, product.id, incomingVariantId)
            ? { ...p, quantity: Math.min(itemMaxStock, p.quantity + incomingQuantity) } 
            : p;
        });
      }
      return [...prevCart, {
        ...product,
        variant_id: incomingVariantId,
        quantity: Math.min(maxStock, incomingQuantity),
      }];
    });

    trackAnalyticsEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      quantity: addedQuantity,
      variant_id: product.variant_id || null,
      unit_price: Number(product.discount_price || product.price || 0),
    });
    if (addedQuantity > 0) {
      trackCartServerEvent('add', {
        id: product.id,
        variant_id: product.variant_id || null,
        quantity: addedQuantity,
        store_id: product.store_id || null,
      });
    }

    const variantLabel = buildVariantLabel(product);
    success(variantLabel ? `Added ${product.name} (${variantLabel}) to cart` : `Added ${product.name} to cart`);
  };

  const removeFromCart = (productId, variantId = null) => {
    const targetVariantId = variantId === undefined ? null : variantId;
    const removedItem = findCartItem(cart, productId, targetVariantId);

    setCart((prevCart) => {
        const newCart = prevCart.filter((item) => !isSameCartItem(item, productId, targetVariantId));
        
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newCart));
        return newCart;
    });
    if (removedItem) {
      trackCartServerEvent('remove', {
        id: removedItem.id,
        variant_id: removedItem.variant_id || null,
        quantity: removedItem.quantity || 1,
        store_id: removedItem.store_id || null,
      });
    }
  };

  const updateQuantity = (productId, amount, variantId = null) => {
    const targetVariantId = variantId === undefined ? null : variantId;
    const targetItem = findCartItem(cart, productId, targetVariantId);
    if (targetItem) {
      const maxStock = normalizeMaxStock(targetItem);
      const newQuantity = Math.min(maxStock, Math.max(1, targetItem.quantity + amount));
      const delta = newQuantity - targetItem.quantity;
      if (delta !== 0) {
        trackCartServerEvent(delta > 0 ? 'add' : 'remove', {
          id: targetItem.id,
          variant_id: targetItem.variant_id || null,
          quantity: Math.abs(delta),
          store_id: targetItem.store_id || null,
        });
      }
    }

    setCart((prevCart) => {
        return prevCart.map(item => {
            if (isSameCartItem(item, productId, targetVariantId)) {
                const maxStock = normalizeMaxStock(item);
                const newQuantity = Math.min(maxStock, Math.max(1, item.quantity + amount));
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
    });
  };

  const setItemQuantity = (productId, newQuantity, variantId = null) => {
    const targetVariantId = variantId === undefined ? null : variantId;
    const targetItem = findCartItem(cart, productId, targetVariantId);
    if (targetItem) {
      const maxStock = normalizeMaxStock(targetItem);
      const boundedQuantity = Math.min(maxStock, Math.max(1, newQuantity));
      const delta = boundedQuantity - targetItem.quantity;
      if (delta !== 0) {
        trackCartServerEvent(delta > 0 ? 'add' : 'remove', {
          id: targetItem.id,
          variant_id: targetItem.variant_id || null,
          quantity: Math.abs(delta),
          store_id: targetItem.store_id || null,
        });
      }
    }

    setCart((prevCart) => {
        return prevCart.map(item => {
            if (isSameCartItem(item, productId, targetVariantId)) {
                const maxStock = normalizeMaxStock(item);
                const boundedQuantity = Math.min(maxStock, Math.max(1, newQuantity));
                return { ...item, quantity: boundedQuantity };
            }
            return item;
        });
    });
  };

  const clearCart = () => {
    cart.forEach((item) => {
      trackCartServerEvent('clear', {
        id: item.id,
        variant_id: item.variant_id || null,
        quantity: item.quantity || 1,
        store_id: item.store_id || null,
      });
    });
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.CART);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, setItemQuantity, clearCart, cartCount }),
    [cart, cartCount]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
