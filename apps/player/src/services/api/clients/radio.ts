import { apiUrl } from '@/services/env';
import { authStorage } from '@/services/storage';
import axios, { type AxiosInstance } from 'axios';

const createHttpClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for authentication
  client.interceptors.request.use((config) => {
    const token = authStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        authStorage.clearToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const radioApiClient = createHttpClient(apiUrl);
