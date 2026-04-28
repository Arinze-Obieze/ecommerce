"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function useOrderHistory(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    async function fetchOrders() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select("id, total_amount, status, created_at, order_items(id, product_id, quantity, price)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (isActive) {
          setOrders(data || []);
        }
      } catch (error) {
        if (isActive) {
          console.error("Error fetching orders:", error);
          setOrders([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    fetchOrders();

    return () => {
      isActive = false;
    };
  }, [userId]);

  return {
    orders,
    loading,
  };
}
