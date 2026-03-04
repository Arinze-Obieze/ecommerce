"use client";
import { useEffect, useState } from "react";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHeart,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { createClient } from "@/utils/supabase/client";

// --- Sub-Components ---

const HeaderLogo = () => (
  <Link href={'/'} className="flex-shrink-0">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 flex items-center justify-center border-2 border-white rounded-md">
         <FiShoppingCart className="w-4 h-4 text-white" />
      </div>
      <h1 className="text-lg md:text-xl font-bold tracking-tight">ShopHub</h1>
    </div>
  </Link>
);

const SearchBar = ({ searchQuery, setSearchQuery, onSubmit, isMobile = false }) => (
  <div className={`relative ${isMobile ? '' : 'flex-1 max-w-xl lg:max-w-2xl mx-4 hidden md:block'}`}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <FiSearch className="h-4 w-4 text-gray-400" />
    </div>
    <input
      type="text"
      className="block w-full pl-10 pr-3 py-2.5 bg-gray-100/10 border border-gray-400/30 rounded-full leading-5 text-white placeholder-gray-300 focus:outline-none focus:bg-white/20 focus:border-white/50 text-sm transition-colors"
      placeholder="Search for products..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit?.();
        }
      }}
    />
  </div>
);

const CurrencySelector = () => (
  <div className="hidden lg:flex items-center gap-1 text-sm font-medium opacity-90 hover:opacity-100 cursor-pointer px-2">
    <span>₦ NGN</span>
  </div>
);

const WishlistIcon = () => {
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      // router.push("/login?redirect=/wishlist"); // Optional: handle redirect param
      router.push("/login");
    } else {
      router.push("/wishlist");
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="relative p-1 hover:bg-white/10 rounded-full transition-colors"
    >
       <FiHeart className="w-5 h-5 md:w-6 md:h-6" />
       {wishlistItems.size > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#2E5C45]">
            {wishlistItems.size}
          </span>
       )}
       <span className="sr-only">Wishlist</span>
    </button>
  );
};

const CartIcon = () => {
  const { cartCount } = useCart();
  
  return (
    <Link
      href="/cart"
      className="relative p-1 hover:bg-white/10 rounded-full transition-colors group block"
      aria-label="Open cart"
    >
      <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#2E5C45]">
          {cartCount}
        </span>
      )}
    </Link>
  );
};

const VerticalDivider = ({ mobileHidden = false }) => (
  <div className={`${mobileHidden ? 'hidden lg:block' : 'hidden md:block'} h-5 w-px bg-white/30 mx-1`}></div>
);

const UserMenu = ({ user, signOut, adminRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = Boolean(adminRole);
  const displayName =
    adminRole === "super_admin"
      ? "Super Admin"
      : (user?.user_metadata?.full_name || "User");

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
           <FiUser className="w-4 h-4" />
        </div>
        <div className="hidden lg:flex flex-col items-start -space-y-0.5">
            <span className="text-xs md:text-sm font-medium leading-none">Account</span>  
        </div>
        <FiChevronDown className="w-3 h-3 text-white/70" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-[80vh] overflow-y-auto">
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                {isAdmin ? (
                  <>
                    <Link href="/admin">
                      <span
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </span>
                    </Link>
                    <Link href="/admin/profile">
                      <span
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile">
                      <span
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </span>
                    </Link>
                    <Link href="/profile?tab=orders">
                      <span
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        Orders
                      </span>
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={async () => {
                    await signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <span 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </span>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- Main Component ---

const Header = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [adminRole, setAdminRole] = useState(null);

  useEffect(() => {
    let active = true;

    const resolveAdminRole = async () => {
      if (!user?.id) {
        if (active) setAdminRole(null);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!active) return;
      if (error || !data) {
        setAdminRole(null);
        return;
      }

      setAdminRole(data.role || null);
    };

    resolveAdminRole();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) {
      router.push('/shop');
      return;
    }
    trackAnalyticsEvent('search_submitted', { query });
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  // Hide header on auth pages
  if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-[#2E5C45] text-white sticky top-0 z-[100] shadow-md">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          <HeaderLogo />

          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleSearchSubmit} />

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
            <CurrencySelector />
            <VerticalDivider mobileHidden />
            
            <WishlistIcon />
            <VerticalDivider />
            
            <CartIcon />
            <VerticalDivider />
            
            <UserMenu user={user} signOut={signOut} adminRole={adminRole} />
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleSearchSubmit} isMobile />
        </div>
      </div>
    </header>
  );
};

export default Header;
