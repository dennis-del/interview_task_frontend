// src/api/eventApi.ts
import axiosIns from "../../services/axiosIns";

export interface EventPayload {
  title: string;
  description: string;
  image?: string;
  date: string;
  time: string;
  venue: string;
  organiser: string;
  participantLimit: number;
  status: "Confirmed" | "Waitlist";
}

export interface EventResponse extends EventPayload {
    id: number;
    participants: number;
    waitlist: number;
  }

// ✅ Create Event
export const createEventApi = async (data: EventPayload) => {
  try {
    const response = await axiosIns.post("/events", data);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// ✅ Get All Events
export const getEventsApi = async () => {
  try {
    const response = await axiosIns.get("/events");
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// ✅ Get Single Event
export const getEventApi = async (id: number) => {
  try {
    const response = await axiosIns.get(`/events/${id}`);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// ✅ Update Event
export const updateEventApi = async (id: number, data: EventPayload) => {
  try {
    const response = await axiosIns.put(`/events/${id}`, data);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// ✅ Delete Event
export const deleteEventApi = async (id: number) => {
  try {
    const response = await axiosIns.delete(`/events/${id}`);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
