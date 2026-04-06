"use client";
import { useEffect, useState } from "react";
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiChevronDown, FiX } from "react-icons/fi";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { createClient } from "@/utils/supabase/client";

// ============================================================
// 🎨 THEME — ZOVA brand colors
// ============================================================
const THEME = {
  colors: {
    // Primary greens
    primary: '#00B86B',           // ZOVA Green (for accents)
    primaryHover: '#0F7A4F',       // Darker green for hover
    deepEmerald: '#0A3D2E',        // Deep emerald - HEADER BACKGROUND
    gradientEnd: '#0F7A4F',
    greenTint: '#EDFAF3',          // Light green tint for backgrounds
    greenBorder: '#A8DFC4',        // Soft green border
    
    // Neutrals
    white: '#FFFFFF',
    pageBg: '#F9FAFB',
    softGray: '#F5F5F5',
    darkCharcoal: '#111111',
    mediumGray: '#666666',
    mutedText: '#888888',
    border: '#E8E8E8',
    cardBorder: '#EFEFEF',
    
    // Accent colors
    saleRed: '#E53935',
    trendingOrange: '#EA580C',
    starYellow: '#F59E0B',
    whatsappGreen: '#25D366',
  },
  shadows: {
    header: '0 4px 20px rgba(0, 0, 0, 0.15)',
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
    dropdown: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },
  transitions: {
    default: 'all 0.2s ease',
  }
};

// ── Logo ─────────────────────────────────────────────────────
const HeaderLogo = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="shrink-0 group">
      <div className="flex items-center gap-3">
        {/* Logo image with fallback - increased size */}
        <div className="relative w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-110">
          {!logoError ? (
            <Image
              src="/logo.png"
              alt="ZOVA"
              fill
              className="object-contain"
              priority
              onError={() => setLogoError(true)}
            />
          ) : (
            // Fallback when logo fails to load
            <div 
              className="w-full h-full rounded-xl flex items-center justify-center"
              style={{ backgroundColor: THEME.colors.primary }}
            >
              <span className="text-white font-bold text-xl">Z</span>
            </div>
          )}
        </div>
        {/* Wordmark - White on dark background - increased size */}
        <div className="flex flex-col leading-none">
          <span
            className="text-3xl font-black tracking-tight"
            style={{ 
              color: THEME.colors.white,
              fontFamily: "'Poppins', sans-serif", 
              letterSpacing: '-0.02em' 
            }}
          >
            ZOVA
          </span>
          <span
            className="text-[11px] font-medium tracking-[0.12em] uppercase hidden sm:block"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Verified Quality
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── Search Bar ───────────────────────────────────────────────
const SearchBar = ({ searchQuery, setSearchQuery, onSubmit, isMobile = false }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${isMobile ? "w-full" : "flex-1 max-w-xl lg:max-w-2xl mx-6 hidden md:block"}`}>
      <div
        className="flex items-center rounded-full transition-all duration-200"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
          backdropFilter: 'blur(10px)',
          border: `1.5px solid ${focused ? THEME.colors.primary : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: focused ? `0 0 0 3px rgba(0, 184, 107, 0.3)` : "none",
        }}
      >
        <FiSearch
          className="ml-3.5 w-4 h-4 shrink-0 transition-colors"
          style={{ color: focused ? THEME.colors.primary : 'rgba(255, 255, 255, 0.6)' }}
        />
        <input
          type="text"
          className="flex-1 pl-2.5 pr-3 py-2.5 bg-transparent text-sm outline-none placeholder-white/50"
          style={{ color: THEME.colors.white }}
          placeholder="Search products, brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit?.(); } }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="mr-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = THEME.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onSubmit}
          className="mr-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0"
          style={{ 
            backgroundColor: THEME.colors.primary, 
            color: THEME.colors.white,
            boxShadow: '0 2px 8px rgba(0, 184, 107, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = THEME.colors.primaryHover;
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = THEME.colors.primary;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
};

// ── Currency ─────────────────────────────────────────────────
const CurrencySelector = () => (
  <div
    className="hidden lg:flex items-center gap-1 text-sm font-semibold cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-200"
    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.color = THEME.colors.primary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
    }}
  >
    <span>₦</span>
    <span>NGN</span>
    <FiChevronDown className="w-3.5 h-3.5 ml-0.5" />
  </div>
);

// ── Icon Button (shared style) ────────────────────────────────
const IconButton = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label={label}
    className="relative p-2.5 rounded-xl transition-all duration-200"
    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.color = THEME.colors.primary;
      e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {children}
  </button>
);

