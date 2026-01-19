import client from './client';

export interface Comment {
    id: number;
    content: string;
    author: string;
    memberEmail: string;
    createdAt: string;
}

export async function getComments(postId: number) {
    const response = await client.get<Comment[]>(`/posts/${postId}/comments`);
    return response.data;
}

export async function createComment(postId: number, content: string) {
    const response = await client.post<Comment>(`/posts/${postId}/comments`, { content });
    return response.data;
}

export async function updateComment(commentId: number, content: string) {
    const response = await client.put<Comment>(`/comments/${commentId}`, { content });
    return response.data;
}

export async function deleteComment(commentId: number) {
    await client.delete(`/comments/${commentId}`);
}
