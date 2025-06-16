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
  taskId: string;
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
  missionId: string;
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
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: string;
}

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  type: "theme" | "avatar_frame" | "power_up" | "cosmetic";
  value: string;
  icon?: string;
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
    badgeId: "b_first_mission",
    name: "First Contact",
    description: "Complete your first mission log.",
    icon: "FaRegLightbulb",
    color: "text-yellow-400",
  },
  {
    badgeId: "b_explorer_initiate",
    name: "Explorer Initiate",
    description: "Complete 3 mission logs.",
    icon: "FaSpaceShuttle",
    color: "text-sky-400",
  },
  {
    badgeId: "b_diligent_commander",
    name: "Diligent Commander",
    description: "Complete 10 mission logs.",
    icon: "FaUserAstronaut",
    color: "text-purple-400",
  },
  {
    badgeId: "b_level_5_cadet",
    name: "Cadet Level 5",
    description: "Reach Level 5.",
    icon: "FaGraduationCap",
    color: "text-indigo-400",
  },
  {
    badgeId: "b_daily_streak_3",
    name: "Consistent Voyager (3 Days)",
    description: "Log in 3 days in a row.",
    icon: "FaCalendarCheck",
    color: "text-teal-400",
  },
  {
    badgeId: "b_credits_collector",
    name: "Credits Collector",
    description: "Accumulate 500 Cosmic Credits.",
    icon: "FaCoins",
    color: "text-amber-400",
  },
];

export let SHOP_ITEMS_CONFIG: ShopItem[] = [
  {
    itemId: "theme_nebula_dark",
    name: "Nebula Dark Theme",
    description:
      "Navigate the cosmos in a sleek, dark interface with vibrant nebula accents.",
    price: 250,
    type: "theme",
    value: "theme-nebula-dark",
    icon: "FaPalette",
    category: "Ship Customization",
  },
  {
    itemId: "theme_starfield_light",
    name: "Starfield Light Theme",
    description:
      "A bright and clear interface, like gazing upon a field of distant stars.",
    price: 200,
    type: "theme",
    value: "theme-starfield-light",
    icon: "FaPalette",
    category: "Ship Customization",
  },
  {
    itemId: "avatar_frame_gold_commander",
    name: "Gold Commander Frame",
    description: "A prestigious gold frame for your commander avatar.",
    price: 150,
    type: "avatar_frame",
    value: "gold-commander-frame",
    icon: "FaStar",
    category: "Commander Gear",
  },
  {
    itemId: "avatar_frame_nova_burst",
    name: "Nova Burst Frame",
    description: "An energetic frame resembling a stellar nova.",
    price: 120,
    type: "avatar_frame",
    value: "nova-burst-frame",
    icon: "FaStar",
    category: "Commander Gear",
  },
  {
    itemId: "power_up_xp_boost_small",
    name: "XP Hyper-Boost (Small)",
    description:
      "Doubles XP gained from the next completed mission log. Single use.",
    price: 75,
    type: "power_up",
    value: "xp_boost_small_1use",
    icon: "FaFlask",
    category: "Consumables",
    duration: 1,
  },
];

