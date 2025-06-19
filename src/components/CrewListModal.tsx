import React from "react";
import { FaTimes, FaUserClock, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { IconType } from "react-icons";
import { ProjectMember } from "../app/crew-projects/page";

interface InvitationData {
  invitee: {
    userId: string;
    name: string;
    avatarUrl: string;
  };
  status: string;
  role: string;
}

interface CrewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
  invitations: InvitationData[];
}

const statusInfo: {
  [key: string]: { icon: IconType; color: string; text: string };
} = {
  PENDING: { icon: FaUserClock, color: "text-yellow-400", text: "Pending" },
  ACCEPTED: { icon: FaUserCheck, color: "text-green-400", text: "Member" },
  REJECTED: { icon: FaUserTimes, color: "text-red-400", text: "Rejected" },
};

const CrewListModal: React.FC<CrewListModalProps> = ({
  isOpen,
  onClose,
  members,
  invitations,
}) => {
  if (!isOpen) return null;

  const memberList = members.map((m) => ({ ...m, status: "ACCEPTED" }));
  const invitationList = invitations.map((inv) => ({
    ...inv.invitee,
    role: inv.role,
    status: inv.status,
  }));

  const combinedList = [
    ...memberList,
    ...invitationList.filter((inv) => inv.status !== "ACCEPTED"),
  ];

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
      <div className="modal-content relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border-gray-700">
        <h3 className="text-xl font-semibold text-indigo-300 mb-4">
          Expedition Crew
        </h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <FaTimes />
        </button>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {combinedList.map((person) => {
            const StatusIcon = statusInfo[person.status]?.icon || FaUserCheck;
            const statusColor =
              statusInfo[person.status]?.color || "text-gray-400";
            return (
              <div
                key={person.userId}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-md"
              >
                <div className="flex items-center">
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    className="w-10 h-10 rounded-full mr-4 bg-gray-600"
                  />
                  <div>
                    <p className="font-semibold text-white">{person.name}</p>
                    <p className="text-sm text-gray-400">{person.role}</p>
                  </div>
                </div>
                <div
                  className={`flex items-center text-xs font-bold ${statusColor}`}
                >
                  <StatusIcon className="mr-2" />
                  <span>{person.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CrewListModal;
