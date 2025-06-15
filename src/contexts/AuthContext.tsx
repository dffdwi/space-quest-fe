"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  userId: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    document.cookie =
      "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUserJson = localStorage.getItem("authUser");

      if (storedToken && storedUserJson) {
        try {
          const parsedUser: User = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error("Gagal mem-parse data user dari localStorage", error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [clearAuthData]);

  const loginUser = useCallback(
    (newToken: string, userData: User) => {
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("authUser", JSON.stringify(userData));
      document.cookie = "isLoggedIn=true; path=/; max-age=" + 60 * 60 * 24 * 7;
      setToken(newToken);
      setUser(userData);
      router.push("/");
    },
    [router]
  );

  const logoutUser = useCallback(() => {
    clearAuthData();
    if (!["/login", "/register"].includes(pathname)) {
      router.push("/login");
    }
  }, [clearAuthData, router, pathname]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login: loginUser, logout: logoutUser }}
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
