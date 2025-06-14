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
  FaFlask,
  FaStar,
  FaPalette,
  FaRedo,
  FaTrophy,
  FaBolt,
} from "react-icons/fa";
import api from "@/lib/api";

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
  category?: "Ship Customization" | "Commander Gear" | "Consumables";
  duration?: number;
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
  activePowerUps?: {
    [powerUpId: string]: {
      active: boolean;
      usesLeft?: number;
      expiresAt?: number;
    };
  };
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

export let ALL_BADGES_CONFIG: Omit<PlayerBadge, "earnedAt">[] = [
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

export let SHOP_ITEMS_CONFIG: ShopItem[] = [
  {
    id: "theme_nebula_dark",
    name: "Nebula Dark Theme",
    description:
      "Navigate the cosmos in a sleek, dark interface with vibrant nebula accents.",
    price: 250,
    type: "theme",
    value: "theme-nebula-dark",
    icon: FaPalette,
    category: "Ship Customization",
  },
  {
    id: "theme_starfield_light",
    name: "Starfield Light Theme",
    description:
      "A bright and clear interface, like gazing upon a field of distant stars.",
    price: 200,
    type: "theme",
    value: "theme-starfield-light",
    icon: FaPalette,
    category: "Ship Customization",
  },
  {
    id: "avatar_frame_gold_commander",
    name: "Gold Commander Frame",
    description: "A prestigious gold frame for your commander avatar.",
    price: 150,
    type: "avatar_frame",
    value: "gold-commander-frame",
    icon: FaStar,
    category: "Commander Gear",
  },
  {
    id: "avatar_frame_nova_burst",
    name: "Nova Burst Frame",
    description: "An energetic frame resembling a stellar nova.",
    price: 120,
    type: "avatar_frame",
    value: "nova-burst-frame",
    icon: FaStar,
    category: "Commander Gear",
  },
  {
    id: "power_up_xp_boost_small",
    name: "XP Hyper-Boost (Small)",
    description:
      "Doubles XP gained from the next completed mission log. Single use.",
    price: 75,
    type: "power_up",
    value: "xp_boost_small_1use",
    icon: FaFlask,
    category: "Consumables",
    duration: 1,
  },
];

const initialPlayerDataTemplate = (authUser: AuthUser | null): PlayerData => ({
  id: authUser ? String(authUser.id) : "defaultUser",
  name: authUser?.name || authUser?.email?.split("@")[0] || "Explorer",
  avatarUrl:
    (authUser as any)?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      authUser?.name || authUser?.email || "S"
    )}&background=7c3aed&color=fff&size=60`,
  level: 1,
  xp: 0,
  credits: 1000,
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
  activePowerUps: {},
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

  const fetchGameData = useCallback(async () => {
    if (!authUser) return;

    setIsLoadingData(true);
    try {
      const [profileRes, tasksRes, missionsRes, gameConfigRes] =
        await Promise.all([
          api.get("/auth/profile"),
          api.get("/tasks"),
          api.get("/missions/my-progress"),
          api.get("/game-config/all"),
        ]);

      const profile = profileRes.data;
      const tasks = tasksRes.data;
      const playerMissions = missionsRes.data;
      const gameConfig = gameConfigRes.data;

      ALL_BADGES_CONFIG = gameConfig.badges;
      SHOP_ITEMS_CONFIG = gameConfig.shopItems;

      const combinedData: PlayerData = {
        id: profile.userId,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        level: profile.level,
        xp: profile.xp,
        credits: profile.credits,
        activeTheme: profile.activeTheme,
        avatarFrameId: profile.activeAvatarFrameId,
        dailyLogin: profile.dailyLogin,
        dailyDiscovery: profile.dailyDiscovery,
        stats: profile.stats,
        tasks: tasks,
        missions: playerMissions,
        earnedBadgeIds: (profile.badges || []).map(
          (b: { badgeId: string }) => b.badgeId
        ),
        purchasedShopItemIds: (profile.inventory || []).map(
          (i: { itemId: string }) => i.itemId
        ),
      };

      setPlayerData(combinedData);
    } catch (error) {
      console.error("Gagal mengambil data game dari server:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      fetchGameData();
    } else {
      setPlayerData(null);
      setIsLoadingData(false);
    }
  }, [authUser, fetchGameData]);

  const updatePlayerData = useCallback(
    (
      newChanges:
        | Partial<PlayerData>
        | ((prevState: PlayerData) => Partial<PlayerData>)
    ) => {
      setPlayerData((currentPlayerData) => {
        if (typeof newChanges === "function") {
          if (currentPlayerData === null) {
            return null;
          }
          const changesToApply = newChanges(currentPlayerData);
          return { ...currentPlayerData, ...changesToApply };
        } else {
          if (currentPlayerData === null) {
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
        id: `task-<span class="math-inline">\{Date\.now\(\)\}\-</span>{Math.random().toString(36).substr(2, 9)}`,
        completed: false,
        status: "todo",
        assignedTo: newTaskData.assignedTo
          ? String(newTaskData.assignedTo)
          : playerData?.id
          ? String(playerData.id)
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

  const consumePowerUp = useCallback(
    (powerUpValue: string) => {
      updatePlayerData((prev) => {
        if (
          !prev.activePowerUps ||
          !prev.activePowerUps[powerUpValue]?.active
        ) {
          return {};
        }

        const powerUp = prev.activePowerUps[powerUpValue];
        let usesLeft = powerUp.usesLeft;
        let isActive = powerUp.active;

        if (usesLeft !== undefined) {
          usesLeft--;
          if (usesLeft <= 0) {
            isActive = false;
            const item = SHOP_ITEMS_CONFIG.find(
              (i) => i.value === powerUpValue
            );
            window.showGlobalNotification?.({
              type: "info",
              title: "Power-up Depleted",
              message: `Efek dari "${item?.name || powerUpValue}" telah habis.`,
              icon: FaFlask,
            });
          }
        }

        return {
          activePowerUps: {
            ...prev.activePowerUps,
            [powerUpValue]: { ...powerUp, active: isActive, usesLeft },
          },
        };
      });
    },
    [updatePlayerData]
  );

  const completeTask = useCallback(
    (taskId: string) => {
      let currentPlayerData: PlayerData | null = null;
      setPlayerData((prev) => {
        currentPlayerData = prev;
        return prev;
      });

      setTimeout(() => {
        if (!currentPlayerData) return;

        let taskThatWasCompleted: PlayerTask | undefined;
        let xpBoostMultiplier = 1;
        let activePowerUpValue: string | null = null;

        if (currentPlayerData.activePowerUps) {
          const boost = Object.entries(currentPlayerData.activePowerUps).find(
            ([key, value]) => key.includes("xp_boost") && value.active
          );
          if (boost) {
            xpBoostMultiplier = 2;
            activePowerUpValue = boost[0];
          }
        }
        updatePlayerData((prev: PlayerData) => {
          const originalLevel = prev.level;
          let madeChanges = false;
          let taskTitleForNotification = "";
          let taskCompletedXp = 0;
          let taskCompletedCredits = 0;

          const newTasks = prev.tasks.map((t) => {
            if (t.id === taskId && !t.completed) {
              madeChanges = true;
              taskThatWasCompleted = {
                ...t,
                completed: true,
                completedAt: new Date().toISOString(),
                status: "done",
              };

              taskCompletedXp = taskThatWasCompleted.xp * xpBoostMultiplier;

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

          if (activePowerUpValue) {
            window.showGlobalNotification?.({
              type: "quest",
              title: "Hyper-Boost Active!",
              message: `XP digandakan untuk "${taskTitleForNotification}"!`,
              icon: FaBolt,
            });
          }

          let newXp = prev.xp + taskCompletedXp;
          let newCredits = prev.credits + taskCompletedCredits;
          let newLevel = prev.level;
          let leveledUp = false;

          while (
            newLevel < XP_PER_LEVEL.length - 1 &&
            newXp >= XP_PER_LEVEL[newLevel]
          ) {
            newLevel++;
            leveledUp = true;
          }

          const updatedMissions = prev.missions.map((mission) => {
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
            if (
              currentProgress >= mission.target &&
              !mission.isClaimed &&
              prev.missions.find(
                (pm) => pm.id === mission.id && pm.currentProgress < pm.target
              )
            ) {
              window.showGlobalNotification?.({
                type: "quest",
                title: "Constellation Objective Met!",
                message: `"${mission.title}" ready for debrief. Claim your reward!`,
                icon: FaRocket,
              });
            }
            return { ...mission, currentProgress };
          });

          const newEarnedBadgeIds = [...prev.earnedBadgeIds];
          ALL_BADGES_CONFIG.forEach((badgeConfig) => {
            if (!prev.earnedBadgeIds.includes(badgeConfig.id)) {
              let conditionMet = false;
              const totalTasksNowCompleted = prev.stats.tasksCompleted + 1;
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
                prev.credits < 500
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

          if (leveledUp) {
            window.showGlobalNotification?.({
              type: "quest",
              title: "Promotion!",
              message: `Reached Command Level ${newLevel}!`,
              icon: FaUserShield,
            });
          }

          window.showGlobalNotification?.({
            type: "success",
            title: "Objective Cleared!",
            message: `+${taskCompletedXp} XP & +${taskCompletedCredits} CP for "${taskTitleForNotification}".`,
            icon: FaCheckCircle,
          });

          return {
            tasks: newTasks,
            xp: newXp,
            level: newLevel,
            credits: newCredits,
            missions: updatedMissions,
            earnedBadgeIds: newEarnedBadgeIds,
            stats: {
              ...prev.stats,
              tasksCompleted: prev.stats.tasksCompleted + 1,
              totalXpEarned: prev.stats.totalXpEarned + taskCompletedXp,
              totalCreditsEarned:
                prev.stats.totalCreditsEarned + taskCompletedCredits,
            },
          };
        });

        if (activePowerUpValue) {
          consumePowerUp(activePowerUpValue);
        }
      }, 50);
    },
    [setPlayerData, updatePlayerData, consumePowerUp]
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

  const purchaseShopItem = useCallback(
    (itemId: string) => {
      const item = SHOP_ITEMS_CONFIG.find((i) => i.id === itemId);
      if (!item) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Artifact Not Found",
          message: "The requested item does not exist in the Star Market.",
        });
        return false;
      }

      updatePlayerData((prev: PlayerData): Partial<PlayerData> => {
        if (prev.credits < item.price) {
          window.showGlobalNotification?.({
            type: "error",
            title: "Insufficient Credits",
            message: `You need ${item.price} CP for ${item.name}. You have ${prev.credits} CP.`,
          });
          return {};
        }

        if (
          item.type !== "power_up" &&
          prev.purchasedShopItemIds.includes(itemId)
        ) {
          window.showGlobalNotification?.({
            type: "info",
            title: "Already Acquired",
            message: `You already own the artifact: ${item.name}.`,
          });
          return {};
        }

        if (
          item.type === "power_up" &&
          prev.activePowerUps?.[item.value]?.active
        ) {
          window.showGlobalNotification?.({
            type: "warning",
            title: "Power-up Active",
            message: `${item.name} is already active or a similar boost is in effect.`,
          });
          return {};
        }

        const newCredits = prev.credits - item.price;
        let newPurchasedShopItemIds = [...prev.purchasedShopItemIds];
        let newActiveTheme = prev.activeTheme;
        let newAvatarFrameId = prev.avatarFrameId;
        let newActivePowerUps = { ...(prev.activePowerUps || {}) };

        let notificationTitle = "Artifact Acquired!";
        let notificationMessage = `You have successfully acquired ${item.name}!`;
        let notificationIcon: React.ElementType = item.icon || FaGift;

        if (item.type === "theme") {
          newActiveTheme = item.value;
          if (!newPurchasedShopItemIds.includes(itemId))
            newPurchasedShopItemIds.push(itemId);
          notificationMessage = `Ship's interface theme changed to ${item.name}.`;
        } else if (item.type === "avatar_frame") {
          newAvatarFrameId = item.value;
          if (!newPurchasedShopItemIds.includes(itemId))
            newPurchasedShopItemIds.push(itemId);
          notificationMessage = `Commander avatar frame set to ${item.name}.`;
        } else if (item.type === "power_up") {
          newActivePowerUps[item.value] = {
            active: true,
            usesLeft: item.duration,
          };
          notificationTitle = "Power-up Activated!";
          notificationMessage = `${item.name} is now active! (${
            item.duration
          } use${item.duration === 1 ? "" : "s"} left).`;
        } else if (item.type === "cosmetic") {
          if (!newPurchasedShopItemIds.includes(itemId))
            newPurchasedShopItemIds.push(itemId);
        }

        window.showGlobalNotification?.({
          type: "success",
          title: notificationTitle,
          message: notificationMessage,
          icon: notificationIcon,
        });

        return {
          credits: newCredits,
          purchasedShopItemIds: newPurchasedShopItemIds,
          activeTheme: newActiveTheme,
          avatarFrameId: newAvatarFrameId,
          activePowerUps: newActivePowerUps,
          stats: {
            ...prev.stats,
            totalCreditsEarned: prev.stats.totalCreditsEarned,
          },
        };
      });
      return true;
    },
    [updatePlayerData]
  );

  const updatePlayerProfile = useCallback(
    (newName: string, newAvatarUrl: string) => {
      updatePlayerData((prev: PlayerData) => {
        let nameChanged = prev.name !== newName && newName.trim() !== "";
        let avatarChanged =
          prev.avatarUrl !== newAvatarUrl && newAvatarUrl.trim() !== "";

        if (!nameChanged && !avatarChanged) return {};

        const updates: Partial<PlayerData> = {};
        if (nameChanged) updates.name = newName.trim();
        if (avatarChanged) updates.avatarUrl = newAvatarUrl.trim();

        window.showGlobalNotification?.({
          type: "success",
          title: "Profile Updated",
          message: "Your commander profile has been successfully updated.",
          icon: FaUserAstronaut,
        });
        return updates;
      });
    },
    [updatePlayerData]
  );

  const applyTheme = useCallback(
    (themeValue: string) => {
      const themeItem = SHOP_ITEMS_CONFIG.find(
        (item) => item.type === "theme" && item.value === themeValue
      );
      updatePlayerData((prev: PlayerData) => {
        if (prev.activeTheme === themeValue) {
          return {};
        }
        if (
          themeValue !== "theme-dark" &&
          themeValue !== "theme-default" &&
          !prev.purchasedShopItemIds.includes(themeItem?.id || "")
        ) {
          window.showGlobalNotification?.({
            type: "error",
            title: "Theme Not Owned",
            message: `You need to purchase the theme "${
              themeItem?.name || themeValue
            }" first.`,
          });
          return {};
        }

        window.showGlobalNotification?.({
          type: "success",
          title: "Ship Interface Updated",
          message: `Visual theme changed to "${
            themeItem?.name || themeValue
          }".`,
          icon: FaPalette,
        });
        return { activeTheme: themeValue };
      });
    },
    [updatePlayerData]
  );

  const applyAvatarFrame = useCallback(
    (frameValue: string | null) => {
      const frameItem = SHOP_ITEMS_CONFIG.find(
        (item) => item.type === "avatar_frame" && item.value === frameValue
      );
      updatePlayerData((prev: PlayerData) => {
        if (prev.avatarFrameId === frameValue) {
          return {};
        }
        if (
          frameValue !== null &&
          !prev.purchasedShopItemIds.includes(frameItem?.id || "")
        ) {
          window.showGlobalNotification?.({
            type: "error",
            title: "Frame Not Owned",
            message: `You need to purchase the frame "${
              frameItem?.name || frameValue
            }" first.`,
          });
          return {};
        }

        window.showGlobalNotification?.({
          type: "success",
          title: "Avatar Frame Updated",
          message: frameValue
            ? `Commander avatar frame set to "${
                frameItem?.name || frameValue
              }".`
            : "Avatar frame has been reset.",
          icon: FaStar,
        });
        return { avatarFrameId: frameValue };
      });
    },
    [updatePlayerData]
  );

  const resetGameData = useCallback(() => {
    if (authUser) {
      const defaultData = initialPlayerDataTemplate(authUser);
      setPlayerData(defaultData);
      window.showGlobalNotification?.({
        type: "warning",
        title: "Game Reset!",
        message:
          "Your mission logs, XP, and artifacts have been reset to default values.",
        icon: FaRedo,
        duration: 6000,
      });
    } else {
      window.showGlobalNotification?.({
        type: "error",
        title: "Error",
        message: "Cannot reset data. No user is logged in.",
      });
    }
  }, [authUser, setPlayerData]);

  const claimMissionReward = useCallback(
    (missionId: string) => {
      updatePlayerData((prev: PlayerData) => {
        const mission = prev.missions.find((m) => m.id === missionId);

        if (
          !mission ||
          mission.currentProgress < mission.target ||
          mission.isClaimed
        ) {
          window.showGlobalNotification?.({
            type: "error",
            title: "Claim Failed",
            message: mission?.isClaimed
              ? "Reward for this objective has already been claimed."
              : "Objective not yet completed.",
          });
          return {};
        }

        const rewardXp = mission.rewardXp || 0;
        const rewardCredits = mission.rewardCredits || 0;
        const rewardBadgeId = mission.rewardBadgeId;

        let newXp = prev.xp + rewardXp;
        let newCredits = prev.credits + rewardCredits;
        let newEarnedBadgeIds = [...prev.earnedBadgeIds];
        let newLevel = prev.level;
        let leveledUp = false;

        while (
          newLevel < XP_PER_LEVEL.length - 1 &&
          newXp >= XP_PER_LEVEL[newLevel]
        ) {
          newLevel++;
          leveledUp = true;
        }

        if (rewardBadgeId && !newEarnedBadgeIds.includes(rewardBadgeId)) {
          newEarnedBadgeIds.push(rewardBadgeId);
          const badge = ALL_BADGES_CONFIG.find((b) => b.id === rewardBadgeId);
          if (badge) {
            window.showGlobalNotification?.({
              type: "success",
              title: "Commendation Earned!",
              message: `New insignia acquired: ${badge.name}`,
              icon: badge.icon,
            });
          }
        }

        window.showGlobalNotification?.({
          type: "success",
          title: "Reward Claimed!",
          message: `+${rewardXp} XP & +${rewardCredits} CP for completing "${mission.title}"!`,
          icon: FaTrophy,
        });

        if (leveledUp) {
          window.showGlobalNotification?.({
            type: "quest",
            title: "Promotion!",
            message: `Your reward propelled you to Level ${newLevel}!`,
            icon: FaUserShield,
          });
        }

        const updatedMissions = prev.missions.map((m) =>
          m.id === missionId ? { ...m, isClaimed: true } : m
        );

        return {
          xp: newXp,
          credits: newCredits,
          level: newLevel,
          missions: updatedMissions,
          earnedBadgeIds: newEarnedBadgeIds,
          stats: {
            ...prev.stats,
            totalXpEarned: prev.stats.totalXpEarned + rewardXp,
            totalCreditsEarned: prev.stats.totalCreditsEarned + rewardCredits,
          },
        };
      });
    },
    [updatePlayerData]
  );

  return {
    playerData,
    isLoadingData,
    updatePlayerData,
    addTask,
    editTask,
    completeTask,
    getXpBoundaries,
    handleDailyLogin,
    purchaseShopItem,
    consumePowerUp,
    updatePlayerProfile,
    applyTheme,
    applyAvatarFrame,
    resetGameData,
    claimMissionReward,
  };
};
