import { User, AuthResponse } from '../types/index';

class AuthServiceClass {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    async login(request: { email: string; password: string }): Promise<AuthResponse> {
        // 더미 로그인 응답
        return {
            success: true,
            message: '로그인 성공',
            token: 'dummy-token-' + Date.now(),
            user: {
                id: '1',
                email: request.email,
                name: '테스트 사용자',
                isGuest: false,
                preferences: {
                    categories: ['technology', 'business'],
                    language: 'ko',
                    theme: 'auto',
                    notifications: {
                        enabled: true,
                        frequency: 'daily'
                    }
                },
                lastActive: new Date().toISOString()
            }
        };
    }

    async register(request: { email: string; password: string; name?: string }): Promise<AuthResponse> {
        // 더미 회원가입 응답
        return {
            success: true,
            message: '회원가입 성공',
            token: 'dummy-token-' + Date.now(),
            user: {
                id: '2',
                email: request.email,
                name: request.name || '새 사용자',
                isGuest: false,
                preferences: {
                    categories: ['general'],
                    language: 'ko',
                    theme: 'auto',
                    notifications: {
                        enabled: true,
                        frequency: 'daily'
                    }
                },
                lastActive: new Date().toISOString()
            }
        };
    }

    async createGuestSession(): Promise<AuthResponse> {
        // 더미 게스트 세션 응답
        return {
            success: true,
            message: '게스트 세션 생성 성공',
            token: 'guest-token-' + Date.now(),
            user: {
                id: 'guest-' + Date.now(),
                name: '게스트 사용자',
                isGuest: true,
                guestId: 'guest-' + Date.now(),
                preferences: {
                    categories: ['general'],
                    language: 'ko',
                    theme: 'auto',
                    notifications: {
                        enabled: false,
                        frequency: 'daily'
                    }
                },
                lastActive: new Date().toISOString()
            }
        };
    }

    async getCurrentUser(): Promise<User> {
        // 더미 사용자 정보
        return {
            id: '1',
            email: 'test@example.com',
            name: '테스트 사용자',
            isGuest: false,
            preferences: {
                categories: ['technology', 'business'],
                language: 'ko',
                theme: 'auto',
                notifications: {
                    enabled: true,
                    frequency: 'daily'
                }
            },
            lastActive: new Date().toISOString()
        };
    }

    async logout(): Promise<void> {
        // 로그아웃 처리
        this.token = null;
    }

    async refreshToken(): Promise<{ token: string }> {
        // 토큰 갱신
        return {
            token: 'refreshed-token-' + Date.now()
        };
    }

    async convertGuestToUser(email: string, password: string, name?: string): Promise<AuthResponse> {
        // 게스트를 일반 사용자로 전환
        return this.register({ email, password, name });
    }
}

export const AuthService = new AuthServiceClass();
