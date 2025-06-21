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
  FaTrophy,
  FaUser,
  FaUsersCog,
} from "react-icons/fa";
import { useGameData, PlayerTask, XP_PER_LEVEL } from "@/hooks/useGameData";
import AddTaskModal from "@/components/AddTaskModal";
import StatsChart from "@/components/StatsChart";
import Link from "next/link";
import IconFactory from "@/components/IconFactory";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    playerData,
    isLoadingData,
    completeTask,
    addTask,
    editTask,
    claimMissionReward,
    ALL_BADGES_CONFIG,
    claimDailyDiscovery,
  } = useGameData(user);
  const router = useRouter();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleTaskSave = (
    taskData: Omit<PlayerTask, "taskId" | "completed" | "completedAt">,
    id?: string
  ) => {
    if (!id) {
      addTask({
        ...taskData,
        projectId: null,
        assignedTo: null,
      });
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

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const allTasksToday = playerData.tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const taskDueDate = new Date(t.dueDate);
    return taskDueDate >= startOfDay && taskDueDate < endOfDay;
  });

  const personalTasksToday = allTasksToday
    .filter((t) => t.type === "personal")
    .slice(0, 3);
  const projectTasksToday = allTasksToday
    .filter((t) => t.type === "project")
    .slice(0, 3);

  const latestBadge =
    playerData.earnedBadgeIds.length > 0
      ? ALL_BADGES_CONFIG.find(
          (b) =>
            b.badgeId ===
            playerData.earnedBadgeIds[playerData.earnedBadgeIds.length - 1]
        )
      : null;

  return (
    <div className="space-y-6">
      <section className="card p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">
            <FaRocket className="inline-block mr-3 text-purple-400" />
            Today's Flight Plan
          </h2>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn btn-primary text-xs sm:text-sm flex items-center"
          >
            <FaPlus className="mr-1 sm:mr-2" /> Add Personal Log
          </button>
        </div>

        {/* Bagian Personal */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center">
            <FaUser className="mr-2" />
            Personal
          </h3>
          <div className="space-y-3">
            {personalTasksToday.length > 0 ? (
              personalTasksToday.map((task) => (
                <div
                  key={task.taskId}
                  className="task-item-bg flex items-center justify-between p-3.5 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => completeTask(task.taskId)}
                      className="form-checkbox h-5 w-5 text-purple-400 rounded focus:ring-purple-500 mr-3 cursor-pointer bg-gray-800 border-gray-600"
                    />
                    <span className="font-medium text-gray-200">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple-300 bg-purple-600/30 px-2 py-1 rounded-full">
                    +{task.xp} XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic px-2">
                No personal logs due today.
              </p>
            )}
          </div>
        </div>

        {/* Bagian Crew/Project */}
        <div>
          <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
            <FaUsersCog className="mr-2" />
            Crew Expeditions
          </h3>
          <div className="space-y-3">
            {projectTasksToday.length > 0 ? (
              projectTasksToday.map((task) => (
                <Link
                  href={`/crew-projects`}
                  key={task.taskId}
                  className="task-item-bg flex items-center justify-between p-3.5 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center">
                    <FaUsersCog className="h-5 w-5 text-green-400 mr-3" />
                    <span className="font-medium text-gray-200">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-green-300 bg-green-600/30 px-2 py-1 rounded-full">
                    +{task.xp} XP
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic px-2">
                No expedition objectives due today.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          <FaBookOpen className="inline-block mr-3 text-indigo-400" /> Active &
          Completed Constellations (Quests)
        </h2>
        <div className="space-y-4">
          {playerData.missions.length > 0 ? (
            playerData.missions.map((mission) => {
              const isCompleted = mission.currentProgress >= mission.target;
              const isClaimed = mission.isClaimed || false;

              return (
                <div
                  key={mission.missionId}
                  className={`p-4 rounded-lg shadow-sm transition-opacity ${
                    isClaimed
                      ? "bg-gray-700/50 opacity-60"
                      : "bg-gradient-to-br from-gray-700 via-gray-800 to-indigo-900 border border-indigo-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3
                        className={`font-semibold text-lg ${
                          isClaimed ? "text-gray-400" : "text-indigo-300"
                        }`}
                      >
                        {mission.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 mb-3 ${
                          isClaimed ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {mission.description}
                      </p>
                    </div>
                    {isClaimed && (
                      <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded-full flex items-center ml-2">
                        <FaCheckCircle className="mr-1.5" /> CLAIMED
                      </span>
                    )}
                  </div>
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
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400 font-medium">
                      {mission.currentProgress}/{mission.target} Complete
                    </span>
                    {isCompleted && !isClaimed && (
                      <button
                        onClick={() => claimMissionReward(mission.missionId)}
                        className="btn btn-warning text-xs !py-1 !px-3 animate-pulse flex items-center"
                      >
                        <FaTrophy className="mr-1.5" /> Claim Reward
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-3">
              No active constellations to track. New adventures await!
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          onClick={claimDailyDiscovery}
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
            <FaAward className="inline-block mr-2 text-amber-400" /> Recent
            Commendation
          </h2>
          {latestBadge ? (
            <div className="flex items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <IconFactory
                iconName={latestBadge.icon}
                className={`${latestBadge.color} text-3xl mr-4`}
              />
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
          <p className="text-xs text-gray-300 italic">
            The universe rewards consistent effort.
          </p>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Galactic Performance Metrics
        </h2>
        {playerData.stats ? (
          <div>
            <p className="text-sm text-gray-300 mb-1">
              Objectives Cleared (Total):{" "}
              <span className="font-bold text-indigo-400">
                {playerData.stats.tasksCompleted}
              </span>
            </p>
            <div className="mt-4 h-64 md:h-72">
              <StatsChart tasks={playerData.tasks} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Stats data not available.</p>
        )}
      </section>

      {isTaskModalOpen && (
        <AddTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleTaskSave}
          existingTask={null}
        />
      )}
    </div>
  );
}
