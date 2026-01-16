export interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    memberEmail: string;
    category: string;
    pinned: boolean; // Added pinned field
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    categoryId?: number;
}

export interface UpdatePostRequest {
    title: string;
    content: string;
    categoryId?: number;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Current page index (0-based)
    first: boolean;
    last: boolean;
    empty: boolean;
}
