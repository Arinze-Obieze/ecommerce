"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

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
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    showToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((p) => p.id !== productId));
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartCount }}>
      {children}
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#2E5C45] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full">
              <FiCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-sm">Success</p>
              <p className="text-xs text-white/90">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}
