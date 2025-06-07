"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useGameData } from "@/hooks/useGameData";
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
    if (!isGameDataLoading && playerData) {
      const themeToApply = playerData.activeTheme || "theme-dark";
      const body = document.body;

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
            themeClassesToRemove.push(cls);
          }
        }
      });

      if (themeClassesToRemove.length > 0) {
        body.classList.remove(...themeClassesToRemove);
      }

      body.classList.add(themeToApply);
      if (themeToApply.includes("dark") || themeToApply === "theme-default") {
        body.classList.add("bg-gray-900", "text-gray-100");
      } else {
        body.classList.add("bg-gray-100", "text-gray-800");
      }
    }
  }, [playerData, isGameDataLoading]); 

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
  }, []);

  const handleDismissNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    document.title = "SpaceQuest";
  }, []);

  return (
    <html lang="en">
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
