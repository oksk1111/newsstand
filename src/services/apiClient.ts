import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTokenFromStorage, removeTokenFromStorage } from '@/utils/storage';
import { ApiError } from '@/types';

class ApiClient {
    private client: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = __DEV__
            ? 'http://localhost:3000/api'
            : 'https://your-production-api.com/api';

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            async (config) => {
                const token = await getTokenFromStorage();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    await removeTokenFromStorage();
                    // You might want to redirect to login screen here
                }

                const apiError: ApiError = {
                    error: error.response?.data?.error || 'Network Error',
                    message: error.response?.data?.message || error.message,
                    details: error.response?.data?.details,
                };

                return Promise.reject(apiError);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    // Update base URL (useful for switching between environments)
    updateBaseURL(newBaseURL: string) {
        this.baseURL = newBaseURL;
        this.client.defaults.baseURL = `${newBaseURL}/api`;
    }

    // Get current base URL
    getBaseURL(): string {
        return this.baseURL;
    }
}

export const apiClient = new ApiClient();
