import client from './client';

export interface Category {
    id: number;
    name: string;
}

export const getCategories = async () => {
    const response = await client.get<Category[]>('/categories');
    return response.data;
};

export const createCategory = async (data: { name: string }) => {
    const response = await client.post('/categories', data);
    return response.data;
};

export const deleteCategory = async (id: number) => {
    await client.delete(`/categories/${id}`);
};

export const migrateCategory = async (data: { fromId: number; targetId: number }) => {
    await client.post(`/categories/${data.fromId}/migrate?targetCategoryId=${data.targetId}`);
};
