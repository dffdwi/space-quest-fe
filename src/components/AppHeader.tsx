"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaCoins, FaFire, FaFlask } from "react-icons/fa";
import { PlayerActivePowerUp, useGameData, XP_PER_LEVEL } from "@/hooks/useGameData";

const pageConfigs: {
  [key: string]: { title: string; subtitle: (name?: string) => string };
} = {
  "/": {
    title: "Starship Dashboard",
    subtitle: (name?: string) =>
      `Welcome back, Commander ${name || "Explorer"}!`,
  },
  "/missions": {
    title: "Mission Logs",
    subtitle: () => "Manage all your interstellar missions.",
  },
  "/crew-projects": {
    title: "Crew Expeditions",
    subtitle: () => "Coordinate your team's deep space ventures.",
  },
  "/achievements": {
    title: "Medal Bay",
    subtitle: () => "Showcase your stellar accomplishments.",
  },
  "/leaderboard": {
    title: "Hall of Fame",
    subtitle: () => "See your rank among the stars!",
  },
  "/starmarket": {
    title: "Star Market",
    subtitle: () => "Acquire rare artifacts and upgrades.",
  },
  "/ship-settings": {
    title: "Ship Systems",
    subtitle: () => "Customize your vessel and preferences.",
  },
};

const AppHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { playerData, isLoadingData, getXpBoundaries } = useGameData();

  const pageConfig = pageConfigs[pathname] || {
    title: "SpaceQuest",
    subtitle: () => "Explore the cosmos of productivity.",
  };
  const subtitleText =
    typeof pageConfig.subtitle === "function"
      ? pageConfig.subtitle(
          playerData?.name || user?.name || user?.email?.split("@")[0]
        )
      : pageConfig.subtitle;

  if (isLoadingData || !playerData) {
    return (
      <header className="mb-8 sticky top-0 bg-gray-800 pt-6 pb-4 z-50 -mx-6 md:-mx-8 px-6 md:px-8 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              {pageConfig.title}
            </h1>
            <p className="text-sm md:text-base text-gray-400">{subtitleText}</p>
          </div>
          {user && (
            <button
              onClick={logout}
              className="btn btn-danger text-xs mt-2 sm:mt-0"
            >
              Logout
            </button>
          )}
          {!user && pathname !== "/login" && pathname !== "/register" && (
            <div className="mt-4 sm:mt-0">
              <Link href="/login" className="btn btn-primary mr-2">
                Login
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
    );
  }

  const { xpInCurrentLevel, totalXpForThisLevel } = getXpBoundaries();
  const xpProgressPercentage =
    totalXpForThisLevel > 0
      ? (xpInCurrentLevel / totalXpForThisLevel) * 100
      : playerData.level >= XP_PER_LEVEL.length - 1
      ? 100
      : 0;

  return (
    <header className="sticky top-0 bg-gray-800 pt-6 pb-4 z-50 -mx-6 md:-mx-8 px-6 md:px-8 border-b border-gray-700">
      <div className="flex px-6 flex-col sm:flex-row justify-between items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden text-2xl mr-4 text-gray-300 hover:text-white flex items-start"
        >
          <FaBars />
        </button>
        <div className="flex-grow">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            {pageConfig.title}
          </h1>
          <p className="text-sm md:text-base text-gray-400">{subtitleText}</p>
        </div>

        {user ? (
          <div className="flex items-center space-x-3 md:space-x-4 mt-4 sm:mt-0 card bg-gray-800/50 border-gray-700/50 p-3 shadow-md backdrop-blur-sm">
            <img
              src={
                playerData.avatarUrl
                  ? playerData.avatarUrl
                  : "https://img.freepik.com/free-vector/cute-astronaut-riding-rocket-waving-hand-cartoon-icon-illustration-science-technology-icon-concept_138676-2130.jpg?semt=ais_hybrid&w=740"
              }
              alt="Commander Avatar"
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-500 object-fill 
             ${
               playerData.avatarFrameId === "gold-commander-frame"
                 ? "avatar-frame-active gold-commander-frame-style"
                 : ""
             }
             ${
               playerData.avatarFrameId === "nova-burst-frame"
                 ? "avatar-frame-active nova-burst-frame-style"
                 : ""
             }
             `}
            />
            <div className="flex-grow min-w-[100px] sm:min-w-[120px]">
              {" "}
              <div className="flex justify-between items-center">
                <span
                  className="font-semibold text-sm md:text-base text-gray-200 truncate"
                  title={`Level ${playerData.level}`}
                >
                  Lvl {playerData.level}
                </span>
                {playerData.dailyLogin.streak > 0 &&
                  playerData.dailyLogin.bonusClaimedToday && (
                    <span className="text-xs text-amber-400 font-semibold flex items-center ml-1">
                      <FaFire className="mr-1" />
                      {playerData.dailyLogin.streak}
                    </span>
                  )}
              </div>
              <div
                className="w-full h-3.5 xp-bar-container mt-1"
                title={`${xpInCurrentLevel} / ${totalXpForThisLevel} XP`}
              >
                <div
                  className="xp-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, xpProgressPercentage)
                    )}%`,
                  }}
                >
                  {playerData.level < XP_PER_LEVEL.length - 1 &&
                    totalXpForThisLevel > 0 &&
                    ((xpInCurrentLevel > 0 && xpProgressPercentage > 15) ||
                    totalXpForThisLevel === 0
                      ? `${xpInCurrentLevel}/${totalXpForThisLevel}`
                      : "")}
                  {playerData.level >= XP_PER_LEVEL.length - 1 && "MAX"}
                </div>
              </div>
            </div>
            {playerData.activePowerUps &&
              playerData.activePowerUps.find((p: PlayerActivePowerUp) =>
                p.item.value.includes("xp_boost")
              ) && (
                <div
                  className="text-center pl-2 border-l border-gray-600"
                  title="XP Boost Active!"
                >
                  <FaFlask className="text-sky-400 text-lg md:text-xl mx-auto animate-pulse" />
                  <span className="block text-xs font-semibold text-sky-300">
                    x2 XP
                  </span>
                </div>
              )}
            <div className="text-center pl-2 border-l border-gray-600">
              <FaCoins className="text-yellow-400 text-lg md:text-xl mx-auto" />
              <span className="block text-xs md:text-sm font-semibold text-gray-200">
                {playerData.credits} CP
              </span>
            </div>
            <button
              onClick={logout}
              className="btn btn-danger text-xs ml-2 !p-2 sm:!px-3"
            >
              Logout
            </button>
          </div>
        ) : (
          pathname !== "/login" &&
          pathname !== "/register" && (
            <div className="mt-4 sm:mt-0">
              <Link href="/login" className="btn btn-primary mr-2">
                Login
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
};

export default AppHeader;
