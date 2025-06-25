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
  FaMapMarkedAlt,
  FaCog,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { useGameData } from "@/hooks/useGameData";

const navItems = [
  { href: "/", icon: FaRocket, label: "Starship Dashboard" },
  { href: "/missions", icon: FaTasks, label: "Mission Logs" },
  { href: "/crew-projects", icon: FaUsersCog, label: "Crew Expeditions" },
  { href: "/invitations", icon: FaEnvelopeOpenText, label: "Invitations" },
  { href: "/achievements", icon: FaShieldAlt, label: "Medal Bay" },
  { href: "/leaderboard", icon: FaCrown, label: "Hall of Fame" },
  { href: "/starmarket", icon: FaStore, label: "Star Market" },
  { href: "/starmap", icon: FaMapMarkedAlt, label: "Star Map" },
  { href: "/ship-settings", icon: FaCog, label: "Ship Systems" },
];

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const { playerData } = useGameData();

  const pendingInvitationCount = playerData?.pendingInvitationCount || 0;

  if (["/login", "/register"].includes(pathname)) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={`sidebar w-64 p-6 space-y-4 flex-col no-scrollbar bg-gray-800 border-r border-gray-700
                   fixed top-0 left-0 h-full z-[101] transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                   ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="text-3xl font-extrabold text-indigo-400 tracking-tight hover:text-indigo-300 transition-colors"
            onClick={onClose}
          >
            Space<span className="text-purple-400">Quest</span>
          </Link>
        </div>
        <nav className="space-y-1.5 flex-grow">
          {navItems.map((item) => {
            const isInvitationLink = item.href === "/invitations";
            const showNotification =
              isInvitationLink && pendingInvitationCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link flex items-center justify-between space-x-3 px-4 py-2.5 rounded-lg text-sm ${
                  pathname === item.href ? "active" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {showNotification && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
