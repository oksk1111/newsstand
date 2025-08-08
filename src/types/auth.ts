export interface User {
    id: string;
    email?: string;
    name: string;
    isGuest?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
    message?: string;
}
