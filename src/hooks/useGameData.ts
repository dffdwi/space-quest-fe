"use client";

import { useState, useEffect, useCallback } from "react";
import { User as AuthUser } from "@/contexts/AuthContext";

export interface PlayerTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  xp: number;
  credits?: number;
  completed: boolean;
  completedAt?: string;
  category?: string;
  projectId?: string | null;
  status?: string;
  assignedTo?: string | null;
}

export interface PlayerMission {
  id: string;
  title: string;
  description: string;
  target: number;
  currentProgress: number;
  rewardXp?: number;
  rewardCredits?: number;
  rewardBadgeId?: string;
  type: "once" | "daily" | "weekly";
  lastResetDate?: string;
  isClaimed?: boolean;
}

export interface PlayerBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  earnedAt?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "theme" | "avatar_frame" | "power_up" | "cosmetic";
  value: string;
  iconName: string;
  category?: string;
}

export interface PlayerStats {
  tasksCompleted: number;
  totalXpEarned: number;
  totalCreditsEarned: number;
  currentMissionStreak: number;
  longestMissionStreak: number;
  lastStreakUpdateDate?: string;
  logins: number;
}

export interface PlayerData {
  id: string | number;
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  credits: number;
  tasks: PlayerTask[];
  missions: PlayerMission[];
  earnedBadgeIds: string[];
  purchasedShopItemIds: string[];
  activeTheme: string;
  avatarFrameId: string | null;
  dailyLogin: {
    lastLoginDate: string | null;
    streak: number;
    bonusClaimedToday: boolean;
  };
  dailyDiscovery: {
    lastClaimedDate: string | null;
    available: boolean;
  };
  stats: PlayerStats;
}

export const XP_PER_LEVEL = [
  0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4100, 5000, 7000, 10000,
];

export const ALL_BADGES_CONFIG: Omit<PlayerBadge, "earnedAt">[] = [
  {
    id: "b_first_mission",
    name: "First Contact",
    description: "Complete your first mission log.",
    iconName: "FaRegLightbulb",
    color: "text-yellow-400",
  },
  {
    id: "b_explorer_initiate",
    name: "Explorer Initiate",
    description: "Complete 3 mission logs.",
    iconName: "FaSpaceShuttle",
    color: "text-sky-400",
  },
  {
    id: "b_diligent_commander",
    name: "Diligent Commander",
    description: "Complete 10 mission logs.",
    iconName: "FaUserAstronaut",
    color: "text-purple-400",
  },
  {
    id: "b_level_5_cadet",
    name: "Cadet Level 5",
    description: "Reach Level 5.",
    iconName: "FaGraduationCap",
    color: "text-indigo-400",
  },
  {
    id: "b_daily_streak_3",
    name: "Consistent Voyager (3 Days)",
    description: "Log in 3 days in a row.",
    iconName: "FaCalendarCheck",
    color: "text-teal-400",
  },
  {
    id: "b_credits_collector",
    name: "Credits Collector",
    description: "Accumulate 500 Cosmic Credits.",
    iconName: "FaCoins",
    color: "text-amber-400",
  },
];

