"use client";

import React from "react";
import { FaTimes, FaCrown, FaMedal } from "react-icons/fa";

interface LeaderboardEntry {
  projectXp: number;
  user: {
    userId: string;
    name: string;
    avatarUrl: string;
    level: number;
  };
}

interface ProjectLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboardData: LeaderboardEntry[];
  projectName: string;
}

const ProjectLeaderboardModal: React.FC<ProjectLeaderboardModalProps> = ({
  isOpen,
  onClose,
  leaderboardData,
  projectName,
}) => {
  if (!isOpen) return null;

  const rankIcons = [FaCrown, FaMedal, FaMedal];
  const rankColors = ["text-amber-400", "text-slate-300", "text-yellow-600"];

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <FaTimes />
        </button>
        <div className="text-center mb-4">
          <FaCrown className="mx-auto text-3xl text-amber-400 mb-2" />
          <h3 className="text-xl font-semibold text-indigo-300">
            Expedition Leaderboard
          </h3>
          <p className="text-sm text-gray-400">{projectName}</p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {leaderboardData.map((entry, index) => {
            const rank = index + 1;
            const RankIcon = rank <= 3 ? rankIcons[rank - 1] : null;
            const rankColor =
              rank <= 3 ? rankColors[rank - 1] : "text-gray-400";

            return (
              <div
                key={entry.user.userId}
                className="flex items-center p-3 bg-gray-700 rounded-md"
              >
                <span
                  className={`font-bold text-lg w-8 text-center ${rankColor}`}
                >
                  {rank}
                </span>
                {RankIcon && <RankIcon className={`ml-1 mr-2 ${rankColor}`} />}
                <img
                  src={entry.user.avatarUrl}
                  alt={entry.user.name}
                  className="w-10 h-10 rounded-full mr-3 bg-gray-600"
                />
                <div>
                  <p className="font-semibold text-white">{entry.user.name}</p>
                  <p className="text-xs text-gray-400">
                    Level {entry.user.level}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-amber-400">
                    {entry.projectXp.toLocaleString()} XP
                  </p>
                  <p className="text-xs text-gray-500">Project XP</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectLeaderboardModal;
