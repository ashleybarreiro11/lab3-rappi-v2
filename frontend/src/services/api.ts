import axios from "axios";

export const api = axios.create({
  baseURL: "https://lab3-rappi-v2.vercel.app/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
