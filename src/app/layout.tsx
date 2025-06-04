"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Sidebar from "@/components/SideBar";
import AppHeader from "@/components/AppHeader";
import GlobalNotification, {
  NotificationMessage,
} from "@/components/GlobalNotification";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

interface NotificationEventDetail {
  detail: Omit<NotificationMessage, "id">;
}

declare global {
  interface Window {
    showGlobalNotification: (detail: Omit<NotificationMessage, "id">) => void;
  }
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

    return () => {
      // delete window.showGlobalNotification;
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
        <meta
          name="description"
          content="Embark on epic productivity missions!"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.className} bg-gray-900 text-gray-100 theme-dark`}
      >
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
