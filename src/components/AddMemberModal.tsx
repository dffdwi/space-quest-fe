"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaTimes, FaSearch, FaUserPlus } from "react-icons/fa";
import api from "@/lib/api";
import { User } from "@/contexts/AuthContext";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (userId: string, role?: string) => void;
  projectName?: string;
  existingMembers: { userId: string }[];
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  projectName,
  existingMembers,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState("Crew Member");
  const [isLoading, setIsLoading] = useState(false);

  const existingMemberIds = useMemo(
    () => new Set(existingMembers.map((m) => m.userId)),
    [existingMembers]
  );

  const searchUsers = useCallback(
    async (query: string) => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const response = await api.get(`/users?q=${query}`);
        const potentialMembers = response.data.filter(
          (user: User) => !existingMemberIds.has(user.userId)
        );
        setUsers(potentialMembers);
      } catch (error) {
        console.error("Gagal mencari pengguna:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isOpen, existingMemberIds]
  );

  useEffect(() => {
    searchUsers("");
  }, [isOpen, searchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  const handleAddClick = () => {
    if (selectedUser) {
      onAddMember(selectedUser.userId, role);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border-gray-700">
        <h3 className="text-xl font-semibold text-indigo-300 mb-4">
          Add Member to {projectName}
        </h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <FaTimes />
        </button>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field flex-grow"
          />
          <button type="submit" className="btn btn-primary">
            <FaSearch />
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoading && <p>Searching...</p>}
          {!isLoading &&
            users.map((user) => (
              <div
                key={user.userId}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                  selectedUser?.userId === user.userId
                    ? "bg-indigo-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            ))}
        </div>

        {selectedUser && (
          <div className="mt-4 border-t border-gray-600 pt-4">
            <p className="mb-2">
              Set role for <strong>{selectedUser.name}</strong>:
            </p>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-full"
            />
          </div>
        )}

        <div className="flex justify-end pt-6 space-x-3">
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button
            onClick={handleAddClick}
            disabled={!selectedUser}
            className="btn btn-primary"
          >
            <FaUserPlus className="mr-2" /> Add to Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
