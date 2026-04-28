"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function useAdminRole(userId) {
  const [adminRole, setAdminRole] = useState(null);

  useEffect(() => {
    let active = true;

    async function resolveAdminRole() {
      if (!userId) {
        if (active) setAdminRole(null);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (!active) return;
      setAdminRole(error || !data ? null : data.role || null);
    }

    resolveAdminRole();
    return () => {
      active = false;
    };
  }, [userId]);

  return adminRole;
}
