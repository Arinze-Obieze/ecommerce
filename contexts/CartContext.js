"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { trackAnalyticsEvent } from '@/utils/analytics';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { success, error } = useToast();

  const normalizeMaxStock = (item) => {
    const stock = Number(item?.stock_quantity);
    if (Number.isFinite(stock) && stock > 0) {
      return Math.floor(stock);
    }
    return Infinity;
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

    if (maxStock <= 0) {
      error(`${product.name} is out of stock`);
      return;
    }

    setCart((prevCart) => {
      const incomingVariantId = product.variant_id === undefined ? null : product.variant_id;
      
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
      quantity: incomingQuantity,
      variant_id: product.variant_id || null,
      unit_price: Number(product.discount_price || product.price || 0),
    });

    success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) => {
        // Normalize undefined to null for consistent comparison
        const targetVariantId = variantId === undefined ? null : variantId;
        
        const newCart = prevCart.filter((p) => {
            const pVariantId = p.variant_id === undefined ? null : p.variant_id;
            // Remove if both ID and Variant ID match
            return !(p.id === productId && pVariantId === targetVariantId);
        });
        
        localStorage.setItem('shophub_cart', JSON.stringify(newCart)); // Fixed key name `shophub_cart`
        return newCart;
    });
  };

  const updateQuantity = (productId, amount, variantId = null) => {
    setCart((prevCart) => {
        const targetVariantId = variantId === undefined ? null : variantId;
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
    setCart((prevCart) => {
        const targetVariantId = variantId === undefined ? null : variantId;
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
