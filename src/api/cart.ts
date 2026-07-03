import { gatewayClient } from "./client";

export interface CartItem {
  productId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
  };
  quantity: number;
  _id: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export const getCart = async (): Promise<Cart> => {
  const response = await gatewayClient.get<Cart>("/cart");
  return response.data;
};

export const addToCart = async (productId: string, quantity: number) => {
  const response = await gatewayClient.post("/cart/items", {
    productId,
    quantity,
  });
  return response.data;
};

export const removeFromCart = async (productId: string) => {
  const response = await gatewayClient.delete(`/cart/items/${productId}`);
  return response.data;
};
