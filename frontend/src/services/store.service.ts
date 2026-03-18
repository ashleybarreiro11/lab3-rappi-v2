import { api } from "./api";

export const getStores = async () => {
  const response = await api.get("/stores");
  return response.data;
};

export const getMyStore = async () => {
  const response = await api.get("/stores/me");
  return response.data;
};

export const updateMyStoreStatus = async (is_open: boolean) => {
  const response = await api.patch("/stores/me/status", { is_open });
  return response.data;
};
