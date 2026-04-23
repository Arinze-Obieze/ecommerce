"use client";

import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2E6417]">Something went wrong</p>
        <h1 className="mt-2 text-xl font-bold text-gray-900">The page crashed unexpectedly.</h1>
        <p className="mt-2 text-sm text-gray-600">
          You can retry this action, or go back to the previous page.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[#2E6417] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245213]"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>

        {process.env.NODE_ENV !== "production" && error?.message ? (
          <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{error.message}</p>
        ) : null}
      </div>
    </main>
  );
}
