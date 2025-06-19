"use client";

import React, { useState, FormEvent } from "react";
import { FaTimes, FaRocket } from "react-icons/fa";

interface AddExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
}

const AddExpeditionModal: React.FC<AddExpeditionModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Expedition name cannot be empty!");
      return;
    }
    onSave({ name, description });
    setName("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <FaTimes className="text-2xl" />
        </button>
        <h3 className="text-xl font-semibold text-indigo-300 mb-6 border-b border-gray-700 pb-3">
          Chart a New Expedition
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="expeditionName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Expedition Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="expeditionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Voyage to the Crimson Nebula"
            />
          </div>
          <div>
            <label
              htmlFor="expeditionDescription"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Briefing (Optional)
            </label>
            <textarea
              id="expeditionDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the main objectives of this expedition..."
            />
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FaRocket className="mr-2" />
              Launch Expedition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpeditionModal;
