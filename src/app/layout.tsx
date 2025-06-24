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
import VideoBackground from "@/components/VideoBackground";

const inter = Inter({ subsets: ["latin"] });

declare global {
  interface Window {
    showGlobalNotification: (detail: Omit<NotificationMessage, "id">) => void;
  }
}

interface AppBodyProps {
  children: ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

function AppBody({ children, isSidebarOpen, setIsSidebarOpen }: AppBodyProps) {
  const { user } = useAuth();
  const { playerData, isLoadingData: isGameDataLoading } = useGameData(user);
  const pathname = usePathname();

  useEffect(() => {
    if (!isGameDataLoading && playerData) {
      const themeToApply = "theme-dark";
      const body = document.body;

      body.className = body.className.replace(/theme-\S+/g, "");

      body.classList.add(themeToApply);
    }
  }, [playerData, isGameDataLoading]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const activeTheme =
    hasMounted && playerData ? playerData.activeTheme : "theme-dark";

  return (
    <div key={activeTheme} className={activeTheme}>
      {!isAuthPage && playerData && (
        <VideoBackground activeTheme={playerData.activeTheme} />
      )}

      {isAuthPage ? (
        children
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <main className="flex-1 overflow-y-auto no-scrollbar bg-transparent">
            {" "}
            {/* Buat main transparan */}
            <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="p-6 md:p-8">{children}</div>
          </main>
        </div>
      )}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className={`${inter.className}`}>
        <AuthProvider>
          <AppBody
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          >
            {children}
          </AppBody>
          <GlobalNotification
            notification={notification}
            onDismiss={handleDismissNotification}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
