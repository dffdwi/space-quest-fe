// src/app/profile/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecting to login...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Profil Pengguna
      </h1>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">ID Pengguna</p>
          <p className="text-lg text-gray-700">{user.id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg text-gray-700">{user.email}</p>
        </div>
        {user.name && (
          <div>
            <p className="text-sm text-gray-500">Nama</p>
            <p className="text-lg text-gray-700">{user.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
