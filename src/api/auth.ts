import axios from "axios";
import { AUTH_API_URL, GATEWAY_URL } from "./config";

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${AUTH_API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const register = async (email: string, password: string) => {
  const response = await axios.post(`${AUTH_API_URL}/auth/register`, {
    email,
    password,
  });
  return response.data;
};

export const refreshToken = async (userId: string, refreshToken: string) => {
  const response = await axios.post(`${GATEWAY_URL}/auth/refresh`, {
    userId,
    refreshToken,
  });
  return response.data;
};

// พึ่งทำโดย cursor

export const getUserIdFromToken = (accessToken: string): string => {
  const payload = JSON.parse(atob(accessToken.split(".")[1])) as {
    sub: string;
  };
  return payload.sub;
};
