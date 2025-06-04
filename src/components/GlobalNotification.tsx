"use client";

import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaBell,
  FaRocket,
} from "react-icons/fa";

export type NotificationType =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "quest";

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  icon?: React.ElementType;
}

interface GlobalNotificationProps {
  notification: NotificationMessage | null;
  onDismiss: (id: string) => void;
}

const GlobalNotification: React.FC<GlobalNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (notification) {
      setIsVisible(true);
      const duration = notification.duration || 5000;
      timer = setTimeout(() => {
        handleDismiss();
      }, duration);
    } else {
      setIsVisible(false);
    }
    return () => clearTimeout(timer);
  }, [notification]);

  const handleDismiss = () => {
    if (notification) {
      setIsVisible(false);
      setTimeout(() => {
        onDismiss(notification.id);
      }, 300);
    }
  };

  if (!notification) return null;

  let bgColor = "bg-sky-600 border-sky-700";
  let IconComponent = notification.icon || FaInfoCircle;

  switch (notification.type) {
    case "success":
      bgColor = "bg-emerald-500 border-emerald-600";
      IconComponent = notification.icon || FaCheckCircle;
      break;
    case "error":
      bgColor = "bg-red-500 border-red-600";
      IconComponent = notification.icon || FaExclamationTriangle;
      break;
    case "warning":
      bgColor = "bg-amber-500 border-amber-600";
      IconComponent = notification.icon || FaExclamationTriangle;
      break;
    case "quest":
      bgColor = "bg-purple-500 border-purple-600";
      IconComponent = notification.icon || FaRocket;
      break;
    default: // info
      IconComponent = notification.icon || FaBell;
  }

  return (
    <div
      className={`notification fixed top-6 right-6 text-white p-4 rounded-lg shadow-xl max-w-sm w-full
                  transform transition-all duration-300 ease-in-out
                  ${
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-full"
                  }
                  ${bgColor} border-l-4`}
      role="alert"
    >
      <div className="flex items-start">
        <IconComponent className="text-2xl mr-3 mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <h4 className="font-bold text-lg">{notification.title}</h4>
          <p className="text-sm">{notification.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 text-xl opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default GlobalNotification;
