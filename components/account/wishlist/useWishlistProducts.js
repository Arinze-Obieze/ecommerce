"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/contexts/wishlist/WishlistContext";
import { getCatalogProducts } from "@/features/catalog/api/client";

export default function useWishlistProducts(surface) {
  const { wishlistItems, isLoading: isWishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function fetchWishlistProducts() {
      if (wishlistItems.size === 0) {
        if (isActive) {
          setProducts([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const response = await getCatalogProducts(
          {
            ids: Array.from(wishlistItems).join(","),
            limit: 100,
            includeOutOfStock: true,
          },
          surface
        );

        if (!isActive) {
          return;
        }

        if (response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (isActive) {
          console.error("Failed to fetch wishlist products:", error);
          setProducts([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchWishlistProducts();

    return () => {
      isActive = false;
    };
  }, [surface, wishlistItems]);

  return {
    isWishlistLoading,
    wishlistCount: wishlistItems.size,
    products,
    isLoading,
  };
}
