"use client";

import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function HeaderSearch({
  searchQuery,
  setSearchQuery,
  onSubmit,
  isMobile = false,
}) {
  const [focused, setFocused] = useState(false);

  const wrapperClassName = isMobile
    ? "zova-header-search-wrap w-full"
    : "zova-header-search-wrap mx-6 hidden max-w-xl flex-1 md:block lg:max-w-2xl";

  return (
    <form
      className={wrapperClassName}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      role="search"
    >
      <div className={`zova-header-search ${focused ? "is-focused" : ""}`}>
        <FiSearch className="zova-header-search-icon h-4 w-4" />
        <input
          type="text"
          className="zova-header-search-input"
          placeholder="Search products, brands..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {searchQuery ? (
          <button
            type="button"
            className="zova-header-search-clear"
            aria-label="Clear search"
            onClick={() => setSearchQuery("")}
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
    </form>
  );
}
