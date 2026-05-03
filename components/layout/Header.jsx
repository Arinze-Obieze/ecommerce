"use client";

import { useEffect, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  return (
    <header className={`zova-header sticky top-0 z-50 ${scrolled ? "is-scrolled" : ""}`}>
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
  );
}
