export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}

export type Role = 'USER' | 'ADMIN';

export interface MemberResponse {
    id: number;
    email: string;
    nickname: string;
    role: Role;
    createdAt: string;
}
