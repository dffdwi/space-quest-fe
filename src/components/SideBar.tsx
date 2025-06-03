
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaRocket,
  FaTasks,
  FaUsersCog,
  FaShieldAlt,
  FaCrown,
  FaStore,
  FaCalendarAlt,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa"; 

const navItems = [
  { href: "/", icon: FaRocket, label: "Starship Dashboard" },
  { href: "/missions", icon: FaTasks, label: "Mission Logs" },
  { href: "/crew-projects", icon: FaUsersCog, label: "Crew Expeditions" },
  { href: "/achievements", icon: FaShieldAlt, label: "Medal Bay" },
  { href: "/leaderboard", icon: FaCrown, label: "Hall of Fame" },
  { href: "/starmarket", icon: FaStore, label: "Star Market" },
  // { href: "/starmap", icon: FaCalendarAlt, label: "Star Map (Calendar)" }, // Placeholder
  { href: "/ship-settings", icon: FaCog, label: "Ship Systems" },
];

const Sidebar = () => {
  const pathname = usePathname();

  if (["/login", "/register"].includes(pathname)) {
    return null;
  }

  return (
    <aside className="sidebar w-64 p-6 space-y-4 hidden md:flex flex-col no-scrollbar">
      <Link
        href="/"
        className="text-3xl font-extrabold text-indigo-400 tracking-tight hover:text-indigo-300 transition-colors"
      >
        Space<span className="text-purple-400">Quest</span>
      </Link>
      <nav className="space-y-1.5 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm ${
              pathname === item.href ? "active" : ""
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
