"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  useGameData,
  PlayerData,
  ALL_BADGES_CONFIG,
} from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  FaCrown,
  FaRocket,
  FaUserShield,
  FaMedal,
  FaFire,
} from "react-icons/fa";
import api from "@/lib/api";
import IconFactory from "@/components/IconFactory";

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rank?: number;
  loginStreak?: number;
  badges?: {
    badgeId: string;
    name: string;
    icon: string;
    color: string;
  }[];
}

const PodiumItem = ({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) => {
  const rankStyles = [
    {
      size: "w-24 h-24 md:w-28 md:h-28",
      iconColor: "text-amber-400",
      icon: FaCrown,
      delay: "animation-delay-0",
    },
    {
      size: "w-20 h-20 md:w-24 md:h-24",
      iconColor: "text-slate-300",
      icon: FaMedal,
      delay: "animation-delay-200",
    },
    {
      size: "w-16 h-16 md:w-20 md:h-20",
      iconColor: "text-yellow-600",
      icon: FaMedal,
      delay: "animation-delay-400",
    },
  ];

  const style = rankStyles[rank - 1];
  const Icon = style.icon;

  return (
    <div
      className={`text-center flex flex-col items-center ${
        rank === 1 ? "mt-0" : "mt-6"
      }`}
    >
      <div className="relative mb-2">
        <Icon
          className={`absolute -top-2 -right-2 text-2xl ${style.iconColor} transform rotate-12`}
        />

        <img
          src={
            entry.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              entry.name || "S"
            )}`
          }
          alt={entry.name}
          className={`${style.size} object-fill shadow-lg animate-gentle-bounce ${style.delay}`}
        />
      </div>
      <p className="font-bold text-lg text-gray-100 truncate max-w-[150px]">
        {entry.name}
      </p>
      <p className={`font-semibold ${style.iconColor}`}>
        {entry.xp.toLocaleString()} XP
      </p>
    </div>
  );
};

export default function LeaderboardPage() {
  const {
    user,
    isLoading: authLoading,
    playerData,
    isGameDataLoading: isLoadingData,
  } = useAuth();
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

  const leaderboardEntries: LeaderboardEntry[] = useMemo(() => {
    if (!playerData || leaderboardData.length === 0) return [];

    const isPlayerInTopList = leaderboardData.some(
      (entry) => entry.userId === playerData.id
    );

    if (!isPlayerInTopList) {
      const playerEntry: LeaderboardEntry = {
        userId: playerData.id.toString(),
        name: playerData.name,
        avatarUrl: playerData.avatarUrl,
        level: playerData.level,
        xp: playerData.xp,
        loginStreak: playerData.dailyLogin.streak,
        badges: ALL_BADGES_CONFIG.filter((b) =>
          playerData.earnedBadgeIds.includes(b.badgeId)
        ),
        rank: leaderboardData.length + 1,
      };
      return [...leaderboardData, playerEntry];
    }

    return leaderboardData;
  }, [playerData, leaderboardData, ALL_BADGES_CONFIG]);

  const topThree = useMemo(
    () => leaderboardData.slice(0, 3),
    [leaderboardData]
  );
  const restOfLeaderboard = useMemo(
    () => leaderboardData.slice(3),
    [leaderboardData]
  );

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

        {topThree.length >= 3 && (
          <section className="flex justify-center items-end gap-4 md:gap-8 p-6 mb-8 border-b-2 border-indigo-700/50 pb-8">
            <PodiumItem entry={topThree[1]} rank={2} />
            <PodiumItem entry={topThree[0]} rank={1} />
            <PodiumItem entry={topThree[2]} rank={3} />
          </section>
        )}

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
                      src={entry.avatarUrl}
                      alt={entry.name}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full object-fill `}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-base md:text-lg ${
                            isCurrentUser ? "text-indigo-300" : "text-gray-200"
                          }`}
                        >
                          {isCurrentUser ? `${entry.name} (You)` : entry.name}
                        </span>
                        {entry.loginStreak && entry.loginStreak > 1 && (
                          <span
                            className="flex items-center text-xs font-bold text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded-full"
                            title={`Login Streak: ${entry.loginStreak} days`}
                          >
                            <FaFire className="mr-1" /> {entry.loginStreak}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          isCurrentUser ? "text-indigo-400" : "text-gray-400"
                        }`}
                      >
                        Level {entry.level}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`font-bold text-sm md:text-base ${
                        isCurrentUser ? "text-amber-300" : "text-amber-400"
                      }`}
                    >
                      {entry.xp.toLocaleString()} XP
                    </span>
                    <div className="flex items-center space-x-1.5 mt-2">
                      {(entry.badges || []).slice(0, 5).map((badge) => (
                        <div key={badge.badgeId} title={badge.name}>
                          <IconFactory
                            iconName={badge.icon}
                            className={`${badge.color} text-base`}
                          />
                        </div>
                      ))}
                      {(entry.badges || []).length > 5 && (
                        <span className="text-xs text-gray-400 font-bold">
                          ...
                        </span>
                      )}
                    </div>
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
