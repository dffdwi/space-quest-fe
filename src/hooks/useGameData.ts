"use client";

import { useState, useEffect, useCallback } from "react";
import { User as AuthUser, useAuth } from "@/contexts/AuthContext";
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
} from "react-icons/fa";
import api from "@/lib/api";

export interface PlayerTask {
  taskId: string;
  userId?: string;
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
  type?: string;
  isRewardClaimed?: boolean;
  statusChangeRequest?: string | null;
  statusChangeRequesterId?: string | null;
  statusChangeMessage?: string | null;
  owner?: {
    userId: string;
    name: string;
    avatarUrl: string;
  };
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
  dailyPersonalXpGained?: number;
  dailyPersonalCpGained?: number;
}

export interface PlayerActivePowerUp {
  activePowerUpId: string;
  userId: string;
  itemId: string;
  usesLeft?: number;
  expiresAt?: string;
  item: ShopItem;
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
  pendingInvitationCount?: number;
  activePowerUps?: PlayerActivePowerUp[];
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

export const useGameData = () => {
  const {
    user,
    playerData,
    isGameDataLoading,
    refetchGameData,
    shopItems,
    allBadges,
  } = useAuth();

  const addTask = useCallback(
    async (
      newTaskData: Omit<PlayerTask, "taskId" | "completed" | "completedAt">
    ) => {
      try {
        const response = await api.post("/tasks", newTaskData);
        await refetchGameData(); // Panggil refetch untuk sinkronisasi
        window.showGlobalNotification?.({
          type: "info",
          title: "Mission Log Added!",
          message: `"${response.data.title}" has been recorded.`,
          icon: FaFileMedicalAlt,
        });
      } catch (error: any) {
        console.error("Gagal membuat tugas baru:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Creation Failed",
          message:
            error.response?.data?.message ||
            "Failed to record new mission log.",
        });
      }
    },
    [refetchGameData]
  );

