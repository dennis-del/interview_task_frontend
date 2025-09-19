import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerParticipantApi,
  getUserRegistrationsApi,
} from "../../api/participant/eventParticipantApi";
import { getEventsApi } from "../../api/admin/eventApi"; 
import { useAuth } from "../../context/AuthContext";

// RegistrationDetailsModal (unchanged)
interface RegistrationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
}

const RegistrationDetailsModal: React.FC<RegistrationDetailsModalProps> = ({
  isOpen,
  onClose,
  registration,
}) => {
  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Registration Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {registration.event.title}
            </h3>
            <p className="text-gray-600">
              {registration.event.date} • {registration.event.time}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Venue:</span>
              <span className="font-medium">{registration.event.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Organizer:</span>
              <span className="font-medium">{registration.event.organiser}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registration Status:</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  registration.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {registration.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registered on:</span>
              <span className="font-medium">
                {new Date(registration.registeredAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ParticipantDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth(); // 🔹 Add logout from useAuth

  // 🔹 Load Events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getEventsApi,
    enabled: !!user,
  });

  // 🔹 Load User Registrations
  const {
    data: userRegistrations = [],
    isLoading: registrationsLoading,
  } = useQuery({
    queryKey: ["registrations", user?.email],
    queryFn: () => getUserRegistrationsApi(user?.email || ""),
    enabled: !!user?.email,
    select: (data) => {
      return data
        .filter((registration: any) => registration.event) // ✅ skip null events
        .map((registration: any) => ({
          id: registration.id,
          status: registration.status,
          registeredAt: registration.registeredAt || registration.createdAt,
          event: {
            id: registration.event.id,
            title: registration.event.title,
            date: registration.event.date,
            time: registration.event.time,
            venue: registration.event.venue,
            organiser: registration.event.organiser,
          },
        }));
    }    
  });

  // 🔹 Fixed Register Mutation
  const registerMutation = useMutation({
    mutationFn: registerParticipantApi,
    onSuccess: (data, variables) => {
      console.log("Registration successful:", data);
      
      // Invalidate both queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["registrations", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      
      // Show success message
      if (data.participant.status === "Waitlist") {
        alert("Event is full. You've been added to the waitlist.");
      } else {
        alert("Successfully registered for the event!");
      }
    },
    onError: (err: any) => {
      console.error("Registration failed - Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      // Check if it's actually a success disguised as an error
      if (err.response?.status === 201 || err.response?.data?.participant) {
        console.log("This looks like a success response, treating as success...");
        
        // Treat as success
        queryClient.invalidateQueries({ queryKey: ["registrations", user?.email] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        
        if (err.response.data.participant.status === "Waitlist") {
          alert("Event is full. You've been added to the waitlist.");
        } else {
          alert("Successfully registered for the event!");
        }
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      alert(errorMessage);
    },
  });

  // 🔹 Fixed handleRegister function
  const handleRegister = async (eventId: number) => {
    if (!user) {
      alert("Please log in to register for events.");
      return;
    }
    
    // Check if user is already registered for this event
    const isAlreadyRegistered = userRegistrations.some(
      (reg: any) => reg.event.id === eventId
    );
    
    if (isAlreadyRegistered) {
      alert("You are already registered for this event.");
      return;
    }

    // Check if already registering (prevent double clicks)
    if (registerMutation.isPending) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: user.name,
        email: user.email,
        eventId,
      });
    } catch (error: any) {
      // The error is already handled in onError, but let's add some backup logic
      console.error("Registration error in handleRegister:", error);
      
      // Check if this is actually a successful registration disguised as an error
      if (error.response?.status === 201 || error.response?.data?.participant) {
        console.log("Treating as successful registration despite error");
        // Force refresh the queries
        queryClient.invalidateQueries({ queryKey: ["registrations", user?.email] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    }
  };

  // UI States
  const [activeTab, setActiveTab] = useState<"browse" | "myRegistrations">(
    "browse"
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

  const handleViewDetails = (registration: any) => {
    setSelectedRegistration(registration);
    setIsDetailsModalOpen(true);
  };

  if (!user) {
    return <p className="p-6">Please log in to view events.</p>;
  }

  if (eventsLoading || registrationsLoading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* --- Header with Logout --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Event Dashboard</h1>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      {/* --- Tabs --- */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "browse"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Browse Events
        </button>
        <button
          onClick={() => setActiveTab("myRegistrations")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "myRegistrations"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          My Registrations ({userRegistrations.length})
        </button>
      </div>

      {/* --- Browse Events --- */}
      {activeTab === "browse" ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
              const isRegistered = userRegistrations.some(
                (reg: any) => reg.event.id === event.id
              );
              
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {event.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          event.status === "Open"
                            ? "bg-green-100 text-green-800"
                            : event.status === "Full"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {event.description}
                    </p>
                    <div className="text-sm text-gray-600 mb-2">
                      <p>📅 {event.date} • {event.time}</p>
                      <p>📍 {event.venue}</p>
                      <p>👤 {event.organiser}</p>
                    </div>
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={event.status !== "Open" || isRegistered || registerMutation.isPending}
                      className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                        isRegistered
                          ? "bg-green-600 cursor-not-allowed"
                          : event.status === "Open" && !registerMutation.isPending
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {registerMutation.isPending
                        ? "Registering..."
                        : isRegistered
                        ? "Already Registered"
                        : event.status === "Open"
                        ? "Register Now"
                        : "Event Full"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- My Registrations --- */
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            My Event Registrations
          </h2>
          {userRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">No registrations yet.</p>
              <button
                onClick={() => setActiveTab("browse")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Event
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userRegistrations.map((registration: any) => (
                    <tr key={registration.id}>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {registration.event?.title}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {registration.event?.date}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            registration.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {registration.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleViewDetails(registration)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Modal --- */}
      <RegistrationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        registration={selectedRegistration}
      />
    </div>
  );
};

export default ParticipantDashboard;