"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGameData, PlayerTask, PlayerData } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaPlus,
  FaUsers,
  FaClipboardList,
  FaRocket,
  FaUsersCog,
  FaEdit,
} from "react-icons/fa";
import AddTaskModal from "@/components/AddTaskModal";

export interface ProjectMember {
  id: string | number;
  name: string;
  avatarUrl: string;
  role?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface CrewProject {
  id: string;
  name: string;
  description?: string;
  members: ProjectMember[];
  columns: KanbanColumn[];
}

export const formatDate = (dateString?: string) => {
  if (!dateString) return "No Deadline";
  try {
    return new Date(dateString).toLocaleDateString("en-ID");
  } catch {
    return "Invalid Date";
  }
};

export default function CrewProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    playerData,
    isLoadingData,
    addTask,
    editTask,
    completeTask,
    updatePlayerData,
  } = useGameData(user);
  const router = useRouter();

  const [projects, setProjects] = useState<CrewProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);

  useEffect(() => {
    if (playerData && playerData.id) {
      const storedProjects = localStorage.getItem(
        `spaceQuestProjects_${playerData.id}`
      );
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects) as CrewProject[];
        setProjects(parsedProjects);
        if (parsedProjects.length > 0 && !currentProjectId) {
          setCurrentProjectId(parsedProjects[0].id);
        }
      } else {
        const defaultProject: CrewProject = {
          id: `proj-${Date.now()}`,
          name: "Genesis Star Launch",
          description:
            "Prepare the main starship for its maiden voyage across the galaxy.",
          members: [
            {
              id: playerData.id,
              name: playerData.name,
              avatarUrl: playerData.avatarUrl,
              role: "Commander",
            },
            {
              id: "dummy1",
              name: "Engineer Sparks",
              avatarUrl: `https://ui-avatars.com/api/?name=ES&background=0D8ABC&color=fff&size=40`,
              role: "Chief Engineer",
            },
          ],
          columns: [
            { id: "backlog", title: "Mission Briefing (Backlog)" },
            { id: "todo", title: "Pre-Flight Checks (To Do)" },
            { id: "inprogress", title: "Systems Online (In Progress)" },
            { id: "done", title: "Ready for Launch (Done)" },
          ],
        };
        setProjects([defaultProject]);
        setCurrentProjectId(defaultProject.id);
        localStorage.setItem(
          `spaceQuestProjects_${playerData.id}`,
          JSON.stringify([defaultProject])
        );
      }
    }
  }, [playerData, currentProjectId]);

  useEffect(() => {
    if (playerData && playerData.id && projects.length > 0) {
      localStorage.setItem(
        `spaceQuestProjects_${playerData.id}`,
        JSON.stringify(projects)
      );
    }
  }, [projects, playerData]);

  const selectedProject = projects.find((p) => p.id === currentProjectId);
  const projectTasks =
    playerData?.tasks.filter((t) => t.projectId === currentProjectId) || [];

  const openCreateTaskModalForProject = () => {
    if (!currentProjectId) {
      window.showGlobalNotification?.({
        type: "error",
        title: "No Expedition Selected",
        message: "Please select or create an expedition first.",
      });
      return;
    }
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: PlayerTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = (
    taskData: Omit<PlayerTask, "id" | "completed" | "completedAt">,
    taskId?: string
  ) => {
    if (!currentProjectId) return;

    const dataToSave = {
      ...taskData,
      projectId: currentProjectId,
      status: taskData.status || selectedProject?.columns[0]?.id || "todo",
    };

    if (taskId) {
      editTask(taskId, dataToSave);
    } else {
      addTask(dataToSave);
    }
    setIsTaskModalOpen(false);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetColumnId: string
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = playerData?.tasks.find((t) => t.id === taskId);

    if (
      task &&
      task.status !== targetColumnId &&
      task.projectId === currentProjectId
    ) {
      editTask(taskId, { status: targetColumnId });
      if (
        targetColumnId ===
          selectedProject?.columns.find(
            (c) => c.title.toLowerCase().includes("done") || c.id === "done"
          )?.id &&
        !task.completed
      ) {
        completeTask(taskId);
      }
      window.showGlobalNotification?.({
        type: "info",
        title: "Mission Log Updated",
        message: `Log "${task.title}" moved to ${targetColumnId}.`,
      });
    }
  };

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl">Accessing Expedition Records...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card p-6 text-center">
        <FaUsers className="text-6xl text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-100">
          No Expeditions Launched
        </h2>
        <p className="text-gray-400 mb-6">
          Assemble your crew and embark on a new expedition!
        </p>
        <button
          onClick={() => alert("Implement Create New Project UI/Logic")}
          className="btn btn-primary"
        >
          <FaPlus className="mr-2" /> Plan New Expedition
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="flex items-center gap-3">
            <FaUsersCog className="text-3xl text-indigo-400" />
            <select
              value={currentProjectId || ""}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="input-field px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-semibold"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => alert("Implement Invite Member UI")}
              className="btn btn-secondary text-sm"
            >
              <FaUsers className="mr-2" /> Manage Crew
            </button>
            <button
              onClick={openCreateTaskModalForProject}
              className="btn btn-primary text-sm"
            >
              <FaPlus className="mr-2" /> Add Mission Objective
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {selectedProject?.description ||
            "No specific briefing for this expedition."}
        </p>

        {selectedProject && (
          <div className="kanban-board no-scrollbar">
            {selectedProject.columns.map((column) => (
              <div
                key={column.id}
                className="kanban-column bg-gray-800 border-gray-700"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <h3 className="kanban-column-title text-gray-200 border-gray-600">
                  {column.title} (
                  {projectTasks.filter((t) => t.status === column.id).length})
                </h3>
                <div className="kanban-tasks-container no-scrollbar space-y-3">
                  {projectTasks
                    .filter((t) => t.status === column.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="kanban-task-card bg-gray-700 border-gray-600 hover:border-indigo-500"
                      >
                        <div className="flex justify-between items-start">
                          <p className="task-title text-sm text-gray-100">
                            {task.title}
                          </p>
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="text-xs text-gray-400 hover:text-sky-400 p-1 -mr-1 -mt-1"
                          >
                            <FaEdit />
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-1 mb-2">
                            {task.description.substring(0, 50)}
                            {task.description.length > 50 && "..."}
                          </p>
                        )}
                        <p className="task-meta text-gray-500">
                          {task.dueDate
                            ? `ETA: ${formatDate(task.dueDate)}`
                            : "Flexible ETA"}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-purple-400 font-semibold">
                            +{task.xp} XP
                          </span>
                          {task.assignedTo &&
                            selectedProject.members.find(
                              (m) => m.id === task.assignedTo
                            ) && (
                              <img
                                src={
                                  selectedProject.members.find(
                                    (m) => m.id === task.assignedTo
                                  )?.avatarUrl
                                }
                                alt={
                                  selectedProject.members.find(
                                    (m) => m.id === task.assignedTo
                                  )?.name
                                }
                                title={
                                  selectedProject.members.find(
                                    (m) => m.id === task.assignedTo
                                  )?.name
                                }
                                className="assigned-avatar w-5 h-5 bg-gray-600 text-gray-200"
                              />
                            )}
                        </div>
                      </div>
                    ))}
                  {projectTasks.filter((t) => t.status === column.id).length ===
                    0 && (
                    <p className="text-xs text-gray-500 italic p-2 text-center">
                      No objectives in this phase.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isTaskModalOpen && selectedProject && (
        <AddTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleTaskSave}
          existingTask={editingTask}
          projectId={currentProjectId}
        />
      )}
    </div>
  );
}
