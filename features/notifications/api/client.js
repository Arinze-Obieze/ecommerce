"use client";

import { apiJson } from "@/features/shared/api/http";

export function getAccountNotifications(endpoint) {
  return apiJson(endpoint, { cache: "no-store" });
}

export function updateAccountNotifications(body) {
  return apiJson("/api/account/notifications", {
    method: "PATCH",
    body,
    cache: "no-store",
  });
}
