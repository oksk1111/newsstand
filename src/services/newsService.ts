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
        // 더미 데이터 반환
        const dummyArticles: NewsArticle[] = [
            {
                _id: '1',
                title: '🚀 AI 기술의 최신 동향',
                summary: '인공지능 기술이 빠르게 발전하고 있으며, 새로운 혁신이 계속되고 있습니다.',
                content: 'AI 기술의 발전으로 인해 다양한 분야에서 혁신이 일어나고 있습니다...',
                url: 'https://example.com/ai-news',
                source: 'Tech News',
                category: 'technology',
                publishedAt: new Date().toISOString(),
                relevanceScore: 0.9,
                isActive: true,
                tags: ['AI', '기술', '혁신'],
                sentiment: 'positive',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                _id: '2',
                title: '📈 글로벌 경제 전망',
                summary: '2025년 글로벌 경제는 새로운 도전과 기회를 맞이하고 있습니다.',
                content: '경제 전문가들은 올해 경제 성장률이 안정적일 것으로 예측한다고 발표했습니다...',
                url: 'https://example.com/economy-news',
                source: 'Business Today',
                category: 'business',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                relevanceScore: 0.8,
                isActive: true,
                tags: ['경제', '전망', '성장'],
                sentiment: 'neutral',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                _id: '3',
                title: '🏥 건강한 생활 습관',
                summary: '건강한 라이프스타일을 위한 실용적인 팁들을 소개합니다.',
                content: '규칙적인 운동과 균형 잡힌 식단이 건강한 삶의 핵심입니다...',
                url: 'https://example.com/health-news',
                source: 'Health Magazine',
                category: 'health',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                relevanceScore: 0.7,
                isActive: true,
                tags: ['건강', '라이프스타일', '운동'],
                sentiment: 'positive',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ];

        return {
            success: true,
            data: dummyArticles,
            pagination: {
                limit: filters.limit || 10,
                offset: filters.offset || 0,
                total: dummyArticles.length
            },
            metadata: {
                category: filters.category || 'all',
                sort: filters.sort || 'latest',
                timestamp: new Date().toISOString()
            }
        };
    }

    // Get personalized news feed (requires authentication)
    async getPersonalizedNews(filters: PersonalizedNewsFilters = {}): Promise<NewsResponse> {
        return this.getNews(filters);
    }

    // Get single news article
    async getNewsArticle(id: string): Promise<{ success: boolean; data: NewsArticle }> {
        const dummyArticle: NewsArticle = {
            _id: id,
            title: '샘플 뉴스 기사',
            summary: '이것은 샘플 뉴스 기사입니다.',
            content: '상세한 내용이 여기에 표시됩니다...',
            url: 'https://example.com/news/' + id,
            source: 'Sample News',
            category: 'general',
            publishedAt: new Date().toISOString(),
            relevanceScore: 0.8,
            isActive: true,
            tags: ['샘플', '뉴스'],
            sentiment: 'neutral',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return {
            success: true,
            data: dummyArticle
        };
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
