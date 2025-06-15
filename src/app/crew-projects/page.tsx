"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGameData, PlayerTask, PlayerData } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, DragEvent } from "react";
import {
  FaPlus,
  FaUsers,
  FaUsersCog,
  FaClipboardList,
  FaRocket,
  FaEdit,
} from "react-icons/fa";
import AddTaskModal from "@/components/AddTaskModal";
import InviteMemberModal, {
  NewMemberData,
} from "@/components/InviteMemberModal";
import api from "@/lib/api";
import AddMemberModal from "@/components/AddMemberModal";

export interface ProjectMember {
  userId: string;
  name: string;
  avatarUrl: string;
  role?: string;
  ProjectMember?: {
    role: string;
  };
}

export interface KanbanColumn {
  columnId: string;
  title: string;
  order: number;
}

export interface CrewProject {
  projectId: string;
  name: string;
  description?: string;
  members?: ProjectMember[];
  columns?: KanbanColumn[];
  tasks?: PlayerTask[];
}

export default function CrewProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { playerData, isLoadingData, addTask, editTask, completeTask } =
    useGameData(user);
  const router = useRouter();

  const [projects, setProjects] = useState<CrewProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const selectedProject = projects.find(
    (p) => p.projectId === currentProjectId
  );

  const projectTasks = selectedProject?.tasks || [];

  const handleCreateProject = useCallback(async () => {
    if (!playerData) return;

    const projectCount = projects.length + 1;
    const newProjectData = {
      name: `Expedition #${projectCount}`,
      description: "Charted for new discoveries.",
    };

    try {
      const response = await api.post("/projects", newProjectData);
      const createdProject = response.data;
      setProjects((prev) => [...prev, createdProject]);
      setCurrentProjectId(createdProject.projectId);
      window.showGlobalNotification?.({
        type: "success",
        title: "New Expedition Charted!",
        message: `"${createdProject.name}" is now active and saved.`,
      });
    } catch (error) {
      console.error("Gagal membuat proyek baru:", error);
      window.showGlobalNotification?.({
        type: "error",
        title: "Failed to Chart Expedition",
        message: "Could not save the new expedition to the server.",
      });
    }
  }, [playerData, projects]);

  const openCreateTaskModalForProject = useCallback(() => {
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
  }, [currentProjectId]);

  const openEditTaskModal = useCallback((task: PlayerTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleTaskSave = useCallback(
    (
      taskDataFromModal: Omit<
        PlayerTask,
        "taskId" | "completed" | "completedAt"
      >,
      taskId?: string
    ) => {
      if (!currentProjectId || !selectedProject || !selectedProject.columns)
        return;
      const defaultStatus = selectedProject.columns[0]?.columnId || "todo";

      const payload = {
        ...taskDataFromModal,
        projectId: currentProjectId,
        status: taskDataFromModal.status || defaultStatus,
      };

      if (taskId) {
        editTask(taskId, payload);
      } else {
        addTask(payload);
      }
      setIsTaskModalOpen(false);
    },
    [currentProjectId, selectedProject, addTask, editTask]
  );

  const handleAddMember = useCallback(
    async (userId: string, role?: string) => {
      if (!currentProjectId) return;
      try {
        await api.post(`/projects/${currentProjectId}/members`, {
          userId,
          role,
        });
        const response = await api.get(`/projects/${currentProjectId}`);
        setProjects((prev) =>
          prev.map((p) =>
            p.projectId === currentProjectId ? response.data : p
          )
        );
        setIsAddMemberModalOpen(false);
        window.showGlobalNotification?.({
          type: "success",
          title: "Member Added!",
          message: "The new member has been added to the expedition.",
        });
      } catch (error: any) {
        console.error("Failed to add member:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Error",
          message: error.response?.data?.message || "Could not add member.",
        });
      }
    },
    [currentProjectId, projects]
  );

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, taskId: string) => {
      setDraggedTaskId(taskId);
      e.dataTransfer.setData("taskId", taskId);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragEnd = useCallback((e: DragEvent<HTMLDivElement>) => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>, columnId: string) => {
      setDragOverColumnId(columnId);
    },
    []
  );

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>, targetColumnId: string) => {
      e.preventDefault();
      const taskId = draggedTaskId || e.dataTransfer.getData("taskId");

      const currentColumnEl = document.querySelector(
        `.kanban-column[data-column-id="${dragOverColumnId}"]`
      );
      currentColumnEl?.classList.remove("drag-over-column-highlight");
      setDraggedTaskId(null);
      setDragOverColumnId(null);

      if (!taskId || !selectedProject) return;

      const taskToMove = selectedProject.tasks?.find(
        (t) => t.taskId === taskId
      );
      if (!taskToMove || taskToMove.status === targetColumnId) {
        return;
      }

      try {
        await api.put(`/tasks/${taskId}/move`, { newStatus: targetColumnId });
        setProjects((prevProjects) =>
          prevProjects.map((p) => {
            if (p.projectId === selectedProject.projectId && p.tasks) {
              return {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.taskId === taskId ? { ...t, status: targetColumnId } : t
                ),
              };
            }
            return p;
          })
        );

        const targetColumn = selectedProject.columns?.find(
          (c) => c.columnId === targetColumnId
        );
        window.showGlobalNotification?.({
          type: "info",
          title: "Objective Relocated",
          message: `Objective "${taskToMove.title}" moved to ${
            targetColumn?.title || targetColumnId
          }.`,
        });
      } catch (error) {
        console.error("Gagal memindahkan tugas:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Move Failed",
          message: "Could not update the task status on the server.",
        });
      }
    },
    [draggedTaskId, dragOverColumnId, selectedProject, projects]
  );

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Flexible";
    try {
      const date = new Date(dateString);
      if (!dateString.includes("T")) {
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString(
          "en-CA"
        );
      }
      return date.toLocaleDateString("en-CA");
    } catch {
      return "Invalid Date";
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!playerData) return;
      try {
        const response = await api.get("/projects");
        const projectsFromApi: CrewProject[] = response.data;
        setProjects(projectsFromApi);
        if (projectsFromApi.length > 0 && !currentProjectId) {
          setCurrentProjectId(projectsFromApi[0].projectId);
        }
      } catch (error) {
        console.error("Gagal mengambil data proyek:", error);
      }
    };

    if (playerData && !isLoadingData) {
      fetchProjects();
    }
  }, [playerData, isLoadingData]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!currentProjectId) return;
      const projectInState = projects.find(
        (p) => p.projectId === currentProjectId
      );
      if (projectInState && projectInState.columns) {
        return;
      }
      try {
        const response = await api.get(`/projects/${currentProjectId}`);
        const detailedProject = response.data;
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.projectId === currentProjectId ? detailedProject : p
          )
        );
      } catch (error) {
        console.error("Gagal mengambil detail proyek:", error);
      }
    };

    if (currentProjectId) {
      fetchProjectDetails();
    }
  }, [currentProjectId, projects]);

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
        <FaUsersCog className="text-6xl text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-100">
          No Expeditions Launched
        </h2>
        <p className="text-gray-400 mb-6">
          Assemble your crew and embark on a new expedition!
        </p>
        <button onClick={handleCreateProject} className="btn btn-primary">
          <FaPlus className="mr-2" /> Plan New Expedition
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <FaUsersCog className="text-3xl text-indigo-400 flex-shrink-0" />
            {projects.length > 0 && currentProjectId ? (
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="input-field px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-semibold min-w-[200px]"
              >
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : projects.length > 0 ? (
              <span className="text-xl font-semibold text-gray-400">
                Select an Expedition
              </span>
            ) : (
              <span className="text-xl font-semibold text-gray-400">
                No Expeditions Available
              </span>
            )}
            <button
              onClick={handleCreateProject}
              className="btn btn-success text-sm !px-2 !py-1"
              title="Chart New Expedition"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="btn btn-primary text-sm flex items-center"
              disabled={!currentProjectId}
            >
              <FaUsers className="mr-2" /> Manage Crew
            </button>
            <button
              onClick={openCreateTaskModalForProject}
              className="btn btn-primary text-sm flex items-center"
              disabled={!currentProjectId}
            >
              <FaPlus className="mr-2" /> Add Objective
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {selectedProject?.description ||
            (currentProjectId
              ? "No specific briefing for this expedition."
              : "Select or create an expedition to view details.")}
        </p>

        {selectedProject && selectedProject.columns ? (
          <div className="kanban-board no-scrollbar">
            {selectedProject.columns.map((column) => (
              <div
                key={column.columnId}
                data-column-id={column.columnId}
                className={`kanban-column bg-gray-800/70 border-gray-700/80 p-3 rounded-lg transition-all duration-200 ${
                  dragOverColumnId === column.columnId
                    ? "drag-over-column-highlight"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e)}
                onDragEnter={(e) => handleDragEnter(e, column.columnId)}
                onDrop={(e) => handleDrop(e, column.columnId)}
              >
                <h3 className="kanban-column-title text-gray-200 border-gray-600 px-1 pb-2">
                  {column.title} (
                  {
                    projectTasks.filter((t) => t.status === column.columnId)
                      .length
                  }
                  )
                </h3>
                <div className="kanban-tasks-container no-scrollbar space-y-3 p-1 min-h-[100px]">
                  {projectTasks
                    .filter((t) => t.status === column.columnId)
                    .map((task) => (
                      <div
                        key={task.taskId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.taskId)}
                        onDragEnd={handleDragEnd}
                        className={`kanban-task-card bg-gray-700 border-gray-600 hover:border-indigo-500 p-3 rounded-md shadow-sm cursor-grab ${
                          draggedTaskId === task.taskId ? "dragging-task" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="task-title text-sm font-medium text-gray-100 break-words">
                            {task.title}
                          </p>
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="text-xs text-gray-400 hover:text-sky-400 p-1 -mr-1 -mt-1 flex-shrink-0"
                          >
                            <FaEdit />
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-1 mb-2 break-words">
                            {task.description.substring(0, 70)}
                            {task.description.length > 70 && "..."}
                          </p>
                        )}
                        <p className="task-meta text-gray-500 text-xs">
                          {task.dueDate
                            ? `Due: ${formatDate(task.dueDate)}`
                            : "Flexible"}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-purple-400 font-semibold">
                            +{task.xp} XP
                          </span>
                          {task.assignedTo &&
                          selectedProject.members?.find(
                            (m) => m.userId === task.assignedTo
                          ) ? (
                            <img
                              src={
                                selectedProject.members.find(
                                  (m) => m.userId === task.assignedTo
                                )?.avatarUrl
                              }
                              alt={
                                selectedProject.members.find(
                                  (m) => m.userId === task.assignedTo
                                )?.name
                              }
                              title={
                                selectedProject.members.find(
                                  (m) => m.userId === task.assignedTo
                                )?.name
                              }
                              className="assigned-avatar w-6 h-6 bg-gray-600 text-gray-200"
                            />
                          ) : task.assignedTo ? (
                            <span
                              className="assigned-avatar w-6 h-6 bg-gray-600 text-gray-400 text-xs flex items-center justify-center"
                              title="Unknown Assignee"
                            >
                              ?
                            </span>
                          ) : (
                            <div className="w-6 h-6"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  {projectTasks.filter((t) => t.status === column.columnId)
                    .length === 0 && (
                    <p className="text-xs text-gray-500 italic p-2 text-center">
                      No objectives in this phase.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : selectedProject ? (
          <div className="text-center p-8 text-gray-400">
            <FaRocket className="text-3xl text-indigo-400 animate-pulse mx-auto mb-2" />
            Loading Expedition Details...
          </div>
        ) : (
          <div className="text-center p-8 text-gray-400">
            <p>Select an expedition to view its details.</p>
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
          projectMembers={selectedProject.members || []}
          projectColumns={selectedProject.columns || []}
        />
      )}
      {isAddMemberModalOpen && selectedProject && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMember={handleAddMember}
          projectName={selectedProject.name}
          existingMembers={selectedProject.members || []}
        />
      )}
    </div>
  );
}
