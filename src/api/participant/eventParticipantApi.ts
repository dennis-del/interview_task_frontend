// src/api/eventParticipantApi.ts
import axiosIns from "../../services/axiosIns";

// ✅ Request payload when registering
export interface RegisterPayload {
  name: string;
  email: string;
  eventId: number;
}

// ✅ Response after registering
export interface RegisterResponse {
  message: string;
  participant: {
    id: number;
    name: string;
    email: string;
    status: "Confirmed" | "Waitlist";
    eventId: number;
    createdAt: string;
    updatedAt: string;
  };
}

// ✅ User registration response
export interface UserRegistration {
  id: number;
  status: "Confirmed" | "Waitlist";
  registeredAt: string;
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    organiser: string;
  };
}

// --- API functions ---

// Register for an event
export const registerParticipantApi = async (data: RegisterPayload): Promise<RegisterResponse> => {
  try {
    console.log("Sending registration request:", data);
    
    const response = await axiosIns.post<RegisterResponse>(
      "/event-participant/register",
      data
    );
    
    console.log("Registration response:", response);
    console.log("Registration response status:", response.status);
    console.log("Registration response data:", response.data);
    
    return response.data;
  } catch (err: any) {
    console.error("Registration API error - Full error:", err);
    console.error("Registration API error - Response:", err.response);
    console.error("Registration API error - Status:", err.response?.status);
    console.error("Registration API error - Data:", err.response?.data);
    
    // If it's a 201 status (created), it might be a success
    if (err.response?.status === 201) {
      console.log("Status 201 detected, this should be a success");
      return err.response.data;
    }
    
    throw err;
  }
};

// Get all registrations for a user
export const getUserRegistrationsApi = async (email: string): Promise<UserRegistration[]> => {
  try {
    console.log("Fetching registrations for:", email);
    
    const response = await axiosIns.get<UserRegistration[]>(
      `/event-participant/registrations/${email}`
    );
    
    console.log("User registrations response:", response.data);
    
    return response.data;
  } catch (err: any) {
    console.error("Get registrations API error:", err);
    throw err.response?.data || err;
  }
};