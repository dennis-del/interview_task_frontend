import axios from "axios";
 
 
const baseURL = "https://interview-task-backend-shrc.onrender.com";
 
 
const axiosIns = axios.create({
  baseURL: baseURL,
  withCredentials:true, 
  headers: {
    "Content-Type": "application/json",
  },
});
 
export default axiosIns;