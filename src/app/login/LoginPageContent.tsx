"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { FaRocket } from "react-icons/fa";

export default function LoginPageContent() {
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
      setNotification("Registration successful! Please log in.");
    }
    if (searchParams.get("session_expired") === "true") {
      setError("Your session has expired. Please log in again.");
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
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setIsLoading(false);
      const apiError =
        err.response?.data?.message || "Login failed. Check your credentials.";
      setError(Array.isArray(apiError) ? apiError.join(", ") : apiError);
    }
  };

  if (authUser) {
    return (
      <div className="auth-container">
        <p className="text-white">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <FaRocket className="mx-auto text-5xl text-indigo-400 mb-2" />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            SpaceQuest
          </h1>
          <p className="text-gray-400">Log in to continue your journey.</p>
        </div>

        <div className="auth-card">
          {notification && (
            <p className="text-green-400 text-sm bg-green-900/50 p-3 rounded-md mb-4 text-center">
              {notification}
            </p>
          )}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md mb-4 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="commander@ship.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
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
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading} className="auth-btn">
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            No flight clearance?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
