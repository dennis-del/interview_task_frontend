// src/api/viewParticipantApi.ts
import axiosIns from "../../services/axiosIns";

export interface ParticipantPayload {
  id: number;
  name: string;
  email: string;
  status: "Confirmed" | "Waitlist";
  createdAt: string;
  updatedAt: string;
  eventId?: number; // optional to pass along with participant
}

// ✅ Get participants of an event
export const getParticipantsApi = async (eventId: number) => {
  try {
    const response = await axiosIns.get<ParticipantPayload[]>(
      `/participants/${eventId}`
    );
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// ✅ Bulk update participant status
export const bulkUpdateParticipantsApi = async (ids: number[], status: "Confirmed" | "Waitlist") => {
  try {
    const response = await axiosIns.put(`/participants/bulk-update`, {
      ids,
      status,
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
