import { gatewayClient } from "./client";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
}

export const checkout = async (): Promise<Order> => {
  const response = await gatewayClient.post("/orders/checkout");
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await gatewayClient.get<Order[]>("/orders/me");
  return response.data;
};
