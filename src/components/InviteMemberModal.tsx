"use client";

import React, { useState, FormEvent } from "react";
import { FaTimes, FaUserPlus, FaPaperPlane } from "react-icons/fa";

export interface NewMemberData {
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (memberData: NewMemberData) => void;
  projectName?: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  projectName,
}) => {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Member's name cannot be empty!");
      return;
    }
    onInvite({
      name,
      avatarUrl:
        avatarUrl.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random&color=fff&size=40`,
      role: role.trim() || "Crew Member",
    });
    setName("");
    setAvatarUrl("");
    setRole("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform scale-100 opacity-100 border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="text-2xl" />
        </button>
        <h3 className="text-xl font-semibold text-indigo-300 mb-1">
          <FaUserPlus className="inline mr-2" /> Invite New Crew Member
        </h3>
        {projectName && (
          <p className="text-sm text-gray-400 mb-6">
            to expedition: <span className="font-semibold">{projectName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="memberName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Crew Member Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="memberName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="E.g., Commander Nova"
            />
          </div>
          <div>
            <label
              htmlFor="memberAvatarUrl"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Avatar URL (Comms Channel Image - Optional)
            </label>
            <input
              type="url"
              id="memberAvatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label
              htmlFor="memberRole"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Role / Designation (Optional)
            </label>
            <input
              type="text"
              id="memberRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="E.g., Science Officer, Pilot"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="btn">
              Cancel Transmission
            </button>
            <button type="submit" className="btn btn-primary">
              <FaPaperPlane className="mr-2" /> Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
