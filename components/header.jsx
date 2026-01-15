"use client";
import { useState } from "react";
import {
  FiChevronDown,
  FiMapPin,
  FiSearch,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";
import { useLocation } from "../contexts/LocationContext";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";

const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
  "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano",
  "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun",
  "Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
];

const Header = () => {
  const { selectedState, setSelectedState } = useLocation();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Hide header on login and signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const categories = [
    { name: "Women", active: true },
    { name: "Men", active: false },
    { name: "Kids", active: false },
  ];

  const handleLogout = async () => {
    await signOut();
    setProfileDropdownOpen(false);
  };

  return (
    <header className="bg-background border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href={'/'}>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ShopHub</h1>
          </Link>
          <div className="flex items-center gap-4">
            {/* Location Dropdown */}
            <div className="relative hidden sm:flex items-center gap-1 text-gray-600">
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1"
              >
                <FiMapPin className="w-4 h-4" />
                <span className="text-sm">{selectedState || "Select Location"}</span>
                <FiChevronDown className="w-4 h-4" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute top-8 left-0 bg-background border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-48">
                  {nigerianStates.map((state) => (
                    <button
                      key={state}
                      onClick={() => {
                        setSelectedState(state);
                        setLocationDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-background-alt"
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <button className="relative p-2 hover:bg-background-alt rounded-lg">
              <FiShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-background-alt rounded-lg"
                  >
                    <FiUser className="w-6 h-6 text-gray-700" />
                    <span className="hidden sm:block text-gray-700 font-medium">
                      {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <FiChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-background border border-gray-200 rounded-lg shadow-lg z-50">
                      <Link href={'/profile'}> <button className="w-full text-left px-4 py-2 hover:bg-background-alt">Profile</button></Link>
                      <button className="w-full text-left px-4 py-2 hover:bg-background-alt">Orders</button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-background-alt text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
    
      </div>
    </header>
  );
};

export default Header;
