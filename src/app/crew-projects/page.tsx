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

export interface ProjectMember {
  id: string;
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

export default function CrewProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { playerData, isLoadingData, addTask, editTask, completeTask } =
    useGameData(user);
  const router = useRouter();

  const [projects, setProjects] = useState<CrewProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const getProjectsLocalStorageKey = useCallback(() => {
    return playerData?.id
      ? `spaceQuestProjects_${String(playerData.id)}`
      : null;
  }, [playerData?.id]);

  const createDefaultProject = useCallback(
    (pd: PlayerData): CrewProject => ({
      id: `proj-${Date.now()}`,
      name: "Genesis Star Launch",
      description:
        "Prepare the main starship for its maiden voyage across the galaxy.",
      members: [
        {
          id: String(pd.id),
          name: pd.name,
          avatarUrl: pd.avatarUrl,
          role: "Commander",
        },
        {
          id: "dummy-crew-1",
          name: "Engineer Sparks",
          avatarUrl: `https://ui-avatars.com/api/?name=ES&background=0D8ABC&color=fff&size=40`,
          role: "Chief Engineer",
        },
        {
          id: "dummy-crew-2",
          name: "Navigator Orion",
          avatarUrl: `https://ui-avatars.com/api/?name=NO&background=7C3AED&color=fff&size=40`,
          role: "Navigator",
        },
      ],
      columns: [
        { id: "backlog", title: "Mission Briefing (Backlog)" },
        { id: "todo", title: "Pre-Flight Checks (To Do)" },
        { id: "inprogress", title: "Systems Online (In Progress)" },
        { id: "done", title: "Ready for Launch (Done)" },
      ],
    }),
    []
  );

  useEffect(() => {
    if (playerData && playerData.id && !authLoading && !isLoadingData) {
      const storedProjectsKey = getProjectsLocalStorageKey();
      if (!storedProjectsKey) return;

      const storedProjects = localStorage.getItem(storedProjectsKey);
      if (storedProjects) {
        try {
          const parsedProjects = JSON.parse(storedProjects) as CrewProject[];
          setProjects(parsedProjects);
          if (
            parsedProjects.length > 0 &&
            (!currentProjectId ||
              !parsedProjects.find((p) => p.id === currentProjectId))
          ) {
            setCurrentProjectId(parsedProjects[0].id);
          } else if (parsedProjects.length === 0) {
            const defaultProject = createDefaultProject(playerData);
            setProjects([defaultProject]);
            setCurrentProjectId(defaultProject.id);
          }
        } catch (e) {
          console.error("Failed to parse projects from localStorage", e);
          const defaultProject = createDefaultProject(playerData);
          setProjects([defaultProject]);
          setCurrentProjectId(defaultProject.id);
        }
      } else {
        const defaultProject = createDefaultProject(playerData);
        setProjects([defaultProject]);
        setCurrentProjectId(defaultProject.id);
      }
    }
  }, [
    playerData,
    authLoading,
    isLoadingData,
    currentProjectId,
    getProjectsLocalStorageKey,
    createDefaultProject,
  ]);

