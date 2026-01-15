export interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
}

export interface UpdatePostRequest {
    title: string;
    content: string;
}
