// src/api/authApi.ts
import axiosIns from "../services/axiosIns"; // your axios instance

// Signup API
export const signupApi = async (data: {
  name: string;
  email: string;
  password: string;
  role?: "Participant" | "Admin";
}) => {
  try {
    const response = await axiosIns.post("/auth/signup", data);
    return response.data;
  } catch (err: any) {
    // Optional: handle errors nicely
    throw err.response?.data || err;
  }
};

// Login API
export const loginApi = async (data: { email: string; password: string }) => {
  try {
    const response = await axiosIns.post("/auth/login", data);
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
