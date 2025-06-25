"use client";

import IconFactory from "@/components/IconFactory";
import { useAuth } from "@/contexts/AuthContext";
import { useGameData, ShopItem, PlayerActivePowerUp } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { JSX, useEffect } from "react";
import { FaStore, FaCoins, FaCheck, FaRocket, FaGift } from "react-icons/fa";

export default function StarMarketPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    playerData,
    isLoadingData,
    purchaseShopItem,
    SHOP_ITEMS_CONFIG,
    applyAvatar,
  } = useGameData();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">
          Accessing Galactic Star Market...
        </p>
      </div>
    );
  }

  const purchasedIds = new Set(playerData.purchasedShopItemIds);
  const activeThemeId = SHOP_ITEMS_CONFIG.find(
    (item: ShopItem) => item.type === "theme" && item.value === playerData.activeTheme
  )?.itemId;
  const activeFrameId = SHOP_ITEMS_CONFIG.find(
    (item: ShopItem) =>
      item.type === "avatar_frame" && item.value === playerData.avatarFrameId
  )?.itemId;

  const handlePurchase = (item: ShopItem) => {
    if (item.type === "cosmetic" && purchasedIds.has(item.itemId)) {
      applyAvatar(item.value);
    } else {
      purchaseShopItem(item.itemId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center mb-6">
          <FaStore className="text-3xl text-purple-400 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            Star Market
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-2">
          Exchange your hard-earned Cosmic Points (CP) for exclusive themes,
          avatar frames, and powerful temporary boosts!
        </p>
        <p className="text-md font-semibold text-amber-400 mb-8">
          Your Balance: <FaCoins className="inline mb-px mr-1" />
          {playerData.credits} CP
        </p>

        {SHOP_ITEMS_CONFIG.length > 0 ? (
          (
            [
              "Avatars",
              "Ship Customization",
              "Commander Gear",
              "Consumables",
            ] as const
          ).map((category) => {
            const itemsInCategory = SHOP_ITEMS_CONFIG.filter(
              (item: ShopItem) => item.category === category
            );
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={category} className="mb-10">
                <h2 className="text-xl font-semibold text-indigo-300 mb-5 border-b border-gray-700 pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {itemsInCategory.map((item: ShopItem) => {
                    const isPurchased =
                      item.type !== "power_up" && purchasedIds.has(item.itemId);
                    const isActive =
                      (item.type === "theme" &&
                        item.itemId === activeThemeId) ||
                      (item.type === "avatar_frame" &&
                        item.itemId === activeFrameId);
                    const isPowerUpActive =
                      item.type === "power_up" &&
                      playerData.activePowerUps?.find(
                        (p: PlayerActivePowerUp) => p.item.value === item.value
                      );
                    const canAfford = playerData.credits >= item.price;
                    const ItemIcon = item.icon || FaGift;

                    let buttonText = `${item.price} CP`;
                    let buttonDisabled = false;
                    let buttonClasses = "btn-primary hover:bg-indigo-500";
                    let actionIcon: JSX.Element | null = (
                      <FaCoins className="mr-2" />
                    );

                    if (isActive) {
                      buttonText = "Equipped";
                      buttonClasses = "btn-success cursor-default";
                      buttonDisabled = true;
                      actionIcon = <FaCheck className="mr-2" />;
                    } else if (isPurchased) {
                      if (
                        item.type === "theme" ||
                        item.type === "avatar_frame"
                      ) {
                        buttonText = "Already Owned";
                        buttonClasses =
                          "bg-gray-700 opacity-60 cursor-not-allowed";
                        buttonDisabled = true;
                        actionIcon = <FaCheck className="mr-2" />;
                      } else {
                        buttonText = "Already Owned";
                        buttonClasses =
                          "bg-gray-700 opacity-60 cursor-not-allowed";
                        buttonDisabled = true;
                        actionIcon = <FaCheck className="mr-2" />;
                      }
                    } else if (!canAfford) {
                      buttonText = `${item.price} CP || Your CP is not enough`;
                      buttonClasses =
                        "btn-danger opacity-60 cursor-not-allowed !text-xs";
                      buttonDisabled = true;
                      // actionIcon = null;
                    }
                    return (
                      <div
                        key={item.itemId}
                        className={`shop-item card flex flex-col justify-between p-4 rounded-xl shadow-lg transition-all duration-300 
                                      ${
                                        isActive
                                          ? "border-2 border-green-500 ring-2 ring-green-500/50"
                                          : isPurchased
                                          ? "border-amber-500"
                                          : "border-gray-700"
                                      }
                                      ${
                                        !canAfford && !isPurchased && !isActive
                                          ? "opacity-70"
                                          : ""
                                      }
                                      bg-gray-750 hover:shadow-indigo-500/30`}
                      >
                        <div>
                          <div className="w-full h-36 bg-gray-800 rounded-md flex items-center justify-center mb-4 overflow-hidden">
                            {item.icon && item.icon.startsWith("/") ? (
                              <img
                                src={item.icon}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <IconFactory
                                iconName={item.icon}
                                className={`text-6xl ${
                                  isActive
                                    ? "text-green-400"
                                    : isPurchased
                                    ? "text-amber-400"
                                    : "text-indigo-400"
                                }`}
                              />
                            )}
                          </div>
                          <h3
                            className="font-semibold text-lg text-gray-100 mb-1 truncate"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-400 mb-3 h-10 overflow-hidden">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={buttonDisabled}
                          className={`btn w-full mt-auto ${buttonClasses} flex items-center justify-center`}
                        >
                          {actionIcon}
                          {buttonText}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-8">
            The Star Market is currently empty. Check back later for new
            artifacts!
          </p>
        )}
      </div>
    </div>
  );
}
