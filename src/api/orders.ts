import { gatewayClient } from "./client";

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const checkout = async (): Promise<Order> => {
  const response = await gatewayClient.post<Order>("/orders/checkout");
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await gatewayClient.get<Order[]>("/orders/me");
  return response.data;
};
