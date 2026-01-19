import client from './client';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
    id: number;
    content: string;
    status: TaskStatus;
    displayOrder: number;
    memberId: number;
}

export const getMyTasks = async () => {
    const response = await client.get<Task[]>('/tasks');
    return response.data;
};

export const createTask = async (data: { content: string; status?: TaskStatus }) => {
    const response = await client.post('/tasks', data);
    return response.data;
};

export const deleteTask = async (id: number) => {
    await client.delete(`/tasks/${id}`);
};

export const moveTask = async (id: number, data: { status: TaskStatus; displayOrder: number }) => {
    await client.put(`/tasks/${id}/move`, data);
};
