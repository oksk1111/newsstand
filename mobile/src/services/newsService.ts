import { apiClient } from './apiClient';
import { NewsArticle, NewsResponse, NewsCategory } from '@/types';

export interface NewsFilters {
    category?: NewsCategory | 'all';
    limit?: number;
    offset?: number;
    sort?: 'latest' | 'trending';
}

export interface PersonalizedNewsFilters {
    limit?: number;
    offset?: number;
}

export interface SearchFilters {
    q: string;
    limit?: number;
    category?: NewsCategory;
}

class NewsService {
    // Get general news feed
    async getNews(filters: NewsFilters = {}): Promise<NewsResponse> {
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.sort) params.append('sort', filters.sort);

        const queryString = params.toString();
        const url = `/news${queryString ? `?${queryString}` : ''}`;

        return await apiClient.get<NewsResponse>(url);
    }

    // Get personalized news feed (requires authentication)
    async getPersonalizedNews(filters: PersonalizedNewsFilters = {}): Promise<NewsResponse> {
        const params = new URLSearchParams();

        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());

        const queryString = params.toString();
        const url = `/news/personalized${queryString ? `?${queryString}` : ''}`;

        return await apiClient.get<NewsResponse>(url);
    }

    // Get single news article
    async getNewsArticle(id: string): Promise<{ success: boolean; data: NewsArticle }> {
        return await apiClient.get<{ success: boolean; data: NewsArticle }>(`/news/${id}`);
    }

    // Search news articles
    async searchNews(filters: SearchFilters): Promise<NewsResponse> {
        const params = new URLSearchParams();

        params.append('q', filters.q);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.category) params.append('category', filters.category);

        const queryString = params.toString();
        const url = `/news/search?${queryString}`;

        return await apiClient.get<NewsResponse>(url);
    }

    // Record user interaction with news article
    async recordInteraction(
        articleId: string,
        action: 'view' | 'click' | 'share' | 'like' | 'bookmark'
    ): Promise<{ success: boolean; message: string }> {
        return await apiClient.post<{ success: boolean; message: string }>(
            `/news/${articleId}/interact`,
            { action }
        );
    }

    // Get category statistics
    async getCategoryStats(): Promise<{
        success: boolean;
        data: Array<{
            _id: string;
            count: number;
            avgRelevance: number;
            latestArticle: string;
        }>;
    }> {
        return await apiClient.get<{
            success: boolean;
            data: Array<{
                _id: string;
                count: number;
                avgRelevance: number;
                latestArticle: string;
            }>;
        }>('/news/categories/stats');
    }

    // Get news by specific category
    async getNewsByCategory(
        category: NewsCategory,
        limit: number = 10,
        sort: 'latest' | 'trending' = 'trending'
    ): Promise<NewsResponse> {
        return this.getNews({ category, limit, sort });
    }

    // Get trending news
    async getTrendingNews(limit: number = 10): Promise<NewsResponse> {
        return this.getNews({ sort: 'trending', limit });
    }

    // Get latest news
    async getLatestNews(limit: number = 10): Promise<NewsResponse> {
        return this.getNews({ sort: 'latest', limit });
    }
}

export const newsService = new NewsService();
