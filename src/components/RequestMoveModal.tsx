"use client";

import React, { useState, FormEvent } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

interface RequestMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  taskTitle: string;
  targetColumnName: string;
}

const RequestMoveModal: React.FC<RequestMoveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
  targetColumnName,
}) => {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(message);
    setMessage("");
  };

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
          Request to Move Task
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          You are requesting to move "<strong>{taskTitle}</strong>" to the "
          <strong>{targetColumnName}</strong>" column.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="moveMessage"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Add a message (Optional)
            </label>
            <textarea
              id="moveMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="input-field w-full"
              placeholder="e.g., 'Development is complete, ready for review.'"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FaPaperPlane className="mr-2" />
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestMoveModal;
