"use client";

import { useRouter } from "next/navigation";

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="bg-[#f4f5f7]">
        <main className="min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2E5C45]">Application error</p>
            <h1 className="mt-2 text-xl font-bold text-gray-900">The app hit an unexpected error.</h1>
            <p className="mt-2 text-sm text-gray-600">
              Try again, or return to the previous page.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38]"
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
      </body>
    </html>
  );
}
