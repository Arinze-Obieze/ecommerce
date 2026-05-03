"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ProductMediaStep({
  media,
  images,
  primaryImageUrl,
  setPrimaryImageUrl,
  removeMedia,
  onFilesSelected,
  uploading,
  goToStep,
}) {
  return (
    <div className="space-y-6">
      <div className="zova-store-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-(--zova-text-strong)">Media</h2>
            <p className="mt-1 text-sm text-(--zova-text-muted)">
              Upload at least 1 image. Choose your cover image.
            </p>
          </div>

          <label className="zova-store-toolbar-btn is-primary cursor-pointer">
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" multiple className="hidden" onChange={onFilesSelected} />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          {media.map((item) => (
            <div key={item.id} className="zova-store-media-row">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--zova-surface-alt)]">
                {item.type === "image" ? (
                  <img src={item.public_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold">VIDEO</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-(--zova-text-strong)">{item.public_url}</p>
                <p className="text-xs uppercase text-(--zova-text-muted)">{item.type}</p>
              </div>

              {item.type === "image" ? (
                <label className="flex items-center gap-1 px-2 text-xs">
                  <input
                    type="radio"
                    name="primary"
                    checked={primaryImageUrl === item.public_url}
                    onChange={() => setPrimaryImageUrl(item.public_url)}
                  />
                  Cover
                </label>
              ) : null}

              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          {media.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--zova-border)] px-4 py-8 text-center text-sm text-(--zova-text-muted)">
              Upload at least one image to proceed.
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => goToStep(1)} className="zova-store-toolbar-btn flex-1 justify-center py-3">
          <FiChevronLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={() => goToStep(3)}
          disabled={images.length === 0}
          className="zova-btn zova-btn-primary flex-1 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          Continue
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
