export enum UserRole {
  CONSUMER = "consumer",
  STORE = "store",
  DELIVERY = "delivery",
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
  name?: string | null;
  address?: string | null;
  storeName?: string | null;
}

export interface AuthenticateUserDTO {
  email: string;
  password: string;
}