  useEffect(() => {
    const storedProjectsKey = getProjectsLocalStorageKey();
    if (
      storedProjectsKey &&
      projects &&
      projects.length > 0 &&
      playerData?.id &&
      !isLoadingData
    ) {
      localStorage.setItem(storedProjectsKey, JSON.stringify(projects));
    }
  }, [projects, playerData?.id, isLoadingData, getProjectsLocalStorageKey]);

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
    taskDataFromModal: Omit<PlayerTask, "taskId" | "completed" | "completedAt">,
    taskId?: string
  ) => {
    if (!currentProjectId || !selectedProject) return;

    const defaultStatusFromProject = selectedProject.columns[0]?.id || "todo";

    const taskPayload: Partial<PlayerTask> = {
      title: taskDataFromModal.title,
      description: taskDataFromModal.description,
      dueDate: taskDataFromModal.dueDate,
      xp: taskDataFromModal.xp,
      credits: taskDataFromModal.credits,
      category: taskDataFromModal.category,
      projectId: currentProjectId,
      status: taskDataFromModal.status || defaultStatusFromProject,
      assignedTo: taskDataFromModal.assignedTo || null,
    };

    if (taskId) {
      editTask(taskId, taskPayload);
    } else {
      const { status, taskId, completed, completedAt, ...payloadForAdd } =
        taskPayload as PlayerTask;
      addTask(payloadForAdd);
    }
    setIsTaskModalOpen(false);
  };

  const handleInviteMember = (memberData: NewMemberData) => {
    if (!currentProjectId) return;
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === currentProjectId) {
          const newMember: ProjectMember = {
            id: `member-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 5)}`,
            ...memberData,
            avatarUrl:
              memberData.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                memberData.name
              )}&background=random&color=fff&size=40`,
          };
          if (p.members.find((m) => m.name === newMember.name)) {
            window.showGlobalNotification?.({
              type: "warning",
              title: "Crew Member Exists",
              message: `"${newMember.name}" is already part of this expedition.`,
            });
            return p;
          }
          window.showGlobalNotification?.({
            type: "success",
            title: "Crew Member Added!",
            message: `"${newMember.name}" has joined expedition ${p.name}.`,
          });
          return { ...p, members: [...p.members, newMember] };
        }
        return p;
      })
    );
    setIsInviteModalOpen(false);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging-task");
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    setDraggedTaskId(null);
    if (dragOverColumnId) {
      document
        .querySelector(`.kanban-column[data-column-id="${dragOverColumnId}"]`)
        ?.classList.remove("drag-over-column-highlight");
    }
    setDragOverColumnId(null);
    e.currentTarget.classList.remove("dragging-task");
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    if (columnId !== dragOverColumnId) {
      if (dragOverColumnId) {
        document
          .querySelector(`.kanban-column[data-column-id="${dragOverColumnId}"]`)
          ?.classList.remove("drag-over-column-highlight");
      }
      setDragOverColumnId(columnId);
      e.currentTarget
        .closest(".kanban-column")
        ?.classList.add("drag-over-column-highlight");
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    const kanbanColumn = e.currentTarget.closest(".kanban-column");
    if (kanbanColumn && !kanbanColumn.contains(e.relatedTarget as Node)) {
      if (dragOverColumnId === kanbanColumn.getAttribute("data-column-id")) {
        setDragOverColumnId(null);
      }
      kanbanColumn.classList.remove("drag-over-column-highlight");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData("taskId");

    const currentColumnEl = document.querySelector(
      `.kanban-column[data-column-id="${dragOverColumnId}"]`
    );
    currentColumnEl?.classList.remove("drag-over-column-highlight");

    setDraggedTaskId(null);
    setDragOverColumnId(null);

    if (!taskId || !playerData || !selectedProject) return;

    const taskToMove = playerData.tasks.find(
      (t) => t.taskId === taskId && t.projectId === currentProjectId
    );

    if (taskToMove && taskToMove.status !== targetColumnId) {
      const originalStatus = taskToMove.status;
      editTask(taskId, { status: targetColumnId });

      const doneColumn = selectedProject.columns.find(
        (c) => c.id === "done" || c.title.toLowerCase().includes("done")
      );
      const isMovingToDone = doneColumn && targetColumnId === doneColumn.id;
      const isMovingFromDone =
        doneColumn &&
        originalStatus === doneColumn.id &&
        targetColumnId !== doneColumn.id;

      if (isMovingToDone && !taskToMove.completed) {
        completeTask(taskId);
      } else if (isMovingFromDone && taskToMove.completed) {
        editTask(taskId, { completed: false, completedAt: undefined });
        window.showGlobalNotification?.({
          type: "info",
          title: "Objective Reactivated",
          message: `Objective "${taskToMove.title}" moved from 'Done' and is now active.`,
        });
      } else {
        window.showGlobalNotification?.({
          type: "info",
          title: "Objective Relocated",
          message: `Objective "${taskToMove.title}" moved to ${
            selectedProject.columns.find((c) => c.id === targetColumnId)
              ?.title || targetColumnId
          }.`,
        });
      }
    }
  };

  const formatDate = (dateString?: string) => {
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
  };

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl">Accessing Expedition Records...</p>
      </div>
    );
  }

  if (projects.length === 0 && !isLoadingData && !authLoading) {
    return (
      <div className="card p-6 text-center">
        <FaUsersCog className="text-6xl text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-100">
          No Expeditions Launched
        </h2>
        <p className="text-gray-400 mb-6">
          Assemble your crew and embark on a new expedition!
        </p>
        <button
          onClick={() => {
            if (playerData) {
              const newProject = createDefaultProject(playerData);
              newProject.name = "My First Expedition";
              setProjects((prev) => [...prev, newProject]);
              setCurrentProjectId(newProject.id);
              window.showGlobalNotification?.({
                type: "success",
                title: "Expedition Planned!",
                message: `"${newProject.name}" is ready for objectives.`,
              });
            }
          }}
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
          <div className="flex items-center gap-3 flex-wrap">
            <FaUsersCog className="text-3xl text-indigo-400 flex-shrink-0" />
            {projects.length > 0 && currentProjectId ? (
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="input-field px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-semibold min-w-[200px]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
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
              onClick={() => {
                if (playerData) {
                  const newProject = createDefaultProject(playerData);
                  const projectCount = projects.length + 1;
                  newProject.name = `Expedition #${projectCount}`;
                  newProject.id = `proj-${Date.now()}`;
                  setProjects((prev) => [...prev, newProject]);
                  setCurrentProjectId(newProject.id);
                  window.showGlobalNotification?.({
                    type: "success",
                    title: "New Expedition Charted!",
                    message: `"${newProject.name}" is now active.`,
                  });
                }
              }}
              className="btn btn-success text-sm !px-2 !py-1"
              title="Chart New Expedition"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => {
                if (!currentProjectId) {
                  window.showGlobalNotification?.({
                    type: "warning",
                    title: "Select Expedition",
                    message: "Please select an expedition to manage crew.",
                  });
                  return;
                }
                setIsInviteModalOpen(true);
              }}
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

        {selectedProject && (
          <div className="kanban-board no-scrollbar">
            {selectedProject.columns.map((column) => (
              <div
                key={column.id}
                data-column-id={column.id}
                className={`kanban-column bg-gray-800/70 border-gray-700/80 p-3 rounded-lg transition-all duration-200 ${
                  dragOverColumnId === column.id
                    ? "drag-over-column-highlight"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragEnter={(e) => handleDragEnter(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <h3 className="kanban-column-title text-gray-200 border-gray-600 px-1 pb-2">
                  {column.title} (
                  {projectTasks.filter((t) => t.status === column.id).length})
                </h3>
                <div className="kanban-tasks-container no-scrollbar space-y-3 p-1 min-h-[100px]">
                  {projectTasks
                    .filter((t) => t.status === column.id)
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
                          selectedProject.members.find(
                            (m) => m.id === task.assignedTo
                          ) ? (
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
          projectMembers={selectedProject.members}
          projectColumns={selectedProject.columns}
        />
      )}
      {isInviteModalOpen && selectedProject && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleInviteMember}
          projectName={selectedProject.name}
        />
      )}
    </div>
  );
}
