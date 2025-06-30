"use client";

import React from "react";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { IconType } from "react-icons";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  icon?: IconType;
  iconColor?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  icon: Icon,
  iconColor,
}) => {
  if (!isOpen) return null;

  const IconComponent = Icon || FaCheckCircle;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md border-gray-700 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <FaTimes className="text-2xl" />
        </button>

        <div className="mb-4">
          <IconComponent
            className={`mx-auto text-5xl md:text-6xl ${
              iconColor || "text-green-400"
            }`}
          />
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

        <div className="text-gray-300 space-y-2">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="btn btn-primary w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
