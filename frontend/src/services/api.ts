import axios from "axios";

export const api = axios.create({
  baseURL: "https://lab3-rappi-v2.vercel.app/api",
  // baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refresh_token: refreshToken },
      );

      const newAccessToken = data.session.access_token;
      const newRefreshToken = data.session.refresh_token;

      localStorage.setItem("token", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      pendingRequests.forEach((cb) => cb(newAccessToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
