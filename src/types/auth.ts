export interface User {
    email: string;
    nickname: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    accessToken: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