const initialPlayerDataTemplate = (authUser: AuthUser | null): PlayerData => ({
  id: authUser ? String(authUser.userId) : "defaultUser",
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
      missionId: "m_initial_steps",
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
      missionId: "m_weekly_scan",
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

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [allBadges, setAllBadges] = useState<PlayerBadge[]>([]);

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

      const todayStr = new Date().toISOString().split("T")[0];
      const lastLoginStr = profile.lastLoginDate
        ? new Date(profile.lastLoginDate).toISOString().split("T")[0]
        : null;

      const combinedData: PlayerData = {
        id: profile.userId,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        level: profile.level,
        xp: profile.xp,
        credits: profile.credits,
        activeTheme: profile.activeTheme,
        avatarFrameId: profile.activeAvatarFrameId,
        tasks: tasks,
        missions: playerMissions,
        earnedBadgeIds: (profile.badges || []).map(
          (b: { badgeId: string }) => b.badgeId
        ),
        purchasedShopItemIds: (profile.inventory || []).map(
          (i: { itemId: string }) => i.itemId
        ),
        dailyLogin: {
          lastLoginDate: profile.lastLoginDate,
          streak: profile.loginStreak,
          bonusClaimedToday: todayStr === lastLoginStr,
        },
        dailyDiscovery: {
          lastClaimedDate: profile.lastDiscoveryDate,
          available:
            todayStr !==
            (profile.lastDiscoveryDate
              ? new Date(profile.lastDiscoveryDate).toISOString().split("T")[0]
              : null),
        },
        stats: profile.stats,
      };

      setShopItems(gameConfig.shopItems);
      setAllBadges(gameConfig.badges);

      setPlayerData(combinedData);
      console.log(combinedData);
      if (!combinedData.dailyLogin.bonusClaimedToday) {
        api
          .post("/daily/check-in")
          .then((response) => {
            fetchGameData();
          })
          .catch((err) => {
            if (err.response?.status !== 400) console.error(err);
          });
      }
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
    async (
      newTaskData: Omit<
        PlayerTask,
        "taskId" | "completed" | "completedAt" | "status"
      >
    ) => {
      if (!playerData) return;

      try {
        const response = await api.post("/tasks", newTaskData);
        const createdTask = response.data;

        updatePlayerData((prev) => {
          if (!prev) return {};
          return {
            tasks: [createdTask, ...prev.tasks],
          };
        });

        window.showGlobalNotification?.({
          type: "info",
          title: "Mission Log Added!",
          message: `"${createdTask.title}" has been recorded.`,
          icon: FaFileMedicalAlt,
        });

        return createdTask;
      } catch (error) {
        console.error("Gagal membuat tugas baru:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Creation Failed",
          message: "Failed to record new mission log on the server.",
        });
      }
    },
    [playerData, updatePlayerData]
  );

  const editTask = useCallback(
    async (taskId: string, updates: Partial<PlayerTask>) => {
      if (!playerData) return;

      try {
        const response = await api.put(`/tasks/${taskId}`, updates);
        const updatedTask = response.data;

        updatePlayerData((prev) => {
          if (!prev) return {};
          return {
            tasks: prev.tasks.map((task) =>
              task.taskId === taskId ? updatedTask : task
            ),
          };
        });

        window.showGlobalNotification?.({
          type: "info",
          title: "Mission Log Updated!",
          message: `Log entry "${updatedTask.title}" modified.`,
          icon: FaEdit,
        });

        return updatedTask;
      } catch (error) {
        console.error(`Gagal memperbarui tugas ${taskId}:`, error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Update Failed",
          message: "Failed to save changes to the server.",
        });
      }
    },
    [playerData, updatePlayerData]
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
    async (taskId: string) => {
      if (!playerData) return;

      try {
        const response = await api.post(`/tasks/${taskId}/complete`);
        const { task: updatedTask, eventResult } = response.data;

        updatePlayerData((prev) => {
          if (!prev) return {};

          const newState = { ...prev };

          newState.tasks = prev.tasks.map((t) =>
            t.taskId === taskId ? updatedTask : t
          );

          const user = prev;
          user.xp += updatedTask.xp;
          user.credits += updatedTask.credits;
          if (eventResult.leveledUp) {
            user.level = eventResult.leveledUp.to;
          }

          if (
            eventResult.missionsReadyToClaim &&
            eventResult.missionsReadyToClaim.length > 0
          ) {
            const readyMissionIds = new Set(
              eventResult.missionsReadyToClaim.map((m: any) => m.missionId)
            );
            newState.missions = prev.missions.map((pm) => {
              if (readyMissionIds.has(pm.missionId)) {
              }
              return pm;
            });
          }

          return newState;
        });

        window.showGlobalNotification?.({
          type: "success",
          title: "Objective Cleared!",
          message: `+${updatedTask.xp} XP & +${updatedTask.credits} CP for "${updatedTask.title}".`,
          icon: FaCheckCircle,
        });

        if (eventResult.leveledUp) {
          window.showGlobalNotification?.({
            type: "quest",
            title: "Promotion!",
            message: `Reached Command Level ${eventResult.leveledUp.to}!`,
            icon: FaUserShield,
          });
        }

        if (eventResult.badgesEarned && eventResult.badgesEarned.length > 0) {
          eventResult.badgesEarned.forEach((badge: any) => {
            window.showGlobalNotification?.({
              type: "success",
              title: "Commendation Earned!",
              message: `New insignia: ${badge.name}`,
              icon: FaAward,
            });
          });
        }
      } catch (error: any) {
        console.error(`Gagal menyelesaikan tugas ${taskId}:`, error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Action Failed",
          message:
            error.response?.data?.message ||
            "Failed to complete the objective on the server.",
        });
      }
    },
    [playerData, updatePlayerData]
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

  const handleDailyLogin = useCallback(async () => {
    if (!playerData) return;

    try {
      const response = await api.post("/daily/check-in");
      const { bonusXp, bonusCredits, user: updatedUser } = response.data;

      updatePlayerData((prev) => ({
        ...prev,
        ...updatedUser,
        dailyLogin: {
          lastLoginDate: updatedUser.lastLoginDate,
          streak: updatedUser.loginStreak,
          bonusClaimedToday: true,
        },
      }));

      window.showGlobalNotification?.({
        type: "success",
        title: "Daily Check-in Bonus!",
        message: `Streak: ${updatedUser.loginStreak} days! +${bonusXp} XP, +${bonusCredits} CP.`,
        icon: FaCalendarCheck,
      });
    } catch (error: any) {
      if (error.response?.status !== 400) {
        console.error("Gagal melakukan check-in harian:", error);
      }
    }
  }, [playerData, updatePlayerData]);

  const purchaseShopItem = useCallback(
    async (itemId: string) => {
      if (!playerData) return;

      const item = shopItems.find((i) => i.itemId === itemId);
      if (!item) {
        console.error("Item tidak ditemukan di konfigurasi.");
        return;
      }

      if (playerData.credits < item.price) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Insufficient Credits!",
          message: `Not enough Cosmic Points for ${item.name}.`,
        });
        return;
      }

      try {
        await api.post("/shop/purchase", { itemId });
        await fetchGameData();

        window.showGlobalNotification?.({
          type: "success",
          title: "Artifact Acquired!",
          message: `You have successfully acquired ${item.name}!`,
        });
      } catch (error: any) {
        console.error("Gagal membeli item:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Purchase Failed",
          message:
            error.response?.data?.message ||
            "Could not complete the transaction.",
        });
      }
    },
    [playerData, shopItems, fetchGameData]
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
    async (themeValue: string) => {
      try {
        const response = await api.put("/users/profile/apply-theme", {
          themeValue,
        });
        const updatedUser = response.data;
        updatePlayerData((prev) => {
          if (!prev) return {};
          return {
            ...prev,
            name: updatedUser.name,
            avatarUrl: updatedUser.avatarUrl,
            activeTheme: updatedUser.activeTheme,
            activeAvatarFrameId: updatedUser.activeAvatarFrameId,
          };
        });

        window.showGlobalNotification?.({
          type: "success",
          title: "Ship Interface Updated",
          message: `Visual theme changed to "${updatedUser.activeTheme}".`,
          icon: FaPalette,
        });
      } catch (error: any) {
        console.error("Gagal menerapkan tema:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Failed to Apply Theme",
          message:
            error.response?.data?.message ||
            "Could not apply the selected theme.",
        });
      }
    },
    [updatePlayerData]
  );

  const applyAvatarFrame = useCallback(
    async (frameValue: string | null) => {
      try {
        const response = await api.put("/users/profile/apply-frame", {
          frameValue,
        });
        const updatedUser = response.data;

        updatePlayerData((prev) => {
          if (!prev) return {};
          return {
            ...prev,
            activeAvatarFrameId: updatedUser.activeAvatarFrameId,
          };
        });

        window.showGlobalNotification?.({
          type: "success",
          title: "Avatar Frame Updated",
          message: frameValue
            ? `Commander avatar frame has been set.`
            : "Avatar frame has been reset.",
          icon: FaStar,
        });
      } catch (error: any) {
        console.error("Gagal menerapkan frame:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Failed to Apply Frame",
          message:
            error.response?.data?.message ||
            "Could not apply the selected frame.",
        });
      }
    },
    [updatePlayerData]
  );

  const resetGameData = useCallback(async () => {
    if (!authUser) return;

    try {
      const response = await api.post("/user/profile/reset");
      const resetData = response.data;

      await fetchGameData();

      window.showGlobalNotification?.({
        type: "warning",
        title: "Game Reset!",
        message: "Your mission logs, XP, and artifacts have been reset.",
        icon: FaRedo,
        duration: 6000,
      });
    } catch (error) {
      console.error("Gagal mereset data:", error);
      window.showGlobalNotification?.({
        type: "error",
        title: "Reset Failed",
        message: "Could not reset your game data on the server.",
      });
    }
  }, [authUser, fetchGameData]);

  const claimMissionReward = useCallback(
    async (missionId: string) => {
      if (!playerData) return;

      try {
        const response = await api.post(`/missions/${missionId}/claim`);
        const { eventResult } = response.data;

        if (eventResult.leveledUp) {
          window.showGlobalNotification?.({
            type: "quest",
            title: "Promotion!",
            message: `Your reward propelled you to Level ${eventResult.leveledUp.to}!`,
            icon: FaUserShield,
          });
        }

        if (eventResult.badgesEarned && eventResult.badgesEarned.length > 0) {
          eventResult.badgesEarned.forEach((badge: PlayerBadge) => {
            window.showGlobalNotification?.({
              type: "success",
              title: "Commendation Earned!",
              message: `New insignia acquired: ${badge.name}`,
              icon: FaAward,
            });
          });
        }

        fetchGameData();
      } catch (error: any) {
        console.error("Gagal klaim hadiah misi:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Claim Failed",
          message:
            error.response?.data?.message || "Could not claim mission reward.",
        });
      }
    },
    [playerData, fetchGameData]
  );

  const claimDailyDiscovery = useCallback(async () => {
    if (!playerData) return;

    try {
      const response = await api.post("/daily/claim-discovery");
      const { rewardCredits, rewardXp } = response.data;

      fetchGameData();

      window.showGlobalNotification?.({
        type: "success",
        title: "Supply Drop Acquired!",
        message: `You found +${rewardCredits} CP and +${rewardXp} XP!`,
        icon: FaGift,
      });
    } catch (error: any) {
      console.error("Gagal klaim discovery:", error);
      window.showGlobalNotification?.({
        type: "error",
        title: "Claim Failed",
        message:
          error.response?.data?.message || "Supply drop already claimed today.",
      });
    }
  }, [playerData, fetchGameData]);

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
    SHOP_ITEMS_CONFIG: shopItems,
    ALL_BADGES_CONFIG: allBadges,
    claimDailyDiscovery,
  };
};
