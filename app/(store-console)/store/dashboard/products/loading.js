import { FiPackage } from "react-icons/fi";

export default function Loading() {
  return (
    <div className="space-y-6 pb-24 md:pb-6 animate-pulse">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-32 rounded-md bg-gray-200"></div>
            <div className="mt-2 h-4 w-64 rounded-md bg-gray-100"></div>
          </div>
          <div className="h-10 w-32 rounded-xl bg-gray-200"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[#E8E4DC] bg-white px-3 py-3 text-center shadow-sm">
            <div className="mx-auto h-3 w-12 rounded bg-gray-100"></div>
            <div className="mx-auto mt-2 h-6 w-8 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="h-5 w-32 rounded-md bg-gray-200"></div>
              <div className="mt-1 h-4 w-64 rounded-md bg-gray-100"></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center py-10 md:py-20 text-gray-300">
          <FiPackage size={48} className="mb-4 opacity-50" />
          <p className="text-sm">Fetching catalog data...</p>
        </div>
      </div>
    </div>
  );
}
