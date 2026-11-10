import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

type ApiClientInstance = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        if (error.response?.status === 401 && error.config && !error.config._retry) {
          error.config._retry = true;
          // 尝试刷新token
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (refreshToken) {
            let response;
            try {
              response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                { refreshToken },
                { timeout: 30000 }
              );
            } catch (refreshError) {
              // Only an authentication rejection from refresh invalidates tokens.
              if (axios.isAxiosError(refreshError) &&
                  (refreshError.response?.status === 401 || refreshError.response?.status === 403)) {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
              }
              return Promise.reject(refreshError);
            }
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            await SecureStore.setItemAsync('accessToken', accessToken);
            if (newRefreshToken) {
              await SecureStore.setItemAsync('refreshToken', newRefreshToken);
            }

            // Keep retry errors outside refresh handling; _retry bounds this to one attempt.
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return this.client.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance as ApiClientInstance;
