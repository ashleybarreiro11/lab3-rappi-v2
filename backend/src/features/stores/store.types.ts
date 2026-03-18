export interface Store {
  id: string;
  user_id: string;
  name: string;
  is_open: boolean;
}

export interface CreateStoreDTO {
  user_id: string;
  name: string;
}
