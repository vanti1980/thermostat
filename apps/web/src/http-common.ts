import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-type": "application/json",
  },
});

export default apiClient;
