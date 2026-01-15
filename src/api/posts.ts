import client from './client';
import type { CreatePostRequest, Post, UpdatePostRequest } from '../types/post';

export const getPosts = async () => {
    const response = await client.get<Post[]>('/posts');
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
