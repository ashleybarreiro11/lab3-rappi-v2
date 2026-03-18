import { api } from "./api";

interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

interface CreateOrderDTO {
  store_id: string;
  items: OrderItemDTO[];
}

export const createOrder = async (payload: CreateOrderDTO) => {
  const response = await api.post("/orders", payload);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

export const getAvailableOrders = async () => {
  const response = await api.get("/orders/available/list");
  return response.data;
};

export const acceptOrder = async (orderId: string) => {
  const response = await api.patch(`/orders/${orderId}/accept`);
  return response.data;
};

export const getMyDeliveries = async () => {
  const response = await api.get("/orders/my-deliveries/list");
  return response.data;
};

export const getStoreOrders = async () => {
  const response = await api.get("/orders/store/list");
  return response.data;
};

export const rejectOrder = async (orderId: string) => {
  const response = await api.patch(`/orders/${orderId}/reject`);
  return response.data;
};
