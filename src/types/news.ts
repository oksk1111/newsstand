export interface NewsItem {
    id: string;
    title: string;
    description?: string;
    summary?: string;
    content?: string;
    url?: string;
    source?: string;
    category?: string;
    tags?: string[];
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NewsResponse {
    success: boolean;
    data: {
        articles: NewsItem[];
        total: number;
        page: number;
        limit: number;
    };
    message?: string;
}

export interface NewsCategory {
    id: string;
    name: string;
    slug: string;
}

export interface NewsSource {
    id: string;
    name: string;
    url: string;
    category?: string;
}
