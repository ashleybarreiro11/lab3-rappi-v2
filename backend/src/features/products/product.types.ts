export interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
}

export interface CreateProductDTO {
  store_id: string;
  name: string;
  price: number;
}
