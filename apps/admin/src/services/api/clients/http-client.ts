import { apiUrl } from '@/services/env';
import axios, { type AxiosInstance } from 'axios';

const createHttpClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for authentication
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('wave_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);

      // Handle unauthorized access
      if (error.response?.status === 401) {
        localStorage.removeItem('wave_auth_token');
        // Trigger auth state update
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      return Promise.reject(error);
    },
  );

  return client;
};

export const waveApiClient = createHttpClient(apiUrl);
