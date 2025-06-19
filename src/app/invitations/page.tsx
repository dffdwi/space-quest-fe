"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { FaEnvelopeOpenText, FaCheck, FaTimes, FaRocket } from "react-icons/fa";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Invitation {
  invitationId: string;
  projectId: string;
  role: string;
  project: {
    name: string;
  };
  inviter: {
    name: string;
  };
}

export default function InvitationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await api.get("/invitations");
        setInvitations(response.data);
      } catch (error) {
        console.error("Gagal mengambil undangan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvitations();
  }, [user]);

  const handleResponse = async (
    invitationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      await api.put(`/invitations/${invitationId}/${action}`);
      setInvitations((prev) =>
        prev.filter((inv) => inv.invitationId !== invitationId)
      );
      window.showGlobalNotification?.({
        type: "success",
        title: `Invitation ${action === "accept" ? "Accepted" : "Rejected"}`,
        message: `You have successfully ${action}ed the invitation.`,
      });
      if (action === "accept") {
        const acceptedInvitation = invitations.find(
          (inv) => inv.invitationId === invitationId
        );
        if (acceptedInvitation) {
          router.push(`/crew-projects`);
        }
      }
    } catch (error: any) {
      window.showGlobalNotification?.({
        type: "error",
        title: "Action Failed",
        message:
          error.response?.data?.message || "Could not process your response.",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl">Loading Your Invitations...</p>
      </div>
    );
  }

  return (
    <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center mb-6">
        <FaEnvelopeOpenText className="text-3xl text-sky-400 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
          Project Invitations
        </h1>
      </div>

      <div className="space-y-4">
        {invitations.length > 0 ? (
          invitations.map((inv) => (
            <div
              key={inv.invitationId}
              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-700/70 rounded-lg border border-gray-600"
            >
              <div className="mb-3 sm:mb-0">
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold text-white">
                    {inv.inviter.name}
                  </span>{" "}
                  has invited you to join the expedition:
                </p>
                <p className="text-lg font-bold text-indigo-300">
                  {inv.project.name}
                </p>
                <p className="text-xs text-gray-400">As: {inv.role}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleResponse(inv.invitationId, "reject")}
                  className="btn btn-danger !px-4 !py-2 flex items-center"
                  title="Reject"
                >
                  <FaTimes className="mr-2" /> Reject
                </button>
                <button
                  onClick={() => handleResponse(inv.invitationId, "accept")}
                  className="btn btn-success !px-4 !py-2 flex items-center"
                  title="Accept"
                >
                  <FaCheck className="mr-2" /> Accept
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            You have no pending invitations.
          </p>
        )}
      </div>
    </div>
  );
}
