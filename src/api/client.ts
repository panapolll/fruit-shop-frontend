import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { GATEWAY_URL } from "./config";

type RefreshHandler = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// App.tsx จะเรียกตอน token เปลี่ยน
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// App.tsx จะส่ง handleRefresh เข้ามา
export const setRefreshHandler = (handler: RefreshHandler) => {
  refreshHandler = handler;
};

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  refreshQueue = [];
};

// axios ตัวกลางสำหรับยิง Gateway
export const gatewayClient = axios.create({ baseURL: GATEWAY_URL });

// ทุก request แนบ access_token อัตโนมัติ
gatewayClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ถ้าได้ 401 → refresh แล้วลองใหม่
gatewayClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshHandler
    ) {
      return Promise.reject(error);
    }

    // ถ้ากำลัง refresh อยู่ รอคิว
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
        return Promise.reject(error);
      }

      accessToken = newToken;
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return gatewayClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
