"use client";

import { Inter } from "next/font/google"; // Pastikan 'Inter' diimpor dengan benar
import "./globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useGameData, PlayerData } from "@/hooks/useGameData"; // Impor PlayerData jika belum
import Sidebar from "@/components/SideBar";
import AppHeader from "@/components/AppHeader";
import GlobalNotification, {
  NotificationMessage,
} from "@/components/GlobalNotification";
import { useState, useEffect, ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

declare global {
  interface Window {
    showGlobalNotification: (detail: Omit<NotificationMessage, "id">) => void;
  }
}

interface AppBodyProps {
  children: ReactNode;
}

function AppBody({ children }: AppBodyProps) {
  const { user } = useAuth();
  const { playerData, isLoadingData: isGameDataLoading } = useGameData(user);

  useEffect(() => {
    // Apply dynamic theme only after client-side data is loaded and available
    if (!isGameDataLoading && playerData) {
      const themeToApply = playerData.activeTheme || "theme-dark"; // Default theme
      const body = document.body;

      // Remove previous theme-related classes carefully, preserving font class
      const currentClasses = Array.from(body.classList);
      const themeClassesToRemove: string[] = [];

      currentClasses.forEach((cls) => {
        if (
          cls.startsWith("theme-") ||
          cls === "bg-gray-900" ||
          cls === "text-gray-100" ||
          cls === "bg-gray-100" ||
          cls === "text-gray-800"
        ) {
          if (cls !== inter.className) {
            // Ensure font class is not removed
            themeClassesToRemove.push(cls);
          }
        }
      });

      if (themeClassesToRemove.length > 0) {
        body.classList.remove(...themeClassesToRemove);
      }

      // Add new theme and its base styling classes
      body.classList.add(themeToApply);
      // Apply base background and text colors based on the new theme
      // This assumes 'theme-dark' and 'theme-default' are dark, others are light. Adjust as needed.
      if (themeToApply.includes("dark") || themeToApply === "theme-default") {
        body.classList.add("bg-gray-900", "text-gray-100");
      } else {
        body.classList.add("bg-gray-100", "text-gray-800");
      }
    }
  }, [playerData, isGameDataLoading]); // Dependencies for the effect

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [notification, setNotification] = useState<NotificationMessage | null>(
    null
  );

  useEffect(() => {
    window.showGlobalNotification = (
      detail: Omit<NotificationMessage, "id">
    ) => {
      setNotification({ ...detail, id: `notif-${Date.now()}` });
    };
    // No cleanup needed for window.showGlobalNotification as RootLayout persists
  }, []);

  const handleDismissNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    // Set a default title if needed, dynamic titles per page are better handled by Next.js metadata API
    document.title = "SpaceQuest";
  }, []);

  return (
    <html lang="en">
      {/* Ensure no extraneous whitespace within the <head> tag or between its children */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SpaceQuest</title>
        <meta
          name="description"
          content="Embark on epic productivity missions!"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      {/* Initial body classes for server render and first client paint, matching a default theme */}
      <body
        className={`${inter.className} theme-dark bg-gray-900 text-gray-100`}
      >
        <AuthProvider>
          <AppBody>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto no-scrollbar">
                <AppHeader />
                <div className="p-6 md:p-8">{children}</div>
              </main>
            </div>
            <GlobalNotification
              notification={notification}
              onDismiss={handleDismissNotification}
            />
          </AppBody>
        </AuthProvider>
      </body>
    </html>
  );
}
