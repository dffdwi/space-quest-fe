"use client";

import AddTaskModal from "@/components/AddTaskModal";
import { useAuth } from "@/contexts/AuthContext";
import { useGameData, PlayerTask } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaPlus,
  FaCheckCircle,
  FaRegCircle,
  FaEdit,
  FaTrashAlt,
  FaRocket,
  FaCoins,
} from "react-icons/fa";

const DailyCapTracker = ({
  value,
  cap,
  label,
  icon: Icon,
  colorClass,
}: {
  value: number;
  cap: number;
  label: string;
  icon: React.ElementType;
  colorClass: string;
}) => {
  const percentage = Math.min(100, (value / cap) * 100);
  const isCapped = value >= cap;
  return (
    <div className="text-xs">
      <div className="flex justify-between items-center mb-1 font-semibold">
        <span className="text-gray-300 flex items-center">
          <Icon className="mr-1.5" />
          {label}
        </span>
        <span className={isCapped ? "text-red-400" : "text-gray-300"}>
          {value}/{cap}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-600 rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {isCapped && (
        <>
          <p className="text-red-500 text-center font-bold text-xs mt-1">
            DAILY LIMIT REACHED
          </p>
          <p className="text-gray-400 text-center text-xs mt-1">
            You can still complete your tasks, but will not receive further{" "}
            {label.includes("XP") ? "XP" : "CP"} from personal tasks today.
          </p>
        </>
      )}
    </div>
  );
};
export default function Missions() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    playerData,
    isLoadingData,
    completeTask,
    addTask,
    editTask,
    claimMissionReward,
  } = useGameData(user);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl">Loading Mission Logs...</p>
      </div>
    );
  }

  const personalTasks = playerData.tasks.filter((t) => t.type === "personal");

  const incompleteTasks = personalTasks
    .filter((t) => !t.completed)
    .sort((a, b) =>
      (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31")
    );
  const completedTasks = personalTasks
    .filter((t) => t.completed)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: PlayerTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    alert(`Simulasi hapus misi: ${taskId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No Deadline";
    try {
      return new Date(dateString).toLocaleDateString("en-CA");
    } catch {
      return "Invalid Date";
    }
  };

  const TaskItemCard = ({ task }: { task: PlayerTask }) => (
    <div
      className={`task-item-bg flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 ${
        task.completed ? "opacity-60" : ""
      } transition-all`}
    >
      <div className="flex items-center flex-grow min-w-0">
        <button
          onClick={() => completeTask(task.taskId)}
          className="mr-4 flex-shrink-0"
        >
          {task.completed ? (
            <FaCheckCircle className="text-green-400 text-2xl" />
          ) : (
            <FaRegCircle className="text-gray-500 text-2xl hover:text-green-400" />
          )}
        </button>
        <div className="min-w-0">
          <span
            className={`font-medium text-gray-100 block truncate ${
              task.completed ? "line-through" : ""
            }`}
            title={task.title}
          >
            {task.title}
          </span>
          <p className="text-xs text-gray-400">
            {task.category ? `${task.category} - ` : ""}
            Due: {formatDate(task.dueDate)} | XP: {task.xp}
            {task.completed && task.completedAt
              ? ` (Completed: ${formatDate(task.completedAt)})`
              : ""}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-2 space-x-2">
        <button
          onClick={() => openEditModal(task)}
          className="text-sky-400 hover:text-sky-300 p-1"
          title="Edit Mission"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => handleDeleteTask(task.taskId)}
          className="text-red-500 hover:text-red-400 p-1"
          title="Delete Mission"
        >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );

  console.log("All tasks from playerData:", playerData.tasks);
  console.log("Filtered personal tasks:", personalTasks);

  const dailyXpCap = 20;
  const dailyCpCap = 20;

  return (
    <div className="space-y-8">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-100">
            Personal Mission Logs
          </h2>
          <button
            onClick={openCreateModal}
            className="btn btn-primary w-full sm:w-auto flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Log Entry
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-700">
          <DailyCapTracker
            value={playerData.stats.dailyPersonalXpGained || 0}
            cap={dailyXpCap}
            label="Personal XP Gained Today"
            icon={FaRocket}
            colorClass="bg-purple-500"
          />
          <DailyCapTracker
            value={playerData.stats.dailyPersonalCpGained || 0}
            cap={dailyCpCap}
            label="Personal CP Gained Today"
            icon={FaCoins}
            colorClass="bg-amber-500"
          />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-indigo-300 mb-3 border-b border-gray-700 pb-2">
            <FaRocket className="inline mr-2 text-amber-400" /> Active Mission
            Logs
          </h3>
          <div className="space-y-3">
            {incompleteTasks.length > 0 ? (
              incompleteTasks.map((task) => (
                <TaskItemCard key={task.taskId} task={task} />
              ))
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-4">
                All systems clear. No active personal logs.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-3 border-b border-gray-700 pb-2">
            <FaCheckCircle className="inline mr-2 text-green-500" /> Archived
            Logs (Completed)
          </h3>
          <div className="space-y-3">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <TaskItemCard key={task.taskId} task={task} />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">
                No mission logs archived yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(
            taskData: Omit<PlayerTask, "taskId" | "completed" | "completedAt">,
            id?: string
          ) => {
            if (id) {
              editTask(id, taskData);
            } else {
              addTask({
                title: taskData.title,
                description: taskData.description,
                dueDate: taskData.dueDate,
                xp: 2,
                credits: 2,
                category: taskData.category,
              });
            }
            setIsModalOpen(false);
          }}
          existingTask={editingTask}
        />
      )}
    </div>
  );
}
