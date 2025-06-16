"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGameData, PlayerData } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { FaCrown, FaRocket, FaUserShield, FaMedal } from "react-icons/fa";
import api from "@/lib/api";

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rank?: number;
}

export default function LeaderboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { playerData, isLoadingData } = useGameData(user);
  const router = useRouter();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLeaderboardLoading(true);
      try {
        const response = await api.get("/leaderboard");
        const rankedData = response.data.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1,
        }));
        setLeaderboardData(rankedData);
      } catch (error) {
        console.error("Gagal mengambil data leaderboard:", error);
      } finally {
        setIsLeaderboardLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  const leaderboardEntries = useMemo(() => {
    if (!playerData || leaderboardData.length === 0) return [];

    const isPlayerInTopList = leaderboardData.some(
      (entry) => entry.userId === playerData.id
    );

    if (!isPlayerInTopList) {
      const playerEntry = {
        ...playerData,
        userId: playerData.id.toString(),
        rank: "...",
      };
      return [...leaderboardData, playerEntry];
    }

    return leaderboardData;
  }, [playerData, leaderboardData]);

  if (authLoading || isLoadingData || isLeaderboardLoading || !playerData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">
          Calculating Galactic Rankings...
        </p>
      </div>
    );
  }

  const rankColors = ["text-amber-400", "text-slate-300", "text-yellow-600"];
  const rankIcons = [FaCrown, FaMedal, FaMedal];

  return (
    <div className="space-y-6">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center mb-6">
          <FaCrown className="text-3xl text-amber-400 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            Hall of Fame
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">
          The most renowned commanders and explorers across the SpaceQuest
          galaxy. Ascend the ranks and etch your name among legends!
        </p>

        {leaderboardEntries.length > 0 ? (
          <div className="space-y-3">
            {leaderboardEntries.map((entry, index) => {
              const isCurrentUser = entry.userId === String(playerData.id);
              const RankIcon =
                entry.rank && typeof entry.rank === "number" && entry.rank <= 3
                  ? rankIcons[entry.rank - 1]
                  : null;
              const rankColor =
                entry.rank && typeof entry.rank === "number" && entry.rank <= 3
                  ? rankColors[entry.rank - 1]
                  : "text-gray-400";

              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-lg shadow-sm transition-all duration-200
                               ${
                                 isCurrentUser
                                   ? "bg-indigo-700/50 border-2 border-indigo-500 scale-[1.02]"
                                   : "bg-gray-700/60 border border-gray-600 hover:bg-gray-600/80"
                               }`}
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <span
                      className={`font-bold text-lg md:text-xl w-8 text-center ${rankColor}`}
                    >
                      {entry.rank || index + 1}
                      {RankIcon && (
                        <RankIcon
                          className={`inline ml-1 mb-1 ${
                            entry.rank === 1 ? "text-xl" : "text-lg"
                          }`}
                        />
                      )}
                    </span>
                    <img
                      src={
                        entry.avatarUrl
                          ? entry.avatarUrl
                          : "https://img.freepik.com/free-vector/cute-astronaut-riding-rocket-waving-hand-cartoon-icon-illustration-science-technology-icon-concept_138676-2130.jpg?semt=ais_hybrid&w=740"
                      }
                      alt={entry.name}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 ${
                        isCurrentUser ? "border-indigo-400" : "border-gray-500"
                      }`}
                    />
                    <div>
                      <span
                        className={`font-semibold text-base md:text-lg ${
                          isCurrentUser ? "text-indigo-300" : "text-gray-200"
                        }`}
                      >
                        {isCurrentUser ? `${entry.name} (You)` : entry.name}
                      </span>
                      <p
                        className={`text-xs ${
                          isCurrentUser ? "text-indigo-400" : "text-gray-400"
                        }`}
                      >
                        Level {entry.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm md:text-base ${
                        isCurrentUser ? "text-amber-300" : "text-amber-400"
                      }`}
                    >
                      {entry.xp.toLocaleString()} XP
                    </span>
                    {isCurrentUser && (
                      <FaUserShield
                        className="text-indigo-400 text-xs inline ml-2"
                        title="This is you!"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Leaderboard data is currently unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
