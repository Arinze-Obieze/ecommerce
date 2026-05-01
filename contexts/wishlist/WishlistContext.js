"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/contexts/toast/ToastContext";
import { trackAnalyticsEvent } from '@/utils/telemetry/analytics';

const noop = () => {};
const WISHLIST_DEFAULT = {
  wishlistItems: [],
  isLoading: false,
  addToWishlist: noop,
  removeFromWishlist: noop,
  toggleWishlist: noop,
  isInWishlist: () => false,
};

const WishlistContext = createContext(WISHLIST_DEFAULT);

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { success, error: errorToast } = useToast();

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set(data.map(item => item.product_id));
      setWishlistItems(ids);
    } catch (error) {
      console.error("Error fetching wishlist:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wishlist on user login
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems(new Set());
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      errorToast("Please login to add to wishlist");
      return;
    }

    if (wishlistItems.has(productId)) {
        success("Already in wishlist");
        return;
    }

    // Optimistic Update
    setWishlistItems(prev => new Set(prev).add(productId));

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;
      trackAnalyticsEvent('add_to_wishlist', { product_id: productId });
      success("Added to wishlist");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      // Revert optimism
      setWishlistItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      errorToast("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    // Optimistic Update
    setWishlistItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
    });

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ user_id: user.id, product_id: productId });

      if (error) throw error;
      trackAnalyticsEvent('remove_from_wishlist', { product_id: productId });
      success("Removed from wishlist");
    } catch (err) {
        console.error("Error removing from wishlist:", err);
         // Revert optimism (add back)
        setWishlistItems(prev => new Set(prev).add(productId));
        errorToast("Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId) => wishlistItems.has(productId);

  const toggleWishlist = (productId) => {
      if (isInWishlist(productId)) {
          removeFromWishlist(productId);
      } else {
          addToWishlist(productId);
      }
  }

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};
