"use client";

import { useState, useEffect, useCallback } from "react";
import { User as AuthUser } from "@/contexts/AuthContext";
import {
  FaCheckCircle,
  FaEdit,
  FaFileMedicalAlt,
  FaUserShield,
  FaAward,
  FaGift,
  FaCalendarCheck,
  FaRocket,
  FaRegLightbulb,
  FaSpaceShuttle,
  FaUserAstronaut,
  FaGraduationCap,
  FaCoins,
} from "react-icons/fa";

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
  icon: React.ElementType;
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
  icon: React.ElementType;
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

const iconMap: { [key: string]: React.ElementType } = {
  FaRegLightbulb: FaRegLightbulb,
  FaSpaceShuttle: FaSpaceShuttle,
  FaUserAstronaut: FaUserAstronaut,
  FaGraduationCap: FaGraduationCap,
  FaCalendarCheck: FaCalendarCheck,
  FaCoins: FaCoins,
  FaRocket: FaRocket,
  FaAward: FaAward,
};

export const ALL_BADGES_CONFIG: Omit<PlayerBadge, "earnedAt">[] = [
  {
    id: "b_first_mission",
    name: "First Contact",
    description: "Complete your first mission log.",
    icon: iconMap["FaRegLightbulb"] || FaAward,
    color: "text-yellow-400",
  },
  {
    id: "b_explorer_initiate",
    name: "Explorer Initiate",
    description: "Complete 3 mission logs.",
    icon: iconMap["FaSpaceShuttle"] || FaAward,
    color: "text-sky-400",
  },
  {
    id: "b_diligent_commander",
    name: "Diligent Commander",
    description: "Complete 10 mission logs.",
    icon: iconMap["FaUserAstronaut"] || FaAward,
    color: "text-purple-400",
  },
  {
    id: "b_level_5_cadet",
    name: "Cadet Level 5",
    description: "Reach Level 5.",
    icon: iconMap["FaGraduationCap"] || FaAward,
    color: "text-indigo-400",
  },
  {
    id: "b_daily_streak_3",
    name: "Consistent Voyager (3 Days)",
    description: "Log in 3 days in a row.",
    icon: iconMap["FaCalendarCheck"] || FaAward,
    color: "text-teal-400",
  },
  {
    id: "b_credits_collector",
    name: "Credits Collector",
    description: "Accumulate 500 Cosmic Credits.",
    icon: iconMap["FaCoins"] || FaAward,
    color: "text-amber-400",
  },
];

