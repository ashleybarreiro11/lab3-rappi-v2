import { api } from "./api";

interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

interface CreateOrderDTO {
  store_id: string;
  items: OrderItemDTO[];
  delivery_latitude: number;
  delivery_longitude: number;
}

export const createOrder = async (payload: CreateOrderDTO) => {
  const response = await api.post("/orders", payload);
  return response.data;
};

export const getOrderDetails = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
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


export const updateDeliveryLocation = async (
  orderId: string,
  latitude: number,
  longitude: number,
) => {
  const response = await api.put(`/orders/${orderId}/location`, {
    latitude,
    longitude,
  });
  return response.data;
};

export const getDeliveryLocation = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}/location`);
  return response.data;
};

export const markOrderDelivered = async (orderId: string) => {
  const response = await api.patch(`/orders/${orderId}/deliver`);
  return response.data;
};

export const getStoreLocation = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}/store-location`);
  return response.data;
};

