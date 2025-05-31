// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Auth App",
  // ...
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <Navbar /> {/* Tambahkan Navbar di sini */}
          <main className="container mx-auto p-4 pt-6 md:p-6 md:pt-8">
            {children}
          </main>
          {/* Footer bisa ditambahkan di sini jika perlu */}
        </AuthProvider>
      </body>
    </html>
  );
}
