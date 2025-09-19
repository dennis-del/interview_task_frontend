import axios from "axios";
 
 
const baseURL = "http://localhost:9001";
 
 
const axiosIns = axios.create({
  baseURL: baseURL,
  withCredentials:true, 
  headers: {
    "Content-Type": "application/json",
  },
});
 
export default axiosIns;