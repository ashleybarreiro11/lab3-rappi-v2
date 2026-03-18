import { api } from "./api";

interface CreateProductDTO {
  name: string;
  price: number;
}

export const getProductsByStore = async (storeId: string) => {
  const response = await api.get(`/products/store/${storeId}`);
  return response.data;
};

export const createProduct = async (payload: CreateProductDTO) => {
  const response = await api.post("/products", payload);
  return response.data;
};
