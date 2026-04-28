"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function useProfileOverview({ userId, wishlistCount }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount,
    addressCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setStats({
        totalOrders: 0,
        wishlistCount,
        addressCount: 0,
      });
      setRecentOrders([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    async function fetchStats() {
      try {
        const supabase = createClient();
        const [
          { count: ordersCount },
          { count: addressCount },
          { data: recentOrderRows, error: recentOrdersError },
        ] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("user_addresses").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase
            .from("orders")
            .select("id, total_amount, status, created_at, order_items(id)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        if (recentOrdersError) {
          throw recentOrdersError;
        }

        if (isActive) {
          setStats({
            totalOrders: ordersCount || 0,
            wishlistCount,
            addressCount: addressCount || 0,
          });
          setRecentOrders(recentOrderRows || []);
        }
      } catch (error) {
        if (isActive) {
          console.error("Error fetching stats:", error);
          setStats({
            totalOrders: 0,
            wishlistCount,
            addressCount: 0,
          });
          setRecentOrders([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    fetchStats();

    return () => {
      isActive = false;
    };
  }, [userId, wishlistCount]);

  return {
    stats,
    recentOrders,
    loading,
  };
}
