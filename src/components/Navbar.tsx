"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // tidak tampilkan navbar di halaman login/register jika diinginkan
  if (["/login", "/register"].includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          SpaceQuest
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm">
                Welcome, {user.name || user.email}!
              </span>
              <Link
                href="/profile"
                className="hover:text-gray-300 transition-colors text-sm"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {pathname !== "/login" && (
                <Link
                  href="/login"
                  className="hover:text-gray-300 transition-colors text-sm"
                >
                  Login
                </Link>
              )}
              {pathname !== "/register" && (
                <Link
                  href="/register"
                  className="hover:text-gray-300 transition-colors text-sm"
                >
                  Register
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
