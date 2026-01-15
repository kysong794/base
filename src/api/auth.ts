import client from './client';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types/auth';

export const login = async (data: LoginRequest) => {
    const response = await client.post<AuthResponse>('/auth/login', data);
    return response.data;
};

export const signup = async (data: SignupRequest) => {
    const response = await client.post('/auth/signup', data);
    return response.data;
};
