"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus, FaRocket, FaLightbulb, FaExclamationTriangle, FaGift, FaBookOpen, FaCheckCircle } from "react-icons/fa";

interface Task {
  id: string;
  title: string;
  project?: string;
  dueDate?: string;
  xp: number;
  completed: boolean;
  assignedTo?: string | null;
}
interface Mission {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  target: number;
}
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const initialGameState = {
  tasks: [
    { id: "task1", title: "Calibrate Starship Sensors", dueDate: new Date().toISOString().split('T')[0], project: "Daily Check", xp: 25, completed: false, assignedTo: "currentUser" },
    { id: "task2", title: "Chart Nebula Cluster X-17", project: "Exploration", xp: 50, completed: false, assignedTo: "currentUser" },
  ],
  missions: [
    { id: "m1", title: "First Steps in Space", description: "Complete 3 missions.", currentProgress: 1, target: 3 },
    { id: "m2", title: "Weekly Patrol", description: "Complete 7 missions this week.", currentProgress: 2, target: 7 },
  ],
  badges: [
    { id: "b1", name: "First Mission Completed!", description: "You completed your first mission.", icon: FaRocket, color: "text-green-400" }
  ],
  dailyDiscoveryAvailable: true,
  stats: {
    tasksCompletedThisWeek: 5,
    currentStreak: 3,
    longestStreak: 7,
  }
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [gameData, setGameData] = useState(initialGameState);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl">Loading Starship Systems...</p>
      </div>
    );
  }

  const handleCompleteTask = (taskId: string) => {
    setGameData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const claimDailyDiscovery = () => {
    setGameData(prev => ({ ...prev, dailyDiscoveryAvailable: false }));
    alert("Daily discovery claimed! +10 CP (Cosmic Points) - Placeholder");
  };

  const tasksToday = gameData.tasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().split('T')[0] && t.assignedTo === "currentUser").slice(0, 3);

  const getRandomSpaceTip = () => {
    const tips = [
      "A clean cockpit is a productive cockpit.",
      "Remember to check your oxygen levels (and take breaks!).",
      "Even small asteroid hauls contribute to the mission.",
      "Always have a backup plan for alien encounters.",
      "The universe rewards consistent effort."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  return (
    <div className="space-y-6">
      <section className="card p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">🚀 Today's Flight Plan (Personal)</h2>
          <button onClick={() => alert("Open Add Mission Modal")} className="btn btn-primary text-xs sm:text-sm">
            <FaPlus className="mr-1 sm:mr-2" /> Add Log Entry
          </button>
        </div>
        <div className="space-y-3">
          {tasksToday.length > 0 ? tasksToday.map(task => (
            <div key={task.id} className="task-item-bg flex items-center justify-between p-3.5 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all">
              <div className="flex items-center">
                <input type="checkbox" checked={task.completed} onChange={() => handleCompleteTask(task.id)} className="form-checkbox h-5 w-5 text-purple-400 rounded focus:ring-purple-500 focus:ring-offset-gray-800 mr-3 cursor-pointer bg-gray-800 border-gray-600" />
                <div>
                  <span className={`font-medium text-gray-200 ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                  <p className="text-xs text-gray-400">{task.project || 'General Scan'} - Due: Today</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-purple-300 bg-purple-600/30 px-2.5 py-1 rounded-full">+{task.xp} XP</span>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic text-center py-3">No urgent personal missions. Systems stable, Commander.</p>
          )}
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">🌌 Active Constellations (Quests)</h2>
        <div className="space-y-4">
          {gameData.missions.map(mission => (
            <div key={mission.id} className="bg-gradient-to-br from-gray-700 via-gray-800 to-indigo-900 border border-indigo-700 p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <FaBookOpen className="text-indigo-400 mr-3 text-xl" />
                <h3 className="font-semibold text-indigo-300 text-lg">{mission.title}</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">{mission.description}</p>
              <div className="w-full h-2.5 bg-gray-600 rounded-full mb-1 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mission.currentProgress / mission.target) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">{mission.currentProgress}/{mission.target} Complete</span>
                {mission.currentProgress >= mission.target && <span className="text-xs text-green-400 font-bold flex items-center"><FaCheckCircle className="mr-1" />QUEST COMPLETE!</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          id="dailyDiscoveryElement"
          onClick={gameData.dailyDiscoveryAvailable ? claimDailyDiscovery : undefined}
          className={`daily-discovery card p-4 text-center ${!gameData.dailyDiscoveryAvailable ? 'claimed' : 'hover:shadow-lg'}`}
        >
          <FaGift className={`text-5xl mb-2 ${gameData.dailyDiscoveryAvailable ? 'text-purple-400 animate-bounce' : 'text-gray-600'}`} />
          <p className={`font-semibold text-sm ${!gameData.dailyDiscoveryAvailable ? 'text-gray-500' : 'text-purple-300'}`}>
            {gameData.dailyDiscoveryAvailable ? "Claim Daily Supply Drop!" : "Supply Drop Claimed"}
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">✨ Recent Commendation</h2>
          {gameData.badges.length > 0 ? (
            <div className="flex items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div>
                <p className="text-sm font-semibold text-gray-200">{gameData.badges[0].name}</p>
                <p className="text-xs text-gray-400">{gameData.badges[0].description}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No new commendations.</p>
          )}
        </div>
        
        <div className="card p-4 bg-gray-800 border border-gray-700">
            <h3 className="font-semibold text-indigo-400 mb-1 text-sm"><FaLightbulb className="inline mr-2" />Captain's Log Entry:</h3>
            <p className="text-xs text-gray-300 italic">{getRandomSpaceTip()}</p>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">📊 Galactic Performance Metrics</h2>
        <div>
          <p className="text-sm text-gray-300 mb-1">Missions Logged (This Cycle): <span className="font-bold text-indigo-400">{gameData.stats.tasksCompletedThisWeek}</span></p>
          <p className="text-sm text-gray-300 mb-1">Current Jump Streak: <span className="font-bold text-red-400">{gameData.stats.currentStreak} Parsecs</span> {gameData.stats.currentStreak > 0 ? '🔥' : ''}</p>
          <p className="text-sm text-gray-300 mb-1">Longest Jump Streak: <span className="font-bold text-red-400">{gameData.stats.longestStreak} Parsecs</span></p>
          <div className="mt-4 h-32 bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500">Performance Chart incoming...</p>
          </div>
        </div>
      </section>
    </div>
  );
}