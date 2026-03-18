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
  if (token) {
    localStorage.setItem("token", token);
  }
  return response.data;
};

export const register = async (payload: RegisterDTO) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
