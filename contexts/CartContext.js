"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { success, error } = useToast();

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
    setCart((prevCart) => {
      const existing = prevCart.find((p) => p.id === product.id);
      if (existing) {
        return prevCart.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + (product.quantity || 1) } : p
        );
      }
      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });

    success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
        const newCart = prevCart.filter((p) => p.id !== productId);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
    });
    // Optional: info or error toast for removal? 
    // success('Removed from cart'); 
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => {
        return prevCart.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}
