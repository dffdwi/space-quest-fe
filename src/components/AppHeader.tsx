"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCoins, FaFire } from "react-icons/fa";
import { useEffect, useState } from "react";

interface GameState {
  level: number;
  xp: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  points: number;
  dailyLoginStreak: number;
  avatarUrl?: string;
  avatarFrame?: string | null;
}

const pageConfigs: { [key: string]: { title: string; subtitle: string } } = {
  "/": {
    title: "Starship Dashboard",
    subtitle: "Welcome back, Commander Explorer!",
  },
  "/missions": {
    title: "Mission Logs",
    subtitle: "Manage all your interstellar missions.",
  },
  "/crew-projects": {
    title: "Crew Expeditions",
    subtitle: "Coordinate your team's deep space ventures.",
  },
  "/achievements": {
    title: "Medal Bay",
    subtitle: "Showcase your stellar accomplishments.",
  },
  "/leaderboard": {
    title: "Hall of Fame",
    subtitle: "See your rank among the stars!",
  },
  "/starmarket": {
    title: "Star Market",
    subtitle: "Acquire rare artifacts and upgrades.",
  },
  "/ship-settings": {
    title: "Ship Systems",
    subtitle: "Customize your vessel and preferences.",
  },
};

const AppHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    xp: 0,
    xpForNextLevel: 100,
    xpInCurrentLevel: 0,
    points: 100,
    dailyLoginStreak: 0,
    avatarUrl:
      //   user?.photoURL ||
      "https://placehold.co/60x60/7C3AED/FFFFFF?text=S",
    avatarFrame: null,
  });

  useEffect(() => {
    if (user) {
      const storedGameData = localStorage.getItem(
        `spaceQuestGameData_${user.id}`
      );
      if (storedGameData) {
        const parsedData = JSON.parse(storedGameData);
        setGameState((prev) => ({
          ...prev,
          ...parsedData,
          avatarUrl:
            // user.photoURL ||
            parsedData.avatarUrl ||
            "https://placehold.co/60x60/7C3AED/FFFFFF?text=S",
        }));
      } else {
        const initialGameData: GameState = {
          level: 1,
          xp: 0,
          xpForNextLevel: 100,
          xpInCurrentLevel: 0,
          points: 100,
          dailyLoginStreak: 0,
          avatarUrl:
            // user.photoURL ||
            `https://ui-avatars.com/api/?name=${
              user.name || user.email
            }&background=7c3aed&color=fff&size=60`,
          avatarFrame: null,
        };
        setGameState(initialGameData);
        localStorage.setItem(
          `spaceQuestGameData_${user.id}`,
          JSON.stringify(initialGameData)
        );
      }
    }
  }, [user]);

  const pageConfig = pageConfigs[pathname] || {
    title: "SpaceQuest",
    subtitle: "Explore the cosmos of productivity.",
  };
  const subtitleText = pageConfig.subtitle;

  const xpProgressPercentage =
    gameState.xpForNextLevel > 0
      ? (gameState.xpInCurrentLevel / gameState.xpForNextLevel) * 100
      : 0;

  return (
    <header className="mb-8 sticky top-0 bg-gray-800 pt-6 pb-4 z-50 -mx-6 md:-mx-8 px-6 md:px-8 border-b border-gray-700">
      <div className="flex px-6 flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            {pageConfig.title}
          </h1>
          <p className="text-sm md:text-base text-gray-400">{subtitleText}</p>
        </div>

        {user ? (
          <div className="flex items-center space-x-3 md:space-x-4 mt-4 sm:mt-0 card bg-gray-800 border-gray-700 p-3 shadow-md">
            <img
              src={gameState.avatarUrl}
              alt="Commander Avatar"
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-500 object-cover ${
                gameState.avatarFrame ? "avatar-frame-active" : ""
              }`}
            />
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm md:text-base text-gray-200">
                  Level {gameState.level}
                </span>
                {gameState.dailyLoginStreak > 0 && (
                  <span className="text-xs text-amber-400 font-semibold flex items-center">
                    <FaFire className="mr-1" />
                    {gameState.dailyLoginStreak}
                  </span>
                )}
              </div>
              <div className="w-full h-3.5 xp-bar-container mt-1">
                <div
                  className="xp-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, xpProgressPercentage)
                    )}%`,
                  }}
                >
                  {gameState.xpInCurrentLevel}/{gameState.xpForNextLevel} XP
                </div>
              </div>
            </div>
            <div className="text-center pl-2 border-l border-gray-600">
              <FaCoins className="text-yellow-400 text-lg md:text-xl" />
              <span className="block text-xs md:text-sm font-semibold text-gray-200">
                {gameState.points} CP
              </span>{" "}
            </div>
            <button onClick={logout} className="btn btn-danger text-xs ml-2">
              Logout
            </button>
          </div>
        ) : (
          <div className="mt-4 sm:mt-0">
            {pathname !== "/login" && (
              <Link href="/login" className="btn btn-primary mr-2">
                Login
              </Link>
            )}
            {pathname !== "/register" && (
              <Link href="/register" className="btn btn-secondary">
                Register
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
