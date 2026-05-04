'use client';

import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  emptyMessage = 'No matches found',
  allowCustom = false,
  customOptionLabel,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value || '');
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    setQuery(value || '');
  }, [value]);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const trimmedQuery = String(query || '').trim();
  const hasExactMatch = React.useMemo(
    () => options.some((option) => option.toLowerCase() === trimmedQuery.toLowerCase()),
    [options, trimmedQuery]
  );

  return (
    <div className="relative" ref={rootRef}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <span className={`text-xs text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && !disabled ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]">
          <div className="border-b border-gray-100 p-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-[#f8faf8] px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              <>
                {allowCustom && trimmedQuery && !hasExactMatch ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: trimmedQuery } });
                      setQuery(trimmedQuery);
                      setIsOpen(false);
                    }}
                    className="mb-1 flex w-full items-center justify-between rounded-xl border border-dashed border-[#b9d5c4] bg-[#f8fcf9] px-3 py-2.5 text-left text-sm font-semibold text-[#1f5f43] transition hover:bg-[#f1faf4]"
                  >
                    <span>
                      {customOptionLabel ? customOptionLabel(trimmedQuery) : `Use "${trimmedQuery}"`}
                    </span>
                    <FiCheckCircle className="h-4 w-4 text-primary" />
                  </button>
                ) : null}
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: option } });
                      setQuery(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      option === value
                        ? 'bg-primary-soft font-semibold text-[#1f5f43]'
                        : 'text-gray-700 hover:bg-[#f5f8f6]'
                    }`}
                  >
                    <span>{option}</span>
                    {option === value ? <FiCheckCircle className="h-4 w-4 text-primary" /> : null}
                  </button>
                ))}
              </>
            ) : (
              <div className="space-y-2 px-3 py-4">
                {allowCustom && trimmedQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: trimmedQuery } });
                      setQuery(trimmedQuery);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-dashed border-[#b9d5c4] bg-[#f8fcf9] px-3 py-2.5 text-left text-sm font-semibold text-[#1f5f43] transition hover:bg-[#f1faf4]"
                  >
                    <span>
                      {customOptionLabel ? customOptionLabel(trimmedQuery) : `Use "${trimmedQuery}"`}
                    </span>
                    <FiCheckCircle className="h-4 w-4 text-primary" />
                  </button>
                ) : null}
                <div className="text-sm text-gray-500">{emptyMessage}</div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
