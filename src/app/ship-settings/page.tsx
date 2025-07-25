"use client";

import InfoModal from "@/components/InfoModal";
import { useAuth } from "@/contexts/AuthContext";
import { ShopItem, useGameData } from "@/hooks/useGameData";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent, useMemo } from "react";
import {
  FaCog,
  FaSave,
  FaUserEdit,
  FaPalette,
  FaStar,
  FaRedo,
  FaRocket,
  FaShieldAlt,
  FaTicketAlt,
  FaTrophy,
} from "react-icons/fa";

export default function ShipSettingsPage() {
  const {
    user,
    isLoading: authLoading,
    playerData,
    isGameDataLoading: isLoadingData,
  } = useAuth();
  const {
    updatePlayerProfile,
    applyTheme,
    applyAvatarFrame,
    resetGameData,
    SHOP_ITEMS_CONFIG,
    applyAvatar,
  } = useGameData();
  const router = useRouter();

  const [commanderName, setCommanderName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedFrame, setSelectedFrame] = useState<string | null>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{
    title: string;
    message: React.ReactNode;
  }>({ title: "", message: "" });

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

  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      window.showGlobalNotification?.({
        type: "error",
        title: "Error",
        message: "New password and confirmation do not match.",
      });
      return;
    }
    try {
      await api.put("/users/profile/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      window.showGlobalNotification?.({
        type: "success",
        title: "Success",
        message: "Password changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      window.showGlobalNotification?.({
        type: "error",
        title: "Password Change Failed",
        message: error.response?.data?.message || "An error occurred.",
      });
    }
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

  const ownedVouchers = useMemo(() => {
    if (!playerData) return [];
    return SHOP_ITEMS_CONFIG.filter(
      (item) =>
        item.type === "voucher" &&
        playerData.purchasedShopItemIds.includes(item.itemId)
    );
  }, [playerData, SHOP_ITEMS_CONFIG]);

  const handleClaimVoucherClick = (voucherName: string) => {
    setInfoModalContent({
      title: "Congratulation!",
      message: (
        <>
          <p className="mb-2">
            You own the <strong>{voucherName}</strong>!
          </p>
          <p className="text-sm text-gray-400">
            To complete the redemption, please contact the SpaceQuest
            administration.
          </p>
        </>
      ),
    });
    setIsInfoModalOpen(true);
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
    (item: ShopItem) => item.type === "theme"
  );
  const availableFrames = SHOP_ITEMS_CONFIG.filter(
    (item: ShopItem) => item.type === "avatar_frame"
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
            {/* <div>
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
            </div> */}
            <button type="submit" className="btn btn-primary flex items-center">
              <FaSave className="mr-2" /> Update Profile
            </button>
          </form>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4 border-b border-gray-700 pb-2">
            <FaShieldAlt className="inline mr-2" />
            Security & Password
          </h2>
          <form
            onSubmit={handleChangePasswordSubmit}
            className="space-y-5 max-w-md"
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field mt-1 block w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field mt-1 block w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field mt-1 block w-full"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary flex items-center">
              <FaSave className="mr-2" /> Change Password
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-indigo-300 mb-4 border-b border-gray-700 pb-2">
            Commander Avatar Collection
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {/* Tampilkan Avatar Default */}
            <div
              onClick={() => applyAvatar("/images/char-1.svg")}
              className={`p-2 rounded-lg cursor-pointer border-2 ${
                playerData.avatarUrl === "/images/char-1.svg"
                  ? "border-green-500 ring-2 ring-green-500/50"
                  : "border-gray-600 hover:border-indigo-500"
              }`}
            >
              <img
                src="/images/char-1.svg"
                alt="Avatar: The Default"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Tampilkan Avatar yang Sudah Dibeli */}
            {SHOP_ITEMS_CONFIG.filter(
              (item: ShopItem) =>
                item.type === "cosmetic" &&
                playerData.purchasedShopItemIds.includes(item.itemId)
            ).map((item: ShopItem) => (
              <div
                key={item.itemId}
                onClick={() => applyAvatar(item.value)}
                className={`p-2 rounded-lg cursor-pointer border-2 ${
                  playerData.avatarUrl === item.value
                    ? "border-green-500 ring-2 ring-green-500/50"
                    : "border-gray-600 hover:border-indigo-500"
                }`}
              >
                <img
                  src={item.value}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
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
                {availableThemes.map((theme: ShopItem) => (
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
                {availableFrames.map((frame: ShopItem) => (
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-green-400 mb-4 border-b border-gray-700 pb-2">
            <FaTicketAlt className="inline mr-2" />
            My Vouchers
          </h2>
          {ownedVouchers.length > 0 ? (
            <div className="space-y-3">
              {ownedVouchers.map((voucher) => (
                <div
                  key={voucher.itemId}
                  className="p-4 bg-gray-700 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-lg text-white">
                      {voucher.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {voucher.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClaimVoucherClick(voucher.name)}
                    className="btn btn-success"
                  >
                    Claim
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              You do not own any vouchers.
            </p>
          )}
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
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoModalContent.title}
        message={infoModalContent.message}
        icon={FaTrophy}
        iconColor="text-amber-400"
      />
    </div>
  );
}
