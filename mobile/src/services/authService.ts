import { apiClient } from './apiClient';
import { AuthResponse, User } from '@/types';

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
  }

  async createGuestSession(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/guest');
  }

  async convertGuestToUser(email: string, password: string, name?: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/guest/convert', {
      email,
      password,
      name,
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return response.user;
  }

  async refreshToken(): Promise<{ success: boolean; token: string }> {
    return apiClient.post<{ success: boolean; token: string }>('/auth/refresh');
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout');
  }
}

export const authService = new AuthService();
