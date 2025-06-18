"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGameData } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaShieldAlt, FaLock, FaRocket } from "react-icons/fa";
import IconFactory from "@/components/IconFactory";

export default function AchievementsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { playerData, isLoadingData, ALL_BADGES_CONFIG } = useGameData(user);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">
          Loading Medal Bay Records...
        </p>
      </div>
    );
  }

  const earnedBadgeIdsSet = new Set(playerData.earnedBadgeIds || []);

  return (
    <div className="space-y-6">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center mb-6">
          <FaShieldAlt className="text-3xl text-amber-400 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            Medal Bay
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">
          A collection of commendations earned throughout your interstellar
          journey. Each medal signifies a remarkable feat!
        </p>

        {ALL_BADGES_CONFIG.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {ALL_BADGES_CONFIG.map((badgeConfig) => {
              const isEarned = earnedBadgeIdsSet.has(badgeConfig.badgeId);

              return (
                <div
                  key={badgeConfig.badgeId}
                  className={`card p-5 rounded-xl text-center transition-all duration-300 ease-in-out
                               ${
                                 isEarned
                                   ? "bg-gray-700/70 border-2 border-amber-500 shadow-lg scale-105 hover:shadow-amber-500/30"
                                   : "bg-gray-800/50 border-gray-700 opacity-60 hover:opacity-90"
                               }`}
                  title={
                    isEarned
                      ? `Earned: ${badgeConfig.name}`
                      : `Locked: ${badgeConfig.name}`
                  }
                >
                  <div className="relative mb-4">
                    <IconFactory
                      iconName={badgeConfig.icon}
                      className={`mx-auto text-5xl md:text-6xl 
                                  ${
                                    isEarned
                                      ? badgeConfig.color
                                      : "text-gray-500"
                                  } 
                                  transition-all duration-300 
                                  ${
                                    isEarned
                                      ? "transform rotate-0"
                                      : "transform group-hover:rotate-0"
                                  }`}
                    />
                    {!isEarned && (
                      <FaLock className="absolute top-1 right-1 text-xs text-gray-500" />
                    )}
                  </div>
                  <h3
                    className={`font-semibold text-md md:text-lg ${
                      isEarned ? "text-gray-100" : "text-gray-400"
                    }`}
                  >
                    {badgeConfig.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      isEarned ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {badgeConfig.description}
                  </p>
                  {isEarned && (
                    <p className="mt-3 text-xs font-bold text-green-400 uppercase tracking-wider">
                      ACHIEVED
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No commendations defined in the archives yet.
          </p>
        )}
      </div>
    </div>
  );
}
