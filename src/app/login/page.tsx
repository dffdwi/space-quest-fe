"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin, user: authUser } = useAuth();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setNotification("Registrasi berhasil! Silakan login.");
    }
    if (searchParams.get("session_expired") === "true") {
      setError("Sesi Anda telah berakhir. Silakan login kembali.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (authUser) {
      router.push("/");
    }
  }, [authUser, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      if (accessToken && user) {
        authLogin(accessToken, user);
      } else {
        throw new Error("Respons tidak valid dari server");
      }
    } catch (err: any) {
      setIsLoading(false);
      const apiError =
        err.response?.data?.message || "Login gagal. Periksa kredensial Anda.";
      setError(Array.isArray(apiError) ? apiError.join(", ") : apiError);
      console.error("Error login:", err);
    }
  };

  if (authUser) {
    return <div className="text-center p-10">Mengarahkan...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Login
        </h1>

        {notification && (
          <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md mb-4 text-center">
            {notification}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
