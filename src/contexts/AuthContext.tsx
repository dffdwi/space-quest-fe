"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { PlayerData, ShopItem, PlayerBadge } from "@/hooks/useGameData";

export interface User {
  userId: string;
  email: string;
  name?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  playerData: PlayerData | null;
  isGameDataLoading: boolean;
  refetchGameData: () => void;
  shopItems: ShopItem[];
  allBadges: PlayerBadge[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isGameDataLoading, setGameDataLoading] = useState(true);

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [allBadges, setAllBadges] = useState<PlayerBadge[]>([]);

  const router = useRouter();

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    document.cookie =
      "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setToken(null);
    setUser(null);
    setPlayerData(null);
  }, []);

  const fetchGameData = useCallback(async () => {
    if (!localStorage.getItem("authToken")) {
      setGameDataLoading(false);
      return;
    }

    setGameDataLoading(true);
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
      setShopItems(gameConfig.shopItems || []);
      setAllBadges(gameConfig.badges || []);

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
        activePowerUps: profile.activePowerUps || [],
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
        pendingInvitationCount: profile.pendingInvitationCount || 0,
      };

      setPlayerData(combinedData);
    } catch (error) {
      console.error("Gagal mengambil data game terpusat:", error);
      if ((error as any).response?.status === 401) {
        logoutUser();
      }
    } finally {
      setGameDataLoading(false);
    }
  }, []);

  const logoutUser = useCallback(() => {
    clearAuthData();
    router.push("/login");
  }, [clearAuthData, router]);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUserJson = localStorage.getItem("authUser");
      if (storedToken && storedUserJson) {
        try {
          const parsedUser: User = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(parsedUser);
          fetchGameData();
        } catch (error) {
          console.error("Gagal mem-parse data user:", error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [fetchGameData, clearAuthData]);

  const loginUser = useCallback(
    (newToken: string, userData: User) => {
      localStorage.setItem("authToken", newToken);
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          name: userData.name,
        })
      );
      document.cookie = "isLoggedIn=true; path=/; max-age=" + 60 * 60 * 24 * 7;
      setToken(newToken);
      setUser(userData);

      fetchGameData().then(() => {
        router.push("/");
      });
    },
    [router, fetchGameData]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login: loginUser,
        logout: logoutUser,
        playerData,
        isGameDataLoading,
        refetchGameData: fetchGameData,
        shopItems,
        allBadges,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
