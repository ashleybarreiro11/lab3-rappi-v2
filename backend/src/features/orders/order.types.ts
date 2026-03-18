export interface Order {
  id: string;
  user_id: string;
  store_id: string;
  delivery_id: string | null;
  created_at?: string;
}

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

export interface CreateOrderDTO {
  user_id: string;
  store_id: string;
  items: OrderItemDTO[];
}
