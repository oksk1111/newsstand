import { NewsResponse, NewsArticle } from '../types/index';

class NewsService {
    async getNews(): Promise<{ success: boolean; data?: { articles: NewsArticle[] } }> {
        // 더미 데이터 반환
        return {
            success: true,
            data: {
                articles: [
                    {
                        _id: '1',
                        title: '🚀 AI 기술의 최신 동향',
                        summary: '인공지능 기술이 빠르게 발전하고 있으며, 새로운 혁신이 계속되고 있습니다.',
                        content: 'AI 기술의 발전으로 인해 다양한 분야에서 혁신이 일어나고 있습니다...',
                        url: 'https://example.com/ai-news',
                        source: 'Tech News',
                        category: 'technology' as const,
                        publishedAt: new Date().toISOString(),
                        relevanceScore: 0.9,
                        isActive: true,
                        tags: ['AI', '기술', '혁신'],
                        sentiment: 'positive' as const,
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
                        category: 'business' as const,
                        publishedAt: new Date(Date.now() - 3600000).toISOString(),
                        relevanceScore: 0.8,
                        isActive: true,
                        tags: ['경제', '전망', '성장'],
                        sentiment: 'neutral' as const,
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
                        category: 'health' as const,
                        publishedAt: new Date(Date.now() - 7200000).toISOString(),
                        relevanceScore: 0.7,
                        isActive: true,
                        tags: ['건강', '라이프스타일', '운동'],
                        sentiment: 'positive' as const,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                ]
            }
        };
    }
}

export const NewsService = new NewsService();
