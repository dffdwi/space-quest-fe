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
  FaUserPlus,
  FaUserClock,
  FaMedal,
} from "react-icons/fa";
import AddTaskModal from "@/components/AddTaskModal";
import InviteMemberModal, {
  NewMemberData,
} from "@/components/InviteMemberModal";
import api from "@/lib/api";
import AddMemberModal from "@/components/AddMemberModal";
import CrewListModal from "@/components/CrewListModal";
import AddExpeditionModal from "@/components/AddExpeditionModal";
import RequestMoveModal from "@/components/RequestMoveModal";
import ReviewMoveModal from "@/components/ReviewMoveModal";
import ProjectLeaderboardModal from "@/components/ProjectLeaderboardModal";

interface ProjectInvitationData {
  invitee: {
    userId: string;
    name: string;
    avatarUrl: string;
  };
  status: string;
  role: string;
}

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
  ownerId: string;
  description?: string;
  members?: ProjectMember[];
  columns?: KanbanColumn[];
  tasks?: PlayerTask[];
  invitations?: ProjectInvitationData[];
}

export default function CrewProjectsPage() {
const {
  user,
  isLoading: authLoading,
  playerData,
  isGameDataLoading: isLoadingData,
} = useAuth();
  const {
    addTask,
    editTask,
    completeTask,
    claimProjectTaskReward,
  } = useGameData();
  const router = useRouter();

  const [projects, setProjects] = useState<CrewProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [isExpeditionModalOpen, setIsExpeditionModalOpen] = useState(false);
  const [isRequestMoveModalOpen, setIsRequestMoveModalOpen] = useState(false);
  const [taskToMove, setTaskToMove] = useState<PlayerTask | null>(null);
  const [targetMoveColumnId, setTargetMoveColumnId] = useState<string | null>(
    null
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [taskToReview, setTaskToReview] = useState<PlayerTask | null>(null);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const handleReviewMove = async (action: "approve" | "reject") => {
    if (!taskToReview) return;
    try {
      await api.post(`/tasks/${taskToReview.taskId}/review-move`, { action });

      const response = await api.get(`/projects/${currentProjectId}`);
      setProjects((prev) =>
        prev.map((p) => (p.projectId === currentProjectId ? response.data : p))
      );

      window.showGlobalNotification?.({
        type: "success",
        title: "Request Reviewed",
        message: `The move request has been ${action}d.`,
      });
    } catch (error) {
      console.error("Gagal meninjau permintaan:", error);
    } finally {
      setIsReviewModalOpen(false);
      setTaskToReview(null);
    }
  };

  const selectedProject = projects.find(
    (p) => p.projectId === currentProjectId
  );

  const projectTasks = selectedProject?.tasks || [];

  const handleCreateProject = useCallback(
    async (data: { name: string; description: string }) => {
      if (!playerData) return;
      try {
        const response = await api.post("/projects", data);
        const createdProject = response.data;
        setProjects((prev) => [...prev, createdProject]);
        setCurrentProjectId(createdProject.projectId);
        setIsExpeditionModalOpen(false);
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
    },
    [playerData]
  );

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

  // const handleAddMember = useCallback(
  //   async (userId: string, role?: string) => {
  //     if (!currentProjectId) return;
  //     try {
  //       await api.post(`/projects/${currentProjectId}/members`, {
  //         userId,
  //         role,
  //       });
  //       const response = await api.get(`/projects/${currentProjectId}`);
  //       setProjects((prev) =>
  //         prev.map((p) =>
  //           p.projectId === currentProjectId ? response.data : p
  //         )
  //       );
  //       setIsAddMemberModalOpen(false);
  //       window.showGlobalNotification?.({
  //         type: "success",
  //         title: "Member Added!",
  //         message: "The new member has been added to the expedition.",
  //       });
  //     } catch (error: any) {
  //       console.error("Failed to add member:", error);
  //       window.showGlobalNotification?.({
  //         type: "error",
  //         title: "Error",
  //         message: error.response?.data?.message || "Could not add member.",
  //       });
  //     }
  //   },
  //   [currentProjectId, projects]
  // );

  const handleSendInvitation = useCallback(
    async (userId: string, role?: string) => {
      if (!currentProjectId) return;
      try {
        await api.post(`/projects/${currentProjectId}/invitations`, {
          userId,
          role,
        });

        window.showGlobalNotification?.({
          type: "success",
          title: "Invitation Sent!",
          message: "The invitation has been sent to the user.",
        });
        setIsAddMemberModalOpen(false); // Tutup modal setelah berhasil
        // Tidak perlu fetch ulang di sini, karena status anggota akan dilihat di halaman lain
      } catch (error: any) {
        console.error("Failed to send invitation:", error);
        window.showGlobalNotification?.({
          type: "error",
          title: "Failed to Send",
          message:
            error.response?.data?.message || "Could not send the invitation.",
        });
      }
    },
    [currentProjectId]
  );

  const handleViewRankings = async () => {
    if (!currentProjectId) return;
    try {
      const response = await api.get(
        `/projects/${currentProjectId}/leaderboard`
      );
      setLeaderboardData(response.data);
      setIsLeaderboardModalOpen(true);
    } catch (error) {
      console.error("Gagal mengambil leaderboard proyek:", error);
      window.showGlobalNotification?.({
        type: "error",
        title: "Fetch Failed",
        message: "Could not load project leaderboard data.",
      });
    }
  };

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
    (e: DragEvent<HTMLDivElement>, targetColumnId: string) => {
      e.preventDefault();
      const taskId = draggedTaskId;
      if (!taskId || !selectedProject || !playerData) return;

      const task = projectTasks.find((t) => t.taskId === taskId);
      if (!task || task.status === targetColumnId) return;

      const isOwner = selectedProject.ownerId === playerData.id;

      if (isOwner) {
        api
          .put(`/tasks/${taskId}/move`, { newStatus: targetColumnId })
          .then(() => {
            const doneColumn = selectedProject.columns?.find((c) =>
              c.title.toLowerCase().includes("done")
            );
            if (
              doneColumn &&
              targetColumnId === doneColumn.columnId &&
              !task.isRewardClaimed
            ) {
              return claimProjectTaskReward(taskId);
            }
          })
          .then(() => api.get(`/projects/${selectedProject.projectId}`))
          .then((response) => {
            setProjects((prev) =>
              prev.map((p) =>
                p.projectId === currentProjectId ? response.data : p
              )
            );
          })
          .catch((err) => console.error("Gagal memindahkan tugas:", err));
      } else {
        setTaskToMove(task);
        setTargetMoveColumnId(targetColumnId);
        setIsRequestMoveModalOpen(true);
      }

      setDraggedTaskId(null);
      setDragOverColumnId(null);
    },
    [
      draggedTaskId,
      selectedProject,
      projectTasks,
      playerData,
      claimProjectTaskReward,
      currentProjectId,
    ]
  );

  const handleRequestMoveSubmit = async (message: string) => {
    if (!taskToMove || !targetMoveColumnId) return;

    try {
      await api.post(`/tasks/${taskToMove.taskId}/request-move`, {
        targetStatus: targetMoveColumnId,
        message: message,
      });

      const response = await api.get(`/projects/${currentProjectId}`);
      setProjects((prev) =>
        prev.map((p) => (p.projectId === currentProjectId ? response.data : p))
      );

      window.showGlobalNotification?.({
        type: "success",
        title: "Request Sent",
        message: "Your request to move the task has been sent for approval.",
      });
    } catch (error) {
      console.error("Gagal mengirim permintaan:", error);
      window.showGlobalNotification?.({
        type: "error",
        title: "Request Failed",
        message: "Could not send the move request.",
      });
    } finally {
      setIsRequestMoveModalOpen(false);
      setTaskToMove(null);
      setTargetMoveColumnId(null);
    }
  };

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
      <div className="card p-6 text-center flex flex-col items-center justify-center">
        <FaUsersCog className="text-6xl text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-100">
          No Expeditions Launched
        </h2>
        <p className="text-gray-400 mb-6">
          Assemble your crew and embark on a new expedition!
        </p>
        <button
          onClick={() => setIsExpeditionModalOpen(true)}
          className="btn btn-primary flex justify-center items-center"
        >
          <FaPlus className="mr-2" /> Plan New Expedition
        </button>
        <AddExpeditionModal
          isOpen={isExpeditionModalOpen}
          onClose={() => setIsExpeditionModalOpen(false)}
          onSave={handleCreateProject}
        />
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
              onClick={() => setIsExpeditionModalOpen(true)}
              className="btn btn-success text-sm !px-2 !py-1"
              title="Chart New Expedition"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => setIsCrewModalOpen(true)}
              className="btn btn-primary text-sm flex items-center"
              disabled={!currentProjectId}
            >
              <FaUsers className="mr-2" /> Manage Crew
            </button>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="btn btn-primary text-sm flex items-center"
              disabled={!currentProjectId}
            >
              <FaUserPlus className="mr-2" /> Recruit Crew
            </button>
            <button
              onClick={openCreateTaskModalForProject}
              className="btn btn-primary text-sm flex items-center"
              disabled={!currentProjectId}
            >
              <FaPlus className="mr-2" /> Add Objective
            </button>
            <button
              onClick={handleViewRankings}
              className="btn btn-primary text-sm flex items-center"
              disabled={!currentProjectId}
            >
              <FaMedal className="mr-2" /> View Rankings
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
                        draggable={
                          !task.statusChangeRequest &&
                          (playerData?.id === selectedProject?.ownerId ||
                            playerData?.id === task.userId)
                        }
                        onDragStart={(e) => handleDragStart(e, task.taskId)}
                        onDragEnd={handleDragEnd}
                        className={`kanban-task-card bg-gray-700 border-gray-600 p-3 rounded-md shadow-sm relative
    ${
      task.statusChangeRequest
        ? "opacity-70 border-dashed border-yellow-400"
        : "hover:border-indigo-500"
    }
    ${draggedTaskId === task.taskId ? "dragging-task" : ""}
    ${
      !(
        !task.statusChangeRequest &&
        (playerData?.id === selectedProject?.ownerId ||
          playerData?.id === task.userId)
      )
        ? "cursor-not-allowed"
        : "cursor-grab"
    }`}
                      >
                        {task.statusChangeRequest && (
                          <div
                            className="w-full bg-yellow-900/50 text-yellow-200 text-xs font-bold px-2 py-1 rounded-t-md mb-2 flex items-center -m-3 p-2 border-b border-yellow-700/50"
                            title="Awaiting approval to move"
                          >
                            <FaUserClock className="mr-2" />
                            <span>Awaiting Approval</span>
                          </div>
                        )}

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

                        {task.statusChangeMessage && (
                          <div className="text-xs italic text-yellow-200 bg-yellow-900/50 p-2 rounded-md my-2">
                            "{task.statusChangeMessage}"
                          </div>
                        )}

                        <p className="task-meta text-gray-500 text-xs">
                          {task.dueDate
                            ? `Due: ${formatDate(task.dueDate)}`
                            : "Flexible"}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          {task.statusChangeRequest &&
                          playerData?.id === selectedProject?.ownerId ? (
                            <button
                              onClick={() => {
                                setTaskToReview(task);
                                setIsReviewModalOpen(true);
                              }}
                              className="btn btn-warning !py-1 !text-xs w-full"
                            >
                              Review Request
                            </button>
                          ) : (
                            <span
                              className={`text-xs font-semibold transition-opacity ${
                                task.isRewardClaimed
                                  ? "opacity-50 text-gray-500 line-through"
                                  : "text-purple-400"
                              }`}
                            >
                              +{task.xp} XP
                            </span>
                          )}

                          {task.owner ? (
                            <div
                              className="flex items-center"
                              title={`Assigned to: ${task.owner.name}`}
                            >
                              <img
                                src={
                                  task.owner.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    task.owner.name || "A"
                                  )}&background=random&color=fff&size=40`
                                }
                                alt={task.owner.name}
                                className="w-6 h-6 rounded-full bg-gray-600 object-fill"
                              />
                              <span className="ml-2 hidden text-xs text-gray-400 sm:block">
                                {task.owner.name}
                              </span>
                            </div>
                          ) : (
                            <div className="h-6 w-6" />
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
          onAddMember={handleSendInvitation}
          projectName={selectedProject.name}
          existingMembers={selectedProject.members || []}
        />
      )}
      {isCrewModalOpen && selectedProject && (
        <CrewListModal
          isOpen={isCrewModalOpen}
          onClose={() => setIsCrewModalOpen(false)}
          members={selectedProject.members || []}
          invitations={selectedProject.invitations || []}
        />
      )}
      <AddExpeditionModal
        isOpen={isExpeditionModalOpen}
        onClose={() => setIsExpeditionModalOpen(false)}
        onSave={handleCreateProject}
      />
      {isRequestMoveModalOpen && taskToMove && targetMoveColumnId && (
        <RequestMoveModal
          isOpen={isRequestMoveModalOpen}
          onClose={() => setIsRequestMoveModalOpen(false)}
          onSubmit={handleRequestMoveSubmit}
          taskTitle={taskToMove.title}
          targetColumnName={
            selectedProject?.columns?.find(
              (c) => c.columnId === targetMoveColumnId
            )?.title || ""
          }
        />
      )}
      {isReviewModalOpen && taskToReview && (
        <ReviewMoveModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReview={handleReviewMove}
          task={taskToReview}
          requesterName={
            selectedProject?.members?.find(
              (m) => m.userId === taskToReview.statusChangeRequesterId
            )?.name || "Unknown"
          }
          targetColumnName={
            selectedProject?.columns?.find(
              (c) => c.columnId === taskToReview.statusChangeRequest
            )?.title || "Unknown"
          }
        />
      )}
      {isLeaderboardModalOpen && selectedProject && (
        <ProjectLeaderboardModal
          isOpen={isLeaderboardModalOpen}
          onClose={() => setIsLeaderboardModalOpen(false)}
          leaderboardData={leaderboardData}
          projectName={selectedProject.name}
        />
      )}
    </div>
  );
}