const initialPlayerDataTemplate = (authUser: AuthUser | null): PlayerData => ({
  id: authUser?.id || "defaultUser",
  name: authUser?.name || authUser?.email?.split("@")[0] || "Explorer",
  avatarUrl:
    // authUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      authUser?.name || authUser?.email || "S"
    )}&background=7c3aed&color=fff&size=60`,
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
    lastStreakUpdateDate: undefined,
  },
});

export const useGameData = (authUser: AuthUser | null) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const getLocalStorageKey = useCallback(() => {
    return authUser ? `spaceQuestGameData_${String(authUser.id)}` : null;
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
          id: String(authUser!.id),
          name:
            authUser!.name || authUser!.email?.split("@")[0] || template.name,
          avatarUrl: parsedData.avatarUrl || template.avatarUrl,
          missions: template.missions.map((tm) => ({
            ...tm,
            ...(parsedData.missions?.find((pm) => pm.id === tm.id) || {}),
          })),
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
      newChanges:
        | Partial<PlayerData>
        | ((prevState: PlayerData) => Partial<PlayerData>)
    ) => {
      setPlayerData((currentPlayerData) => {
        if (typeof newChanges === "function") {
          if (currentPlayerData === null) {
            console.warn(
              "updatePlayerData (functional update) called while current player data is null. Update skipped."
            );
            return null;
          }
          const changesToApply = newChanges(currentPlayerData);
          return { ...currentPlayerData, ...changesToApply };
        } else {
          if (currentPlayerData === null) {
            console.warn(
              "updatePlayerData (object update) called while current player data is null. Update skipped."
            );
            return null;
          }
          return { ...currentPlayerData, ...newChanges };
        }
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
      const taskToAdd: PlayerTask = {
        ...newTaskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        completed: false,
        status: "todo",
        assignedTo:
          newTaskData.assignedTo === undefined
            ? playerData?.id
              ? String(playerData.id)
              : null
            : newTaskData.assignedTo
            ? String(newTaskData.assignedTo)
            : null,
      };
      updatePlayerData((prevPlayerData: PlayerData) => {
        return { tasks: [taskToAdd, ...(prevPlayerData.tasks || [])] };
      });
      window.showGlobalNotification?.({
        type: "info",
        title: "Mission Log Added!",
        message: `"${taskToAdd.title}" has been recorded.`,
        icon: FaFileMedicalAlt,
      });
      return taskToAdd;
    },
    [updatePlayerData, playerData?.id]
  );

  const editTask = useCallback(
    (taskId: string, updates: Partial<PlayerTask>) => {
      let taskTitleForNotification = "";
      updatePlayerData((prevPlayerData: PlayerData) => {
        const newTasks = prevPlayerData.tasks.map((task) => {
          if (task.id === taskId) {
            taskTitleForNotification = updates.title || task.title;
            return { ...task, ...updates };
          }
          return task;
        });
        if (!prevPlayerData.tasks.find((task) => task.id === taskId))
          return prevPlayerData;
        return { ...prevPlayerData, tasks: newTasks };
      });
      if (taskTitleForNotification) {
        window.showGlobalNotification?.({
          type: "info",
          title: "Mission Log Updated!",
          message: `Log entry "${taskTitleForNotification}" modified.`,
          icon: FaEdit,
        });
      }
    },
    [updatePlayerData]
  );

  const completeTask = useCallback(
    (taskId: string) => {
      let taskCompletedXp = 0;
      let taskCompletedCredits = 0;
      let taskTitleForNotification = "";

      updatePlayerData((prevPlayerData: PlayerData) => {
        let taskThatWasCompleted: PlayerTask | undefined;
        const originalLevel = prevPlayerData.level;
        let madeChanges = false;

        const newTasks = prevPlayerData.tasks.map((t) => {
          if (t.id === taskId && !t.completed) {
            madeChanges = true;
            taskThatWasCompleted = {
              ...t,
              completed: true,
              completedAt: new Date().toISOString(),
              status: "done",
            };
            taskCompletedXp = taskThatWasCompleted.xp;
            taskCompletedCredits =
              taskThatWasCompleted.credits ||
              Math.floor(taskThatWasCompleted.xp / 5);
            taskTitleForNotification = taskThatWasCompleted.title;
            return taskThatWasCompleted;
          }
          return t;
        });

        if (!madeChanges || !taskThatWasCompleted) {
          return {};
        }

        let newXp = prevPlayerData.xp + taskCompletedXp;
        let newCredits = prevPlayerData.credits + taskCompletedCredits;
        let newLevel = prevPlayerData.level;
        let leveledUp = false;

        while (
          newLevel < XP_PER_LEVEL.length - 1 &&
          newXp >= XP_PER_LEVEL[newLevel]
        ) {
          newLevel++;
          leveledUp = true;
        }

        const updatedMissions = prevPlayerData.missions.map((mission) => {
          let currentProgress = mission.currentProgress;
          if (
            !mission.isClaimed &&
            currentProgress < mission.target &&
            (mission.type === "once" ||
              mission.type === "weekly" ||
              mission.type === "daily")
          ) {
            currentProgress++;
          }
          return { ...mission, currentProgress };
        });

        const newEarnedBadgeIds = [...prevPlayerData.earnedBadgeIds];

        if (leveledUp) {
          window.showGlobalNotification?.({
            type: "quest",
            title: "Promotion!",
            message: `Reached Command Level ${newLevel}! New perks unlocked.`,
            icon: FaUserShield,
          });
        }
        updatedMissions.forEach((mission) => {
          if (
            mission.currentProgress >= mission.target &&
            !mission.isClaimed &&
            prevPlayerData.missions.find(
              (pm) => pm.id === mission.id && pm.currentProgress < pm.target
            )
          ) {
            window.showGlobalNotification?.({
              type: "quest",
              title: "Constellation Objective Met!",
              message: `"${mission.title}" ready for debrief. Claim your reward!`,
              icon: iconMap["FaRocket"] || FaRocket,
            });
          }
        });
        ALL_BADGES_CONFIG.forEach((badgeConfig) => {
          if (!prevPlayerData.earnedBadgeIds.includes(badgeConfig.id)) {
            let conditionMet = false;
            const totalTasksNowCompleted =
              prevPlayerData.stats.tasksCompleted + 1;
            if (
              badgeConfig.id === "b_first_mission" &&
              totalTasksNowCompleted === 1
            )
              conditionMet = true;
            if (
              badgeConfig.id === "b_explorer_initiate" &&
              totalTasksNowCompleted >= 3
            )
              conditionMet = true;
            if (
              badgeConfig.id === "b_diligent_commander" &&
              totalTasksNowCompleted >= 10
            )
              conditionMet = true;
            if (
              badgeConfig.id === "b_level_5_cadet" &&
              newLevel >= 5 &&
              originalLevel < 5
            )
              conditionMet = true;
            if (
              badgeConfig.id === "b_credits_collector" &&
              newCredits >= 500 &&
              prevPlayerData.credits < 500
            )
              conditionMet = true;

            if (conditionMet && !newEarnedBadgeIds.includes(badgeConfig.id)) {
              newEarnedBadgeIds.push(badgeConfig.id);
              window.showGlobalNotification?.({
                type: "success",
                title: "Commendation Earned!",
                message: `New insignia: ${badgeConfig.name}`,
                icon: badgeConfig.icon || FaAward,
              });
            }
          }
        });

        if (taskTitleForNotification) {
          window.showGlobalNotification?.({
            type: "success",
            title: "Objective Cleared!",
            message: `+${taskCompletedXp} XP & +${taskCompletedCredits} CP for "${taskTitleForNotification}".`,
            icon: FaCheckCircle,
          });
        }

        return {
          tasks: newTasks,
          xp: newXp,
          credits: newCredits,
          level: newLevel,
          missions: updatedMissions,
          earnedBadgeIds: newEarnedBadgeIds,
          stats: {
            ...prevPlayerData.stats,
            tasksCompleted: prevPlayerData.stats.tasksCompleted + 1,
            totalXpEarned: prevPlayerData.stats.totalXpEarned + taskCompletedXp,
            totalCreditsEarned:
              prevPlayerData.stats.totalCreditsEarned + taskCompletedCredits,
          },
        };
      });
    },
    [updatePlayerData]
  );

  const getXpBoundaries = useCallback(() => {
    if (!playerData)
      return {
        currentLevelXpStart: 0,
        nextLevelXpTargetCumulative: XP_PER_LEVEL[1] || 100,
        xpInCurrentLevel: 0,
        totalXpForThisLevel: XP_PER_LEVEL[1] || 100,
      };
    const currentLevelXpStart = XP_PER_LEVEL[playerData.level - 1] || 0;
    const nextLevelXpTargetCumulative =
      playerData.level < XP_PER_LEVEL.length
        ? XP_PER_LEVEL[playerData.level] ||
          XP_PER_LEVEL[XP_PER_LEVEL.length - 1]
        : playerData.xp;
    const totalXpForThisLevel =
      nextLevelXpTargetCumulative - currentLevelXpStart;
    const xpInCurrentLevel = playerData.xp - currentLevelXpStart;
    return {
      currentLevelXpStart,
      nextLevelXpTargetCumulative,
      xpInCurrentLevel,
      totalXpForThisLevel:
        totalXpForThisLevel <= 0 && playerData.level < XP_PER_LEVEL.length - 1
          ? XP_PER_LEVEL[playerData.level] - currentLevelXpStart
          : totalXpForThisLevel <= 0
          ? 1
          : totalXpForThisLevel,
    };
  }, [playerData]);

  const handleDailyLogin = useCallback(() => {
    if (!playerData) return;
    const todayStr = new Date().toISOString().split("T")[0];

    if (playerData.dailyLogin.lastLoginDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const currentStreak = playerData.dailyLogin.streak || 0;
      const newStreak =
        playerData.dailyLogin.lastLoginDate === yesterdayStr
          ? currentStreak + 1
          : 1;
      const bonusXp = 10 + newStreak * 5;
      const bonusCredits = 5 + newStreak * 2;

      updatePlayerData((prevPlayerData: PlayerData) => {
        const originalLevel = prevPlayerData.level;
        const newXpVal = prevPlayerData.xp + bonusXp;
        const newCreditsVal = prevPlayerData.credits + bonusCredits;
        let newLevelVal = prevPlayerData.level;
        let leveledUp = false;
        while (
          newLevelVal < XP_PER_LEVEL.length - 1 &&
          newXpVal >= XP_PER_LEVEL[newLevelVal]
        ) {
          newLevelVal++;
          leveledUp = true;
        }

        const earnedBadges = [...prevPlayerData.earnedBadgeIds];
        if (newStreak >= 3 && !earnedBadges.includes("b_daily_streak_3")) {
          earnedBadges.push("b_daily_streak_3");
          const badge = ALL_BADGES_CONFIG.find(
            (b) => b.id === "b_daily_streak_3"
          );
          if (badge) {
            setTimeout(
              () =>
                window.showGlobalNotification?.({
                  type: "success",
                  title: "Commendation Earned!",
                  message: `New insignia: ${badge.name}`,
                  icon: badge.icon,
                }),
              100
            );
          }
        }
        if (leveledUp) {
          setTimeout(
            () =>
              window.showGlobalNotification?.({
                type: "quest",
                title: "Level Up via Login Bonus!",
                message: `Reached Command Level ${newLevelVal}!`,
                icon: FaUserShield,
              }),
            50
          );
        }

        return {
          xp: newXpVal,
          credits: newCreditsVal,
          level: newLevelVal,
          dailyLogin: {
            lastLoginDate: todayStr,
            streak: newStreak,
            bonusClaimedToday: true,
          },
          earnedBadgeIds: earnedBadges,
          stats: {
            ...prevPlayerData.stats,
            logins: prevPlayerData.stats.logins + 1,
            currentMissionStreak: Math.max(
              prevPlayerData.stats.currentMissionStreak,
              newStreak
            ),
            longestMissionStreak: Math.max(
              prevPlayerData.stats.longestMissionStreak,
              newStreak
            ),
          },
        };
      });
      window.showGlobalNotification?.({
        type: "success",
        title: "Daily Logon Bonus!",
        message: `Streak: ${newStreak} days! +${bonusXp} XP, +${bonusCredits} CP.`,
        icon: FaCalendarCheck,
      });
    }
  }, [playerData, updatePlayerData]);

  useEffect(() => {
    if (
      playerData &&
      !isLoadingData &&
      authUser &&
      !playerData.dailyLogin.bonusClaimedToday &&
      playerData.dailyLogin.lastLoginDate !==
        new Date().toISOString().split("T")[0]
    ) {
      handleDailyLogin();
    }
  }, [playerData?.id, isLoadingData, authUser]);

  return {
    playerData,
    isLoadingData,
    updatePlayerData,
    addTask,
    editTask,
    completeTask,
    getXpBoundaries,
    handleDailyLogin,
  };
};
