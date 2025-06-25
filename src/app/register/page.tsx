"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      router.push("/");
    }
  }, [authUser, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      router.push("/login?registered=true");
    } catch (err: any) {
      setIsLoading(false);
      const apiError =
        err.response?.data?.message || "Registration failed. Please try again.";
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
          <FaUserPlus className="mx-auto text-5xl text-indigo-400 mb-2" />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Join the Quest
          </h1>
          <p className="text-gray-400">
            Create your commander profile to begin.
          </p>
        </div>

        <div className="auth-card">
          {error && (
            <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md mb-4 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2 required"
                htmlFor="name"
              >
                Commander Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="e.g., Commander Alex"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2 required"
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
                placeholder="your-email@domain.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2 required"
                htmlFor="password"
              >
                Password (min. 8 characters)
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
              {isLoading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