// ── Wishlist ──────────────────────────────────────────────────
const WishlistIcon = () => {
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  return (
    <IconButton onClick={() => router.push(user ? "/wishlist" : "/login")} label="Wishlist">
      <FiHeart className="w-5 h-5 md:w-[22px] md:h-[22px]" />
      {wishlistItems.size > 0 && (
        <span
          className="absolute -top-1 -right-1 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2"
          style={{ 
            backgroundColor: THEME.colors.primary, 
            color: THEME.colors.white, 
            borderColor: THEME.colors.deepEmerald,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          {wishlistItems.size}
        </span>
      )}
    </IconButton>
  );
};

// ── Cart ──────────────────────────────────────────────────────
const CartIcon = () => {
  const { cartCount } = useCart();
  return (
    <Link href="/cart">
      <IconButton label="Cart">
        <FiShoppingCart className="w-5 h-5 md:w-[22px] md:h-[22px]" />
        {cartCount > 0 && (
          <span
            className="absolute -top-1 -right-1 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2"
            style={{ 
              backgroundColor: THEME.colors.primary, 
              color: THEME.colors.white, 
              borderColor: THEME.colors.deepEmerald,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
            }}
          >
            {cartCount}
          </span>
        )}
      </IconButton>
    </Link>
  );
};

// ── Vertical Divider ──────────────────────────────────────────
const Divider = ({ mobileHidden = false }) => (
  <div
    className={`${mobileHidden ? "hidden lg:block" : "hidden md:block"} h-6 w-px mx-1`}
    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
  />
);

// ── User Menu ─────────────────────────────────────────────────
const UserMenu = ({ user, signOut, adminRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = Boolean(adminRole);
  const displayName =
    adminRole === "super_admin"
      ? "Super Admin"
      : user?.user_metadata?.full_name || "Account";

  const MenuItem = ({ href, onClick, children, danger }) => (
    <Link href={href || "#"}>
      <span
        className="flex items-center px-4 py-2.5 text-sm cursor-pointer transition-all duration-200"
        style={{ color: danger ? THEME.colors.saleRed : THEME.colors.darkCharcoal }}
        onClick={() => { onClick?.(); setIsOpen(false); }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = danger ? '#FFF1F2' : THEME.colors.greenTint;
          if (!danger) e.currentTarget.style.color = THEME.colors.primary;
          e.currentTarget.style.paddingLeft = '20px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = danger ? THEME.colors.saleRed : THEME.colors.darkCharcoal;
          e.currentTarget.style.paddingLeft = '16px';
        }}
      >
        {children}
      </span>
    </Link>
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
        style={{ color: 'rgba(255, 255, 255, 0.8)' }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = THEME.colors.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
          style={{ 
            backgroundColor: isOpen ? THEME.colors.primary : 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <FiUser 
            className="w-4 h-4 transition-colors" 
            style={{ color: isOpen ? THEME.colors.white : THEME.colors.white }} 
          />
        </div>
        <span
          className="md:hidden text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: isOpen ? THEME.colors.primary : 'rgba(255, 255, 255, 0.72)' }}
        >
          {/* Menu */}
        </span>
        <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
          <span className="text-xs font-bold" style={{ color: THEME.colors.white }}>
            {user ? displayName.split(" ")[0] : "Account"}
          </span>
          {isAdmin && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: THEME.colors.primary, color: THEME.colors.white }}
            >
              Admin
            </span>
          )}
        </div>
        <FiChevronDown
          className="w-3.5 h-3.5 transition-all duration-300"
          style={{
            color: isOpen ? THEME.colors.primary : 'rgba(255, 255, 255, 0.6)',
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
            style={{
              backgroundColor: THEME.colors.white,
              border: `1px solid ${THEME.colors.greenBorder}`,
              boxShadow: THEME.shadows.dropdown,
            }}
          >
            {user ? (
              <>
                {/* User info */}
                <div
                  className="px-4 py-3.5"
                  style={{ borderBottom: `1px solid ${THEME.colors.border}` }}
                >
                  <p className="text-sm font-bold truncate" style={{ color: THEME.colors.darkCharcoal }}>
                    {displayName}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: THEME.colors.mediumGray }}>
                    {user.email}
                  </p>
                </div>

                {/* Links */}
                <div className="py-1">
                  {isAdmin ? (
                    <>
                      <MenuItem href="/admin">Dashboard</MenuItem>
                      <MenuItem href="/admin/profile">Profile</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem href="/profile">Profile</MenuItem>
                      <MenuItem href="/profile?tab=orders">My Orders</MenuItem>
                      <MenuItem href="/wishlist">Wishlist</MenuItem>
                    </>
                  )}
                </div>

                {/* Sign out */}
                <div style={{ borderTop: `1px solid ${THEME.colors.border}` }}>
                  <button
                    onClick={async () => { await signOut(); setIsOpen(false); }}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{ color: THEME.colors.saleRed }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFF1F2';
                      e.currentTarget.style.paddingLeft = '20px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.paddingLeft = '16px';
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="py-1">
                <MenuItem href="/login">Login</MenuItem>
                <MenuItem href="/signup">Create Account</MenuItem>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Header ───────────────────────────────────────────────
const Header = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [adminRole, setAdminRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Admin role check
  useEffect(() => {
    let active = true;
    const resolve = async () => {
      if (!user?.id) { if (active) setAdminRole(null); return; }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (!active) return;
      setAdminRole(error || !data ? null : data.role || null);
    };
    resolve();
    return () => { active = false; };
  }, [user?.id]);

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    trackAnalyticsEvent("search_submitted", { query: q });
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
  };

  if (["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname)) return null;

  const searchEnabledRoutes = [
    "/",
    "/shop",
    "/stores",
  ];
  const showSearch = searchEnabledRoutes.includes(pathname) || pathname?.startsWith("/shop/");

  return (
    <header
      className="sticky top-0 z-100 transition-all duration-300"
      style={{
        backgroundColor: THEME.colors.deepEmerald, // Deep Emerald background
        borderBottom: `1px solid ${scrolled ? THEME.colors.primary : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: scrolled ? THEME.shadows.header : "none",
      }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-6">

          <HeaderLogo />

          {showSearch ? (
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubmit={handleSearchSubmit}
            />
          ) : <div className="hidden md:block flex-1" />}

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <CurrencySelector />
            <Divider mobileHidden />
            <WishlistIcon />
            <CartIcon />
            <Divider />
            <UserMenu user={user} signOut={signOut} adminRole={adminRole} />
          </div>

        </div>

        {/* Mobile search */}
        {showSearch ? (
          <div className="mt-3 md:hidden">
            <SearchBar
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
};

export default Header;
