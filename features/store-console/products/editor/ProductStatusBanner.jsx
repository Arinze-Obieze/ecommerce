"use client";

import { getToneClasses } from "@/features/store-console/products/editor/productDetailEditor.utils";

export default function ProductStatusBanner({ statusMeta, rejectionReason }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${getToneClasses(statusMeta.tone)}`}>
      <h2 className="font-bold">{statusMeta.title}</h2>
      <p className="mt-1 text-sm">{statusMeta.message}</p>
      {rejectionReason ? (
        <p className="mt-2 rounded bg-white/70 px-2 py-1 text-sm font-medium">
          Rejection: {rejectionReason}
        </p>
      ) : null}
    </div>
  );
}
