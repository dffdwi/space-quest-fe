"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { PlayerTask } from "@/hooks/useGameData";
import { ProjectMember, KanbanColumn } from "@/app/crew-projects/page";
import { FaTimes, FaSave, FaPaperPlane } from "react-icons/fa";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    taskData: Omit<PlayerTask, "taskId" | "completed" | "completedAt">,
    id?: string
  ) => void;
  existingTask?: PlayerTask | null;
  projectId?: string | null;
  projectMembers?: ProjectMember[];
  projectColumns?: KanbanColumn[];
  defaultDate?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTask,
  projectId,
  projectMembers = [],
  projectColumns = [],
  defaultDate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || "");
  const [xp, setXp] = useState(20);
  const [credits, setCredits] = useState(5);
  const [category, setCategory] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setTitle(existingTask.title);
        setDescription(existingTask.description || "");
        setDueDate(
          existingTask.dueDate
            ? new Date(existingTask.dueDate).toISOString().split("T")[0]
            : ""
        );
        setXp(existingTask.xp);
        setCredits(existingTask.credits || Math.floor(existingTask.xp / 4));
        setCategory(existingTask.category || "");
        if (projectId) {
          setAssignedTo(existingTask.assignedTo || null);
          setStatus(
            existingTask.status ||
              (projectColumns.length > 0 ? projectColumns[0].columnId : "todo")
          );
        }
      } else {
        setTitle("");
        setDescription("");
        setDueDate(defaultDate || "");
        setXp(20);
        setCredits(5);
        setCategory("");
        setAssignedTo(null);
        setStatus(
          projectColumns.length > 0 ? projectColumns[0].columnId : "todo"
        );
      }
    }
  }, [existingTask, isOpen, defaultDate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Mission Log title cannot be empty!");
      return;
    }
    onSave(
      {
        title,
        description,
        dueDate: dueDate || undefined,
        xp,
        credits,
        category,
        projectId: projectId,
        assignedTo: projectId ? assignedTo || null : null,
        status: projectId
          ? status ||
            (projectColumns.length > 0 ? projectColumns[0].columnId : "todo")
          : "todo",
      },
      existingTask?.taskId
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform scale-100 opacity-100 border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <FaTimes className="text-2xl" />
        </button>
        <h3 className="text-xl font-semibold text-indigo-300 mb-6 border-b border-gray-700 pb-3">
          {existingTask
            ? "Edit Mission Objective"
            : projectId
            ? "New Expedition Objective"
            : "New Personal Log"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="taskTitleModal"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taskTitleModal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="taskDescriptionModal"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description (Briefing)
            </label>
            <textarea
              id="taskDescriptionModal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="taskDueDateModal"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="taskDueDateModal"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="taskCategoryModal"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Category (Log Type)
              </label>
              <input
                type="text"
                id="taskCategoryModal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="E.g., Engineering, Exploration"
                className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="taskXpModal"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                XP Reward
              </label>
              <input
                type="number"
                id="taskXpModal"
                value={xp}
                onChange={(e) => setXp(parseInt(e.target.value, 10))}
                min="5"
                max="200"
                required
                className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="taskCreditsModal"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Cosmic Credits (Bonus)
              </label>
              <input
                type="number"
                id="taskCreditsModal"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value, 10))}
                min="0"
                max="100"
                className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {projectId &&
            projectMembers.length > 0 &&
            projectColumns.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="taskAssignedToModal"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Assign To Crew Member
                  </label>
                  <select
                    id="taskAssignedToModal"
                    value={assignedTo || ""}
                    onChange={(e) => setAssignedTo(e.target.value || null)}
                    className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {projectMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="taskStatusModal"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Objective Status
                  </label>
                  <select
                    id="taskStatusModal"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {projectColumns.map((col) => (
                      <option key={col.columnId} value={col.columnId}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="btn ">
              Cancel Transmission
            </button>
            <button type="submit" className="btn btn-primary">
              {existingTask ? (
                <FaSave className="mr-2" />
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              {existingTask
                ? "Save Changes"
                : projectId
                ? "Add Objective"
                : "Log Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
