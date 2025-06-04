"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/SideBar";
import AppHeader from "@/components/AppHeader";
import GlobalNotification, {
  NotificationMessage,
} from "@/components/GlobalNotification";
import { useState, useEffect } from "react";
import { useGameData } from "@/hooks/useGameData";

const inter = Inter({ subsets: ["latin"] });

interface NotificationEventDetail {
  detail: Omit<NotificationMessage, "id">;
}

declare global {
  interface Window {
    showGlobalNotification: (detail: Omit<NotificationMessage, "id">) => void;
  }
}

function AppBody({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { playerData } = useGameData(user); // Ambil playerData

  // Tentukan tema berdasarkan playerData atau default
  const activeTheme = playerData?.activeTheme || "theme-dark"; // Default jika playerData belum ada

  useEffect(() => {
    document.body.className = ""; // Hapus semua class tema sebelumnya
    document.body.classList.add(inter.className, activeTheme);
    // Tambahkan class dasar lainnya jika perlu, mis. text-gray-100 untuk tema gelap default
    if (activeTheme.includes("dark")) {
      document.body.classList.add("bg-gray-900", "text-gray-100");
    } else {
      document.body.classList.add("bg-gray-100", "text-gray-800"); // Contoh untuk tema terang
    }
  }, [activeTheme]);

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
    /* ... (setup showGlobalNotification sama) ... */
  }, []);
  const handleDismissNotification = () => {
    /* ... (sama) ... */
  };

  useEffect(() => {
    document.title = "SpaceQuest";
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Embark on epic productivity missions!"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      {/* Body class akan diatur oleh AppBody */}
      <body>
        <AuthProvider>
          <AppBody>
            {" "}
            {/* Bungkus dengan AppBody untuk akses context tema */}
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
