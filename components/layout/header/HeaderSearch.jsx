"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiClock, FiSearch, FiTag, FiX } from "react-icons/fi";

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "";
  return `N${amount.toLocaleString()}`;
}

function buildSuggestionGroups(products) {
  const categoryMap = new Map();

  products.forEach((product) => {
    const category = product.categories?.[0];
    if (!category?.slug || categoryMap.has(category.slug)) return;
    categoryMap.set(category.slug, category);
  });

  return {
    products,
    categories: [...categoryMap.values()].slice(0, 3),
  };
}

export default function HeaderSearch({
  searchQuery,
  setSearchQuery,
  onSubmit,
  isMobile = false,
}) {
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          setSuggestions([]);
          return;
        }
        setSuggestions(Array.isArray(json.data) ? json.data.slice(0, 5) : []);
        setActiveIndex(-1);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const wrapperClassName = isMobile
    ? "zova-header-search-wrap w-full"
    : "zova-header-search-wrap mx-6 hidden max-w-xl flex-1 md:block lg:max-w-2xl";

  const showDropdown = focused && (loading || suggestions.length > 0 || searchQuery.trim().length >= 2);
  const groupedSuggestions = useMemo(() => buildSuggestionGroups(suggestions), [suggestions]);

  const selectSuggestion = (value) => {
    setSearchQuery(value);
    setFocused(false);
    setActiveIndex(-1);
    onSubmit(value);
  };

  const allSelectableItems = [
    ...groupedSuggestions.products.map((product) => ({ type: "product", value: product.name })),
    ...groupedSuggestions.categories.map((category) => ({ type: "category", value: category.name })),
  ];

  return (
    <form
      className={wrapperClassName}
      onSubmit={(event) => {
        event.preventDefault();
        setFocused(false);
        onSubmit();
      }}
      role="search"
    >
      <div className="relative">
        <div className={`zova-header-search ${focused ? "is-focused" : ""}`}>
          <FiSearch className="zova-header-search-icon h-4 w-4" />
          <input
            type="text"
            className="zova-header-search-input"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              if (blurTimeoutRef.current) {
                window.clearTimeout(blurTimeoutRef.current);
              }
              setFocused(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = window.setTimeout(() => {
                setFocused(false);
                setActiveIndex(-1);
              }, 120);
            }}
            onKeyDown={(event) => {
              if (!allSelectableItems.length) return;

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % allSelectableItems.length);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((current) => (current <= 0 ? allSelectableItems.length - 1 : current - 1));
              }

              if (event.key === "Enter" && activeIndex >= 0) {
                event.preventDefault();
                selectSuggestion(allSelectableItems[activeIndex].value);
              }
            }}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-label="Search products and categories"
          />
          {searchQuery ? (
            <button
              type="button"
              className="zova-header-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
              }}
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="submit"
            className="zova-btn zova-btn-primary mr-1.5 shrink-0 rounded-full px-4 py-1.5 text-xs font-bold"
            style={{ padding: "0.72rem 1rem", fontSize: "0.72rem" }}
          >
            Search
          </button>
        </div>

        {showDropdown ? (
          <div className="absolute inset-x-0 top-[calc(100%+0.65rem)] z-[80] overflow-hidden rounded-[24px] border border-(--zova-border) bg-white shadow-[0_24px_60px_rgba(18,24,18,0.14)]">
            {loading ? (
              <div className="px-4 py-4 text-sm text-(--zova-text-muted)">Searching the catalog...</div>
            ) : suggestions.length === 0 ? (
              <div className="space-y-2 px-4 py-4">
                <p className="text-sm font-semibold text-(--zova-ink)">No instant matches yet</p>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(searchQuery.trim())}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-(--zova-primary-action)"
                >
                  Search for "{searchQuery.trim()}"
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                <div className="px-4 py-3">
                  <p className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-(--zova-text-muted)">
                    <FiClock className="h-3.5 w-3.5" />
                    Top Matches
                  </p>
                  <div className="space-y-2">
                    {groupedSuggestions.products.map((product, index) => {
                      const price = product.discount_price || product.price;
                      const isActive = index === activeIndex;
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug || product.id}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setFocused(false);
                            setSearchQuery(product.name);
                          }}
                          className={`flex items-center gap-3 rounded-2xl px-2 py-2 transition ${isActive ? "bg-(--zova-linen)" : "hover:bg-(--zova-linen)"}`}
                        >
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-(--zova-linen)">
                            <img
                              src={product.image_urls?.[0] || "https://placehold.co/120x120?text=Item"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-semibold text-(--zova-ink)">{product.name}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-(--zova-text-muted)">
                              {product.categories?.[0]?.name || "Product"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-(--zova-ink)">{formatMoney(price)}</p>
                            {product.discount_price ? (
                              <p className="text-[11px] text-(--zova-text-muted) line-through">
                                {formatMoney(product.price)}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {groupedSuggestions.categories.length > 0 ? (
                  <div className="px-4 py-3">
                    <p className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-(--zova-text-muted)">
                      <FiTag className="h-3.5 w-3.5" />
                      Suggested Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {groupedSuggestions.categories.map((category, offset) => {
                        const index = groupedSuggestions.products.length + offset;
                        const isActive = index === activeIndex;
                        return (
                          <Link
                            key={category.slug}
                            href={`/shop/${category.slug}`}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setFocused(false);
                              setSearchQuery(category.name);
                            }}
                            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${isActive ? "border-[#B8D4A0] bg-primary-soft text-[#1f5f43]" : "border-gray-200 text-(--zova-text-body) hover:border-[#B8D4A0] hover:bg-primary-soft hover:text-[#1f5f43]"}`}
                          >
                            {category.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="px-4 py-3">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(searchQuery.trim())}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-(--zova-primary-action)"
                  >
                    View all results for "{searchQuery.trim()}"
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </form>
  );
}
