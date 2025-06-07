"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaPlus,
  FaRocket,
  FaLightbulb,
  FaGift,
  FaBookOpen,
  FaCheckCircle,
  FaAward,
} from "react-icons/fa";
import {
  useGameData,
  PlayerTask,
  ALL_BADGES_CONFIG,
  XP_PER_LEVEL,
} from "@/hooks/useGameData";
import AddTaskModal from "@/components/AddTaskModal";
import StatsChart from "@/components/StatsChart";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    playerData,
    isLoadingData,
    completeTask,
    addTask,
    editTask,
    updatePlayerData,
  } = useGameData(user);
  const router = useRouter();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = (
    taskData: Omit<PlayerTask, "id" | "completed" | "completedAt">,
    id?: string
  ) => {
    if (id) {
      editTask(id, taskData);
    } else {
      const { status, ...rest } = taskData;
      addTask({ ...rest, projectId: null });
    }
    setIsTaskModalOpen(false);
  };

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">
          Loading Starship Systems...
        </p>
      </div>
    );
  }

  const handleClaimDailyDiscovery = () => {
    if (!playerData.dailyDiscovery.available) {
      window.showGlobalNotification?.({
        type: "info",
        title: "Already Claimed",
        message: "Supply drop has already been claimed for today.",
      });
      return;
    }
    const rewardCredits = Math.floor(Math.random() * 20) + 10;
    const rewardXp = Math.floor(Math.random() * 25) + 15;

    updatePlayerData((prev) => {
      if (!prev) return {};
      const newCredits = prev.credits + rewardCredits;
      const newXp = prev.xp + rewardXp;
      let newLevel = prev.level;
      while (
        newLevel < XP_PER_LEVEL.length - 1 &&
        newXp >= XP_PER_LEVEL[newLevel]
      ) {
        newLevel++;
        window.showGlobalNotification?.({
          type: "quest",
          title: "Promotion!",
          message: `Your daily discovery propelled you to Level ${newLevel}!`,
        });
      }

      return {
        credits: newCredits,
        xp: newXp,
        level: newLevel,
        dailyDiscovery: {
          ...prev.dailyDiscovery,
          available: false,
          lastClaimedDate: new Date().toISOString().split("T")[0],
        },
      };
    });
    window.showGlobalNotification?.({
      type: "success",
      title: "Supply Drop Acquired!",
      message: `You found +${rewardCredits} CP and +${rewardXp} XP!`,
      icon: FaGift,
    });
  };

  const tasksToday = playerData.tasks
    .filter(
      (t) =>
        !t.completed &&
        t.dueDate === new Date().toISOString().split("T")[0] &&
        !t.projectId
    )
    .slice(0, 3);

  const getRandomSpaceTip = () => {
    const tips = [
      "A clean cockpit is a productive cockpit.",
      "Remember to check your oxygen levels (and take breaks!).",
      "Even small asteroid hauls contribute to the mission.",
      "Always have a backup plan for alien encounters.",
      "The universe rewards consistent effort.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const latestBadgeId =
    playerData.earnedBadgeIds.length > 0
      ? playerData.earnedBadgeIds[playerData.earnedBadgeIds.length - 1]
      : null;
  const latestBadge = latestBadgeId
    ? ALL_BADGES_CONFIG.find((b) => b.id === latestBadgeId)
    : null;
  const BadgeIcon = latestBadge?.icon || FaAward;

  return (
    <div className="space-y-6">
      <section className="card p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">
            🚀 Today's Flight Plan (Personal)
          </h2>
          <button
            onClick={openCreateModal}
            className="btn btn-primary text-xs sm:text-sm"
          >
            <FaPlus className="mr-1 sm:mr-2" /> Add Log Entry
          </button>
        </div>
        <div className="space-y-3">
          {tasksToday.length > 0 ? (
            tasksToday.map((task) => (
              <div
                key={task.id}
                className="task-item-bg flex items-center justify-between p-3.5 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => completeTask(task.id)}
                    className="form-checkbox h-5 w-5 text-purple-400 rounded focus:ring-purple-500 focus:ring-offset-gray-800 mr-3 cursor-pointer bg-gray-800 border-gray-600"
                  />
                  <div>
                    <span
                      className={`font-medium text-gray-200 ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <p className="text-xs text-gray-400">
                      {task.category || "General Scan"} - Due: Today
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-300 bg-purple-600/30 px-2.5 py-1 rounded-full">
                  +{task.xp} XP
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-3">
              No urgent personal missions. Systems stable, Commander.
            </p>
          )}
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          🌌 Active Constellations (Quests)
        </h2>
        <div className="space-y-4">
          {playerData.missions.filter(
            (m) => !m.isClaimed && m.currentProgress < m.target
          ).length > 0 ? (
            playerData.missions
              .filter((m) => !m.isClaimed && m.currentProgress < m.target)
              .map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-gray-700 via-gray-800 to-indigo-900 border border-indigo-700 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <FaBookOpen className="text-indigo-400 mr-3 text-xl" />
                    <h3 className="font-semibold text-indigo-300 text-lg">
                      {mission.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    {mission.description}
                  </p>
                  <div className="w-full h-2.5 bg-gray-600 rounded-full mb-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (mission.currentProgress / mission.target) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">
                      {mission.currentProgress}/{mission.target} Complete
                    </span>
                    {mission.currentProgress >= mission.target && (
                      <span className="text-xs text-green-400 font-bold flex items-center">
                        <FaCheckCircle className="mr-1" />
                        Ready to Claim!
                      </span>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-3">
              No active constellations to track. All objectives met or new
              adventures await!
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          onClick={handleClaimDailyDiscovery}
          className={`daily-discovery card p-4 text-center ${
            !playerData.dailyDiscovery.available ? "claimed" : "hover:shadow-lg"
          }`}
        >
          <FaGift
            className={`text-5xl mb-2 ${
              playerData.dailyDiscovery.available
                ? "text-purple-400 animate-bounce"
                : "text-gray-600"
            }`}
          />
          <p
            className={`font-semibold text-sm ${
              !playerData.dailyDiscovery.available
                ? "text-gray-500"
                : "text-purple-300"
            }`}
          >
            {playerData.dailyDiscovery.available
              ? "Claim Daily Supply Drop!"
              : "Supply Drop Claimed"}
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">
            ✨ Recent Commendation
          </h2>
          {latestBadge ? (
            <div className="flex items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <BadgeIcon className={`${latestBadge.color} text-3xl mr-4`} />
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  {latestBadge.name}
                </p>
                <p className="text-xs text-gray-400">
                  {latestBadge.description}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No new commendations logged.
            </p>
          )}
        </div>

        <div className="card p-4 bg-gray-800 border border-gray-700">
          <h3 className="font-semibold text-indigo-400 mb-1 text-sm">
            <FaLightbulb className="inline mr-2" />
            Captain's Log Entry:
          </h3>
          <p className="text-xs text-gray-300 italic">{getRandomSpaceTip()}</p>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          📊 Galactic Performance Metrics
        </h2>
        <div>
          <p className="text-sm text-gray-300 mb-1">
            Objectives Cleared (Total):{" "}
            <span className="font-bold text-indigo-400">
              {playerData.stats.tasksCompleted}
            </span>
          </p>
          <p className="text-sm text-gray-300 mb-1">
            Current Mission Streak:{" "}
            <span className="font-bold text-red-400">
              {playerData.stats.currentMissionStreak} Cycles
            </span>{" "}
            {playerData.stats.currentMissionStreak > 0 ? "🔥" : ""}
          </p>
          <p className="text-sm text-gray-300 mb-1">
            Longest Mission Streak:{" "}
            <span className="font-bold text-red-400">
              {playerData.stats.longestMissionStreak} Cycles
            </span>
          </p>

          <div className="mt-4 h-64 md:h-72">
            <StatsChart tasks={playerData.tasks} />
          </div>
        </div>
      </section>

      {isTaskModalOpen && (
        <AddTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleTaskSave}
          existingTask={editingTask}
          projectId={null}
        />
      )}
    </div>
  );
}
