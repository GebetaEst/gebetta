export enum UserRole {
  USER = 'user',
  RESTAURANT_OWNER = 'restaurant_owner',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId?: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
}
