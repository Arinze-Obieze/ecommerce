"use client";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className={[
          "relative w-full max-w-lg rounded-2xl border border-(--zova-border) bg-white shadow-xl",
          className,
        ].join(" ")}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-(--zova-border) px-5 py-4">
            {title && <h2 className="text-base font-bold text-(--zova-text-strong)">{title}</h2>}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-lg p-1.5 text-(--zova-text-muted) hover:bg-(--zova-surface-alt) hover:text-(--zova-text-strong) transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
