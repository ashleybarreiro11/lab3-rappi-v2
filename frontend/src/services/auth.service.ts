import { api } from "./api";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  role: "consumer" | "store" | "delivery";
  name?: string;
  address?: string;
  storeName?: string;
}

export const login = async (credentials: LoginDTO) => {
  const response = await api.post("/auth/login", credentials);
  const token = response.data?.session?.access_token;
  const refreshToken = response.data?.session?.refresh_token;
  const role = response.data?.user?.user_metadata?.role;
  const name = response.data?.user?.user_metadata?.name;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  if (token) localStorage.setItem("token", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (role) localStorage.setItem("role", role);
  if (name) localStorage.setItem("name", name);
  return response.data;
};

export const register = async (payload: RegisterDTO) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
};
