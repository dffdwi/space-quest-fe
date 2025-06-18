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
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useEffect(() => {
    if (!isGameDataLoading && playerData) {
      const themeToApply = playerData.activeTheme || "theme-dark";
      const body = document.body;

      body.className = body.className.replace(/theme-\S+/g, "");

      body.classList.add(themeToApply);
    }
  }, [playerData, isGameDataLoading]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <AppHeader />
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
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
          <AppBody>{children}</AppBody>
          <GlobalNotification
            notification={notification}
            onDismiss={handleDismissNotification}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
