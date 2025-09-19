// src/pages/admin/AdminDashboard.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventsApi,
  deleteEventApi,
  type EventResponse,
} from "../../api/admin/eventApi";
import {
  getParticipantsApi,
  bulkUpdateParticipantsApi,
  type ParticipantPayload,
} from "../../api/admin/viewParticipantApi";
import EventFormModal from "../../components/admin/EventFormModal";
import ParticipantsModal from "../../components/admin/ParticipantsModal";

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventResponse | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery<EventResponse[]>({
    queryKey: ["events"],
    queryFn: getEventsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // Participants query - only fetch when modal is open
  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
  } = useQuery<ParticipantPayload[]>({
    queryKey: ["participants", selectedEventId],
    queryFn: () => {
      if (!selectedEventId) return [];
      return getParticipantsApi(selectedEventId);
    },
    enabled: !!selectedEventId && isParticipantsModalOpen, // Only fetch when modal is open
  });

  // Bulk update participants mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({
      ids,
      status,
    }: {
      ids: number[];
      status: "Confirmed" | "Waitlist";
    }) => bulkUpdateParticipantsApi(ids, status),
    onSuccess: () => {
      // Invalidate both participants and events queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["participants", selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;

  // Stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e: any) => new Date(e.date) > new Date()
  ).length;
  const totalParticipants = events.reduce(
    (sum: number, e: any) => sum + e.participants,
    0
  );
  const totalWaitlist = events.reduce(
    (sum: number, e: any) => sum + e.waitlist,
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Events</h3>
          <p className="text-2xl font-bold">{totalEvents}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
          <p className="text-2xl font-bold">{upcomingEvents}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Participants</h3>
          <p className="text-2xl font-bold">{totalParticipants}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Waitlist</h3>
          <p className="text-2xl font-bold">{totalWaitlist}</p>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Events</h2>
          <button
            onClick={() => {
              setEditEvent(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Create Event
          </button>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-4 px-2">Image</th>
              <th className="py-4 px-2">Title</th>
              <th className="py-4 px-2">Description</th>
              <th className="py-4 px-2">Date</th>
              <th className="py-4 px-2">Time</th>
              <th className="py-4 px-2">Venue</th>
              <th className="py-4 px-2">Organiser</th>
              <th className="py-4 px-2">Limit</th>
              <th className="py-4 px-2">Status</th>
              <th className="py-4 px-2">Participants</th>
              <th className="py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: any) => (
              <tr
                key={event.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-2">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                </td>
                <td className="py-4 px-2 font-medium text-gray-900">
                  {event.title}
                </td>
                <td className="py-4 px-2 text-gray-700 max-w-xs">
                  {event.description}
                </td>
                <td className="py-4 px-2 text-gray-600">{event.date}</td>
                <td className="py-4 px-2 text-gray-600">{event.time}</td>
                <td className="py-4 px-2 text-gray-700">{event.venue}</td>
                <td className="py-4 px-2 text-gray-700">{event.organiser}</td>
                <td className="py-4 px-2 text-center">
                  {event.participantLimit}
                </td>
                <td className="py-4 px-2">
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium
    ${event.status === "Confirmed" ? "bg-green-100 text-green-800" : ""}
    ${event.status === "Waitlist" ? "bg-yellow-100 text-yellow-800" : ""}
    ${event.status === "Full" ? "bg-red-100 text-red-800" : ""}
    ${event.status === "Expired" ? "bg-gray-300 text-gray-700" : ""}
  `}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="py-4 px-2 text-center font-semibold">
                  {event.participants}
                </td>
                <td className="py-4 px-2 space-y-2 min-w-[200px]">
                  <button
                    onClick={() => {
                      setEditEvent(event);
                      setIsModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(event.id)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setIsParticipantsModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    View Participants
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editEvent || undefined}
      />

      {/* Participants Modal */}
      {selectedEventId && (
        <ParticipantsModal
          isOpen={isParticipantsModalOpen}
          onClose={() => {
            setIsParticipantsModalOpen(false);
            setSelectedEventId(null);
          }}
          eventId={selectedEventId}
          participants={participants}
          onBulkUpdate={(ids, status) => {
            bulkUpdateMutation.mutate({ ids, status });
          }}
          isLoading={bulkUpdateMutation.isPending || isLoadingParticipants}
        />
      )}
    </div>
  );
};

export default AdminDashboard;