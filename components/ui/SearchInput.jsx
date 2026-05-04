"use client";
import { useRef } from "react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
  inputClassName = "",
  autoFocus = false,
}) {
  const ref = useRef(null);

  return (
    <div className={["relative flex items-center", className].join(" ")}>
      <svg
        className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-(--zova-text-muted)"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={[
          "w-full rounded-xl border border-(--zova-border) bg-white py-2 pl-9 pr-8 text-sm text-(--zova-text-strong) placeholder:text-(--zova-text-muted)",
          "focus:border-(--zova-primary-action) focus:ring-2 focus:ring-(--zova-primary-action)/20 focus:outline-none",
          inputClassName,
        ].join(" ")}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); ref.current?.focus(); }}
          className="absolute right-2.5 rounded p-0.5 text-(--zova-text-muted) hover:text-(--zova-text-strong)"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
