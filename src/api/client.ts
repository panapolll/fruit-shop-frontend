import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { GATEWAY_URL } from "./config";

type RefreshHandler = () => Promise<string | null>;
type LogoutHandler = () => void;

let accessToken: string | null = localStorage.getItem("access_token");
let refreshHandler: RefreshHandler | null = null;
let logoutHandler: LogoutHandler | null = null;
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setRefreshHandler = (handler: RefreshHandler) => {
  refreshHandler = handler;
};

export const setLogoutHandler = (handler: LogoutHandler) => {
  logoutHandler = handler;
};

const forceLogout = () => {
  accessToken = null;
  logoutHandler?.();
};

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  refreshQueue = [];
};

export const gatewayClient = axios.create({ baseURL: GATEWAY_URL });

gatewayClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

gatewayClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // retry แล้วยัง 401 หรือไม่มี refreshHandler → logout
    if (originalRequest._retry || !refreshHandler) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(gatewayClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshHandler();
      if (!newToken) {
        processQueue(new Error("refresh failed"));
        forceLogout();
        return Promise.reject(error);
      }

      accessToken = newToken;
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return gatewayClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
