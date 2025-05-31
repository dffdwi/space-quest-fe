// src/app/page.tsx
"use client"; // Perlu client component untuk menggunakan useAuth

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Gunakan dari next/navigation

export default function HomePage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  // Middleware akan menangani proteksi utama.
  // useEffect di sini bisa sebagai fallback atau untuk menampilkan pesan loading yang lebih spesifik.
  useEffect(() => {
    if (!isLoading && !user) {
      // Seharusnya ini sudah ditangani middleware, tapi sebagai pengaman tambahan
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="text-center p-10 text-xl">Memuat data pengguna...</div>
    );
  }

  if (!user) {
    // Konten ini akan ditampilkan singkat jika middleware belum sempat redirect
    return (
      <div className="text-center p-10 text-xl">
        Mengarahkan ke halaman login...
      </div>
    );
  }

  return (
    <div className="text-center py-10 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Selamat Datang, {user.name || user.email}!
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Anda berhasil login ke aplikasi.
      </p>
      <div className="bg-gray-100 p-4 rounded-md inline-block">
        <p className="text-sm text-gray-700">Detail Pengguna:</p>
        <ul className="text-left mt-2 text-sm text-gray-600">
          <li>
            <strong>ID:</strong> {user.id}
          </li>
          <li>
            <strong>Email:</strong> {user.email}
          </li>
          {user.name && (
            <li>
              <strong>Nama:</strong> {user.name}
            </li>
          )}
        </ul>
      </div>
      {token && (
        <p className="text-xs text-gray-400 mt-8">
          Token (20 karakter pertama): {token.substring(0, 20)}...
        </p>
      )}
    </div>
  );
}
