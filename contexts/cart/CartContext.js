"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/contexts/toast/ToastContext';
import { trackAnalyticsEvent } from '@/utils/telemetry/analytics';

const noop = () => {};
const CART_DEFAULT = {
  cart: [],
  cartCount: 0,
  addToCart: noop,
  removeFromCart: noop,
  updateQuantity: noop,
  setItemQuantity: noop,
  clearCart: noop,
};

const CartContext = createContext(CART_DEFAULT);

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
      const existing = localStorage.getItem('cart_session_id');
      if (existing) {
        sessionIdRef.current = existing;
      } else {
        const generated = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionIdRef.current = generated;
        localStorage.setItem('cart_session_id', generated);
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
    const savedCart = localStorage.getItem('shophub_cart');
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
    localStorage.setItem('shophub_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const incomingQuantity = Math.max(1, Number(product.quantity) || 1);
    const maxStock = normalizeMaxStock(product);
    const incomingVariantId = product.variant_id === undefined ? null : product.variant_id;
    const existingCartItem = cart.find((p) => {
      const pVariantId = p.variant_id === undefined ? null : p.variant_id;
      return p.id === product.id && pVariantId === incomingVariantId;
    });
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
      const existing = prevCart.find((p) => {
         const pVariantId = p.variant_id === undefined ? null : p.variant_id;
         return p.id === product.id && pVariantId === incomingVariantId;
      });

      if (existing) {
        return prevCart.map((p) => {
          const pVariantId = p.variant_id === undefined ? null : p.variant_id;
          const itemMaxStock = normalizeMaxStock(p);
          return (p.id === product.id && pVariantId === incomingVariantId)
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
    const removedItem = cart.find((item) => {
      const itemVariantId = item.variant_id === undefined ? null : item.variant_id;
      return item.id === productId && itemVariantId === targetVariantId;
    });

    setCart((prevCart) => {
        const newCart = prevCart.filter((p) => {
            const pVariantId = p.variant_id === undefined ? null : p.variant_id;
            // Remove if both ID and Variant ID match
            return !(p.id === productId && pVariantId === targetVariantId);
        });
        
        localStorage.setItem('shophub_cart', JSON.stringify(newCart)); // Fixed key name `shophub_cart`
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
    const targetItem = cart.find((item) => {
      const itemVariantId = item.variant_id === undefined ? null : item.variant_id;
      return item.id === productId && itemVariantId === targetVariantId;
    });
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
            const itemVariantId = item.variant_id === undefined ? null : item.variant_id;
            if (item.id === productId && itemVariantId === targetVariantId) {
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
    const targetItem = cart.find((item) => {
      const itemVariantId = item.variant_id === undefined ? null : item.variant_id;
      return item.id === productId && itemVariantId === targetVariantId;
    });
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
            const itemVariantId = item.variant_id === undefined ? null : item.variant_id;
            if (item.id === productId && itemVariantId === targetVariantId) {
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
    localStorage.removeItem('shophub_cart');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, setItemQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}
