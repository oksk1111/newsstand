export interface User {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    isGuest: boolean;
    guestId?: string;
    preferences: UserPreferences;
    lastActive: string;
    createdAt?: string;
}

export interface UserPreferences {
    categories: NewsCategory[];
    language: Language;
    theme: Theme;
    notifications: NotificationSettings;
}

export interface NotificationSettings {
    enabled: boolean;
    frequency: NotificationFrequency;
}

export type NewsCategory =
    | 'technology'
    | 'business'
    | 'sports'
    | 'entertainment'
    | 'health'
    | 'science'
    | 'politics'
    | 'general';

export type Language = 'en' | 'ko' | 'es' | 'fr' | 'de' | 'ja';

export type Theme = 'light' | 'dark' | 'auto';

export type NotificationFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

export interface NewsArticle {
    _id: string;
    title: string;
    summary: string;
    content?: string;
    url: string;
    imageUrl?: string;
    source: string;
    category: NewsCategory;
    publishedAt: string;
    relevanceScore: number;
    isActive: boolean;
    tags: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    createdAt: string;
    updatedAt: string;
}

export interface NewsResponse {
    success: boolean;
    data: NewsArticle[];
    pagination?: {
        limit: number;
        offset: number;
        total?: number;
    };
    metadata?: {
        category?: string;
        sort?: string;
        personalized?: boolean;
        preferredCategories?: NewsCategory[];
        timestamp: string;
    };
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
}

export interface UserInteraction {
    newsId: string;
    action: InteractionAction;
    timestamp: string;
}

export type InteractionAction = 'view' | 'click' | 'share' | 'like' | 'bookmark';

export interface ApiError {
    error: string;
    message?: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}

export interface CategoryStats {
    _id: NewsCategory;
    count: number;
    avgRelevance: number;
    latestArticle: string;
}

export interface UserStats {
    totalInteractions: number;
    interactionsByAction: Record<InteractionAction, number>;
    recentActivity: number;
    preferredCategories: NewsCategory[];
    accountAge: number;
    isGuest: boolean;
}

export interface SearchParams {
    q: string;
    limit?: number;
    category?: NewsCategory;
}

export interface NewsParams {
    category?: NewsCategory | 'all';
    limit?: number;
    offset?: number;
    sort?: 'latest' | 'trending';
}
