"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGameData } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import {
  FaCog,
  FaSave,
  FaUserEdit,
  FaPalette,
  FaStar,
  FaRedo,
  FaRocket,
} from "react-icons/fa";

export default function ShipSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    playerData,
    isLoadingData,
    updatePlayerProfile,
    applyTheme,
    applyAvatarFrame,
    resetGameData,
    SHOP_ITEMS_CONFIG,
  } = useGameData(user);
  const router = useRouter();

  const [commanderName, setCommanderName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedFrame, setSelectedFrame] = useState<string | null>("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (playerData) {
      setCommanderName(playerData.name || "");
      setAvatarUrl(playerData.avatarUrl || "");
      setSelectedTheme(playerData.activeTheme || "theme-dark");
      setSelectedFrame(playerData.avatarFrameId || null);
    }
  }, [authLoading, user, router, playerData]);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    updatePlayerProfile(commanderName, avatarUrl);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeValue = e.target.value;
    setSelectedTheme(themeValue);
    applyTheme(themeValue);
  };

  const handleFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const frameValue = e.target.value === "null" ? null : e.target.value;
    setSelectedFrame(frameValue);
    applyAvatarFrame(frameValue);
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "WARNING: This will erase all your game progress. This action cannot be undone. Are you sure?"
      )
    ) {
      resetGameData();
    }
  };

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">
          Loading Ship Systems Control...
        </p>
      </div>
    );
  }

  const availableThemes = SHOP_ITEMS_CONFIG.filter(
    (item) => item.type === "theme"
  );
  const availableFrames = SHOP_ITEMS_CONFIG.filter(
    (item) => item.type === "avatar_frame"
  );

  return (
    <div className="space-y-8">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center mb-8">
          <FaCog className="text-3xl text-sky-400 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            Ship Systems & Commander Profile
          </h1>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4 border-b border-gray-700 pb-2">
            <FaUserEdit className="inline mr-2" />
            Commander Identity
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="commanderName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Commander Name
              </label>
              <input
                type="text"
                id="commanderName"
                value={commanderName}
                onChange={(e) => setCommanderName(e.target.value)}
                className="input-field mt-1 block w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="avatarUrl"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Avatar URL (Comms Image)
              </label>
              <input
                type="url"
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="input-field mt-1 block w-full"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary flex items-center">
              <FaSave className="mr-2" /> Update Profile
            </button>
          </form>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4 border-b border-gray-700 pb-2">
            <FaPalette className="inline mr-2" />
            Ship Visuals
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="shipTheme"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Active Theme
              </label>
              <select
                id="shipTheme"
                value={selectedTheme}
                onChange={handleThemeChange}
                className="input-field mt-1 block w-full sm:w-auto"
              >
                <option value="theme-dark">Default Dark (Starlight)</option>
                {availableThemes.map((theme) => (
                  <option
                    key={theme.itemId}
                    value={theme.value}
                    disabled={
                      theme.value !== "theme-dark" &&
                      !playerData.purchasedShopItemIds.includes(theme.itemId)
                    }
                  >
                    {theme.name}{" "}
                    {theme.value !== "theme-dark" &&
                    !playerData.purchasedShopItemIds.includes(theme.itemId)
                      ? "(Locked)"
                      : "(Owned)"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="avatarFrame"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Avatar Frame
              </label>
              <select
                id="avatarFrame"
                value={selectedFrame || "null"}
                onChange={handleFrameChange}
                className="input-field mt-1 block w-full sm:w-auto"
              >
                <option value="null">No Frame (Standard Issue)</option>
                {availableFrames.map((frame) => (
                  <option
                    key={frame.itemId}
                    value={frame.value}
                    disabled={
                      !playerData.purchasedShopItemIds.includes(frame.itemId)
                    }
                  >
                    {frame.name}{" "}
                    {!playerData.purchasedShopItemIds.includes(frame.itemId)
                      ? "(Locked)"
                      : "(Owned)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-red-500 mb-4 border-b border-gray-700 pb-2">
            🚨 Danger Zone 🚨
          </h2>
          <p className="text-sm text-gray-400 mb-3">
            Warning: This action will erase all your game progress.
          </p>
          <button
            onClick={handleResetProgress}
            className="btn btn-danger flex items-center"
          >
            <FaRedo className="mr-2" /> Reset All Mission Data
          </button>
        </section>
      </div>
    </div>
  );
}
