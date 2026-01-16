import client from './client';
import type { CreatePostRequest, PageResponse, Post, UpdatePostRequest } from '../types/post';

export const getPosts = async (page = 0, size = 10, categoryId?: number) => {
    const params: any = { page, size };
    if (categoryId) params.categoryId = categoryId;

    const response = await client.get<PageResponse<Post>>('/posts', { params });
    return response.data;
};

export const getPost = async (id: number) => {
    const response = await client.get<Post>(`/posts/${id}`);
    return response.data;
};

export const createPost = async (data: CreatePostRequest) => {
    const response = await client.post<number>('/posts', data);
    return response.data;
};

export const updatePost = async (id: number, data: UpdatePostRequest) => {
    const response = await client.put<number>(`/posts/${id}`, data);
    return response.data;
};

export const deletePost = async (id: number) => {
    await client.delete(`/posts/${id}`);
};

export const bulkUpdatePostCategory = async (data: { postIds: number[]; categoryId: number }) => {
    await client.put('/posts/category', data);
};

export const togglePin = async (id: number) => {
    await client.put(`/posts/${id}/pin`);
};
