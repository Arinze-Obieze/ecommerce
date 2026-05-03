"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import HeaderActions from "@/components/layout/header/HeaderActions";
import HeaderLogo from "@/components/layout/header/HeaderLogo";
import HeaderSearch from "@/components/layout/header/HeaderSearch";
import { HIDDEN_HEADER_ROUTES, SEARCH_ENABLED_ROUTES } from "@/components/layout/header/header.constants";
import useAdminRole from "@/components/layout/header/useAdminRole";
import { trackAnalyticsEvent } from "@/utils/telemetry/analytics";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const adminRole = useAdminRole(user?.id);
  const headerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function onScroll() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      setScrolled(currentScrollY > 4);

      if (currentScrollY <= 12) {
        setHeaderVisible(true);
      } else if (delta > 8) {
        setHeaderVisible(false);
      } else if (delta < -8) {
        setHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return undefined;

    const updateHeight = () => {
      setHeaderHeight(node.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  function handleSearchSubmit(nextQuery = searchQuery) {
    const query = String(nextQuery || "").trim();
    trackAnalyticsEvent("search_submitted", { query });
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  }

  if (HIDDEN_HEADER_ROUTES.includes(pathname)) {
    return null;
  }

  const showSearch =
    SEARCH_ENABLED_ROUTES.includes(pathname) || pathname?.startsWith("/shop/");

  const spacerClassName = showSearch
    ? "h-[78px] md:h-[78px]"
    : "h-[78px]";

  return (
    <>
      <div
        aria-hidden="true"
        className={spacerClassName}
        style={headerHeight > 0 ? { height: headerHeight } : undefined}
      />
      <header
        ref={headerRef}
        className={`zova-header fixed inset-x-0 top-0 z-50 ${scrolled ? "is-scrolled" : ""} ${headerVisible ? "is-visible" : "is-hidden"}`}
      >
        <div className="zova-shell w-full py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <HeaderLogo />

            {showSearch ? (
              <HeaderSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSubmit={handleSearchSubmit}
              />
            ) : (
              <div className="hidden flex-1 md:block" />
            )}

            <HeaderActions user={user} signOut={signOut} adminRole={adminRole} />
          </div>

          {showSearch ? (
            <div className="mt-3 md:hidden">
              <HeaderSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSubmit={handleSearchSubmit}
                isMobile
              />
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
