import { gatewayClient } from "./client";

export const chargePayment = async (orderId: string, token: string) => {
  const response = await gatewayClient.post("/payments/charge", {
    orderId,
    token,
  });
  return response.data;
};
