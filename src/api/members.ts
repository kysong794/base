
import client from './client';
import type { MemberResponse, Role } from '../types/member';

export const getMembers = async (): Promise<MemberResponse[]> => {
    const response = await client.get('/members');
    return response.data;
};

export const updateMemberRole = async (id: number, role: Role): Promise<void> => {
    await client.put(`/members/${id}/role`, { role });
};

export const changePassword = async (data: any): Promise<void> => {
    await client.put('/members/password', data);
};
