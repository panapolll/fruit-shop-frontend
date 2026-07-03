import { gatewayClient } from "./client";

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export const createProduct = async (data: CreateProductInput) => {
  const response = await gatewayClient.post("/products", data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await gatewayClient.delete(`/products/${id}`);
  return response.data;
};