const initialPlayerDataTemplate = (authUser: AuthUser | null): PlayerData => ({
  id: authUser?.id || "defaultUser",
  name: authUser?.name || authUser?.email?.split("@")[0] || "Explorer",
  avatarUrl:
    // authUser?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${
      authUser?.name || authUser?.email || "S"
    }&background=7c3aed&color=fff&size=60`,
  level: 1,
  xp: 0,
  credits: 100,
  tasks: [],
  missions: [
    {
      id: "m_initial_steps",
      title: "Initial Steps in the Cosmos",
      description: "Complete 3 mission logs to understand your new journey.",
      target: 3,
      currentProgress: 0,
      rewardXp: 75,
      rewardCredits: 25,
      rewardBadgeId: "b_explorer_initiate",
      type: "once",
      isClaimed: false,
    },
    {
      id: "m_weekly_scan",
      title: "Weekly Sector Scan",
      description: "Complete 7 mission logs this week to map nearby sectors.",
      target: 7,
      currentProgress: 0,
      rewardXp: 150,
      rewardCredits: 50,
      type: "weekly",
      lastResetDate: new Date().toISOString(),
      isClaimed: false,
    },
  ],
  earnedBadgeIds: [],
  purchasedShopItemIds: [],
  activeTheme: "theme-dark",
  avatarFrameId: null,
  dailyLogin: { lastLoginDate: null, streak: 0, bonusClaimedToday: false },
  dailyDiscovery: { lastClaimedDate: null, available: true },
  stats: {
    tasksCompleted: 0,
    totalXpEarned: 0,
    totalCreditsEarned: 100,
    currentMissionStreak: 0,
    longestMissionStreak: 0,
    logins: 0,
  },
});

export const useGameData = (authUser: AuthUser | null) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const getLocalStorageKey = useCallback(() => {
    return authUser ? `spaceQuestGameData_${authUser.id}` : null;
  }, [authUser]);

  useEffect(() => {
    const key = getLocalStorageKey();
    if (!key) {
      setIsLoadingData(false);
      if (!authUser) setPlayerData(null);
      return;
    }

    setIsLoadingData(true);
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as PlayerData;
        const template = initialPlayerDataTemplate(authUser);
        setPlayerData({
          ...template,
          ...parsedData,
          id: authUser?.id || "defaultUser",
          name:
            authUser?.name || authUser?.email?.split("@")[0] || template.name,
          avatarUrl:
            // authUser?.avatarUrl ||
            parsedData.avatarUrl || template.avatarUrl,
          missions:
            parsedData.missions?.map((m) => ({
              ...template.missions.find((tm) => tm.id === m.id),
              ...m,
            })) || template.missions,
          dailyLogin: { ...template.dailyLogin, ...parsedData.dailyLogin },
          dailyDiscovery: {
            ...template.dailyDiscovery,
            ...parsedData.dailyDiscovery,
          },
          stats: { ...template.stats, ...parsedData.stats },
        });
      } else if (authUser) {
        setPlayerData(initialPlayerDataTemplate(authUser));
      }
    } catch (error) {
      console.error("Failed to load game data:", error);
      if (authUser) {
        setPlayerData(initialPlayerDataTemplate(authUser));
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [authUser, getLocalStorageKey]);

  useEffect(() => {
    const key = getLocalStorageKey();
    if (key && playerData && !isLoadingData) {
      try {
        localStorage.setItem(key, JSON.stringify(playerData));
      } catch (error) {
        console.error("Failed to save game data:", error);
      }
    }
  }, [playerData, isLoadingData, getLocalStorageKey]);

  const updatePlayerData = useCallback(
    (
      updates:
        | Partial<PlayerData>
        | ((prevState: PlayerData) => Partial<PlayerData>)
    ) => {
      setPlayerData((prev) => {
        if (!prev) return null;
        const newUpdates =
          typeof updates === "function" ? updates(prev) : updates;
        return { ...prev, ...newUpdates };
      });
    },
    []
  );

  const addTask = useCallback(
    (
      newTaskData: Omit<
        PlayerTask,
        "id" | "completed" | "completedAt" | "status"
      >
    ) => {
      const newTask: PlayerTask = {
        ...newTaskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        completed: false,
        status: "todo",
        assignedTo:
          newTaskData.assignedTo === undefined
            ? playerData?.id
              ? String(playerData.id)
              : null
            : newTaskData.assignedTo,
      };
      updatePlayerData((prev) => ({ tasks: [newTask, ...prev.tasks] }));
      // showGlobalNotification("Mission Log Added!", `"${newTask.title}" recorded.`, "FaFileMedicalAlt");
      return newTask;
    },
    [updatePlayerData, playerData?.id]
  );

  const editTask = useCallback(
    (taskId: string, updates: Partial<PlayerTask>) => {
      updatePlayerData((prev) => ({
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }));
      // const updatedTask = playerData?.tasks.find(t => t.id === taskId);
      // if (updatedTask) showGlobalNotification("Mission Log Updated!", `"${updatedTask.title}" updated.`, "FaEdit");
    },
    [updatePlayerData]
  );

  const completeTask = useCallback(
    (taskId: string) => {
      let taskCompleted: PlayerTask | undefined;
      updatePlayerData((prev) => {
        const newTasks = prev.tasks.map((t) => {
          if (t.id === taskId && !t.completed) {
            taskCompleted = {
              ...t,
              completed: true,
              completedAt: new Date().toISOString(),
              status: "done",
            };
            return taskCompleted;
          }
          return t;
        });

        if (taskCompleted) {
          let newXp = prev.xp + taskCompleted.xp;
          let newCredits =
            prev.credits +
            (taskCompleted.credits || Math.floor(taskCompleted.xp / 5));
          let newLevel = prev.level;

          while (
            newLevel < XP_PER_LEVEL.length - 1 &&
            newXp >= XP_PER_LEVEL[newLevel]
          ) {
            newLevel++;
            // showGlobalNotification("Promotion!", `You've reached Level ${newLevel}!`, "FaUserShield");
          }

          const updatedMissions = prev.missions.map((mission) => {
            let newProgress = mission.currentProgress;
            if (
              mission.type === "once" ||
              mission.type === "weekly" ||
              mission.type === "daily"
            ) {
              if (!mission.isClaimed && newProgress < mission.target) {
                newProgress++;
              }
            }
            return { ...mission, currentProgress: newProgress };
          });

          const newEarnedBadgeIds = [...prev.earnedBadgeIds];
          ALL_BADGES_CONFIG.forEach((badgeConfig) => {
            if (!newEarnedBadgeIds.includes(badgeConfig.id)) {
              let conditionMet = false;
              if (
                badgeConfig.id === "b_first_mission" &&
                prev.stats.tasksCompleted === 0
              )
                conditionMet = true;
              if (
                badgeConfig.id === "b_explorer_initiate" &&
                prev.stats.tasksCompleted + 1 >= 3
              )
                conditionMet = true;
              if (conditionMet) {
                newEarnedBadgeIds.push(badgeConfig.id);
                // showGlobalNotification("Commendation Earned!", `New badge: ${badgeConfig.name}`, badgeConfig.iconName);
              }
            }
          });

          return {
            ...prev,
            tasks: newTasks,
            xp: newXp,
            credits: newCredits,
            level: newLevel,
            missions: updatedMissions,
            earnedBadgeIds: newEarnedBadgeIds,
            stats: {
              ...prev.stats,
              tasksCompleted: prev.stats.tasksCompleted + 1,
              totalXpEarned: prev.stats.totalXpEarned + taskCompleted.xp,
              totalCreditsEarned:
                prev.stats.totalCreditsEarned +
                (taskCompleted.credits || Math.floor(taskCompleted.xp / 5)),
            },
          };
        }
        return prev;
      });
      // if (taskCompleted) showGlobalNotification("Mission Complete!", `+${taskCompleted.xp} XP! "${taskCompleted.title}" achieved.`, "FaCheckCircle");
    },
    [updatePlayerData]
  );

  const getXpBoundaries = useCallback(() => {
    if (!playerData)
      return {
        currentLevelXpStart: 0,
        nextLevelXpTarget: 100,
        xpInCurrentLevel: 0,
      };
    const currentLevelXpStart = XP_PER_LEVEL[playerData.level - 1] || 0;
    const nextLevelXpTarget =
      XP_PER_LEVEL[playerData.level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
    const xpInCurrentLevel = playerData.xp - currentLevelXpStart;
    return {
      currentLevelXpStart,
      nextLevelXpTarget,
      xpInCurrentLevel,
      totalXpForNextLevel: nextLevelXpTarget - currentLevelXpStart,
    };
  }, [playerData]);


  return {
    playerData,
    isLoadingData,
    updatePlayerData,
    addTask,
    editTask,
    completeTask,
    getXpBoundaries,
  };
};
