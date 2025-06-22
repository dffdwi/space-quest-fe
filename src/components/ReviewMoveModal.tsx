"use client";

import React from "react";
import { FaTimes, FaCheck, FaBan } from "react-icons/fa";
import { PlayerTask } from "@/hooks/useGameData";

interface ReviewMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReview: (action: "approve" | "reject") => void;
  task: PlayerTask;
  requesterName: string;
  targetColumnName: string;
}

const ReviewMoveModal: React.FC<ReviewMoveModalProps> = ({
  isOpen,
  onClose,
  onReview,
  task,
  requesterName,
  targetColumnName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <FaTimes />
        </button>
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">
          Review Move Request
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          <strong>{requesterName}</strong> is requesting to move the task "
          <strong>{task.title}</strong>" to the "
          <strong>{targetColumnName}</strong>" column.
        </p>

        {task.statusChangeMessage && (
          <blockquote className="border-l-4 border-yellow-500 bg-yellow-900/30 p-3 rounded-r-lg mb-4">
            <p className="text-sm italic text-yellow-200">
              "{task.statusChangeMessage}"
            </p>
          </blockquote>
        )}

        <div className="flex justify-end pt-4 space-x-3">
          <button onClick={() => onReview("reject")} className="btn btn-danger">
            <FaBan className="mr-2" />
            Reject
          </button>
          <button
            onClick={() => onReview("approve")}
            className="btn btn-success"
          >
            <FaCheck className="mr-2" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewMoveModal;
