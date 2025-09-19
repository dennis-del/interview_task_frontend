// src/components/admin/ParticipantsModal.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getParticipantsApi,
  bulkUpdateParticipantsApi,
  type ParticipantPayload,
} from "../../api/admin/viewParticipantApi";

export interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  participants: ParticipantPayload[];
  onBulkUpdate: (ids: number[], status: "Confirmed" | "Waitlist") => void;
  isLoading: boolean;
}


const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ✅ Fetch participants for this event
  const {
    data: participants = [],
    isLoading,
    isError,
  } = useQuery<ParticipantPayload[]>({
    queryKey: ["participants", eventId],
    queryFn: () => getParticipantsApi(eventId),
    enabled: isOpen, // fetch only when modal is open
  });

  // ✅ Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { ids: number[]; status: "Confirmed" | "Waitlist" }) =>
      bulkUpdateParticipantsApi(data.ids, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
      setSelectedIds([]);
    },
  });

  if (!isOpen) return null;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = (status: "Confirmed" | "Waitlist") => {
    if (selectedIds.length === 0) return;
    bulkUpdateMutation.mutate({ ids: selectedIds, status });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Participants</h2>

        {isLoading && <p>Loading participants...</p>}
        {isError && <p className="text-red-500">Failed to load participants</p>}

        {!isLoading && participants.length > 0 && (
          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="border-b">
                <th className="py-2">Select</th>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.email}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        p.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Bulk Action Buttons */}
        <div className="flex justify-between">
          <div className="space-x-2">
            <button
              onClick={() => handleBulkUpdate("Confirmed")}
              disabled={bulkUpdateMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Set Confirmed
            </button>
            <button
              onClick={() => handleBulkUpdate("Waitlist")}
              disabled={bulkUpdateMutation.isPending}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Set Waitlist
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;