  const editTask = useCallback(
    async (taskId: string, updates: Partial<PlayerTask>) => {
      try {
        const response = await api.put(`/tasks/${taskId}`, updates);
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "info",
          title: "Mission Log Updated!",
          message: `Changes to "${response.data.title}" have been saved.`,
          icon: FaEdit,
        });
      } catch (error: any) {
        console.error(`Gagal memperbarui tugas ${taskId}:`, error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Update Failed",
          message: error.response?.data?.message || "Could not save changes.",
        });
      }
    },
    [refetchGameData]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      try {
        const response = await api.post(`/tasks/${taskId}/complete`);
        const { eventResult } = response.data;
        await refetchGameData();

        // Tampilkan notifikasi berdasarkan hasil dari backend
        if (eventResult?.powerUpConsumed) {
          window.showGlobalNotification?.({
            type: "quest",
            title: "Power-up Consumed!",
            message: `XP Boost was used.`,
          });
        }
        if (eventResult?.leveledUp) {
          window.showGlobalNotification?.({
            type: "quest",
            title: "Promotion!",
            message: `Reached Command Level ${eventResult.leveledUp.to}!`,
            icon: FaUserShield,
          });
        }
      } catch (error: any) {
        console.error(`Gagal menyelesaikan tugas ${taskId}:`, error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Action Failed",
          message:
            error.response?.data?.message ||
            "Could not complete the objective.",
        });
      }
    },
    [refetchGameData]
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
    try {
      const response = await api.post("/daily/check-in");
      const { bonusXp, bonusCredits, user: updatedUser } = response.data;

      // Panggil refetch untuk mendapatkan semua data terbaru setelah check-in
      await refetchGameData();

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
  }, [refetchGameData]);

  const purchaseShopItem = useCallback(
    async (itemId: string) => {
      try {
        await api.post("/shop/purchase", { itemId });
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "success",
          title: "Artifact Acquired!",
          message: "Item has been added to your collection.",
          icon: FaGift,
        });
      } catch (error: any) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Purchase Failed",
          message:
            error.response?.data?.message ||
            "Transaction could not be completed.",
        });
      }
    },
    [refetchGameData]
  );

  const updatePlayerProfile = useCallback(
    async (newName: string, newAvatarUrl: string) => {
      try {
        await api.put("/users/profile", {
          name: newName,
          avatarUrl: newAvatarUrl,
        });
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "success",
          title: "Profile Updated",
          message: "Your commander profile has been successfully updated.",
          icon: FaUserAstronaut,
        });
      } catch (error: any) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Update Failed",
          message: error.response?.data?.message || "Could not update profile.",
        });
      }
    },
    [refetchGameData]
  );

  const applyTheme = useCallback(
    async (themeValue: string) => {
      try {
        await api.put("/users/profile/apply-theme", { themeValue });
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "success",
          title: "Ship Interface Updated",
          message: `Visual theme changed.`,
          icon: FaPalette,
        });
      } catch (error: any) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Failed to Apply Theme",
          message: error.response?.data?.message || "Could not apply theme.",
        });
      }
    },
    [refetchGameData]
  );

  const applyAvatarFrame = useCallback(
    async (frameValue: string | null) => {
      try {
        await api.put("/users/profile/apply-frame", { frameValue });
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "success",
          title: "Avatar Frame Updated",
          message: "Commander avatar frame has been set.",
          icon: FaStar,
        });
      } catch (error: any) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Failed to Apply Frame",
          message: error.response?.data?.message || "Could not apply frame.",
        });
      }
    },
    [refetchGameData]
  );

  const resetGameData = useCallback(async () => {
    try {
      await api.post("/users/profile/reset");
      await refetchGameData();
      window.showGlobalNotification?.({
        type: "warning",
        title: "Game Reset!",
        message: "All progress has been reset.",
        icon: FaRedo,
      });
    } catch (error: any) {
      window.showGlobalNotification?.({
        type: "error",
        title: "Reset Failed",
        message: "Could not reset data.",
      });
    }
  }, [refetchGameData]);

  const claimMissionReward = useCallback(
    async (missionId: string) => {
      try {
        await api.post(`/missions/${missionId}/claim`);
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "success",
          title: "Reward Claimed!",
          message: "Mission reward has been successfully claimed.",
          icon: FaTrophy,
        });
      } catch (error: any) {
        window.showGlobalNotification?.({
          type: "error",
          title: "Claim Failed",
          message: error.response?.data?.message || "Could not claim reward.",
        });
      }
    },
    [refetchGameData]
  );

  const claimDailyDiscovery = useCallback(async () => {
    try {
      await api.post("/daily/claim-discovery");
      await refetchGameData();
      window.showGlobalNotification?.({
        type: "success",
        title: "Supply Drop Acquired!",
        message: "You found new resources!",
        icon: FaGift,
      });
    } catch (error: any) {
      window.showGlobalNotification?.({
        type: "error",
        title: "Claim Failed",
        message:
          error.response?.data?.message || "Supply drop already claimed.",
      });
    }
  }, [refetchGameData]);

  const claimProjectTaskReward = useCallback(
    async (taskId: string) => {
      try {
        await api.post(`/tasks/${taskId}/claim-reward`);
        await refetchGameData();
        window.showGlobalNotification?.({
          type: "success",
          title: "Reward Claimed!",
          message: "Project task reward has been successfully claimed.",
          icon: FaTrophy,
        });
      } catch (error: any) {
        console.error(`Gagal klaim hadiah tugas proyek ${taskId}:`, error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Claim Failed",
          message: error.response?.data?.message || "Could not claim reward.",
        });
      }
    },
    [refetchGameData]
  );

  const applyAvatar = useCallback(
    async (avatarUrl: string) => {
      const currentName = user?.name || "";

      try {
        await api.put("/users/profile", {
          name: currentName,
          avatarUrl: avatarUrl,
        });

        // Panggil refetch untuk mendapatkan avatarUrl terbaru
        await refetchGameData();

        window.showGlobalNotification?.({
          type: "success",
          title: "Avatar Updated",
          message: "Your commander avatar has been changed.",
        });
      } catch (error) {
        console.error("Gagal menerapkan avatar:", error);
      }
    },
    [user, refetchGameData]
  );
  return {
    playerData,
    isLoadingData: isGameDataLoading, // Kirimkan status loading dari context
    SHOP_ITEMS_CONFIG: shopItems,
    ALL_BADGES_CONFIG: allBadges,
    // Semua fungsi aksi yang sudah di-refactor:
    addTask,
    editTask,
    completeTask,
    claimProjectTaskReward,
    purchaseShopItem,
    updatePlayerProfile,
    applyTheme,
    applyAvatarFrame,
    claimMissionReward,
    claimDailyDiscovery,
    resetGameData,
    applyAvatar,
    // getXpBoundaries dan handleDailyLogin juga sudah kita perbaiki
    getXpBoundaries,
    handleDailyLogin,
  };
};
