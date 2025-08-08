import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    FlatList,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { newsService } from '../services/newsService';
import { NewsArticle } from '../types';
import { LoadingSpinner, ErrorDisplay, NewsCard, SearchComponent, SearchFilters } from '../components';

export default function HomeScreen() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = useNavigation();

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        console.log(`Toast ${type}: ${message}`);
    };

    const loadNews = async (query?: string, filters?: SearchFilters) => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (query && query.trim()) {
                // 검색 실행 (임시로 일반 뉴스 반환)
                response = await newsService.getNews();
                showToast(`"${query}" 검색 결과 ${response.data?.length || 0}개`, 'info');
            } else {
                // 일반 뉴스 로드
                response = await newsService.getNews();
            }

            if (response.success && response.data) {
                setNews(response.data || []);
            } else {
                setError('뉴스를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to load news:', error);
            setError('네트워크 오류가 발생했습니다.');
            showToast('뉴스를 불러오는데 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNews(searchQuery, searchFilters);
        setRefreshing(false);
        showToast('뉴스를 새로고침했습니다.', 'success');
    };

    const handleSearch = (query: string, filters: SearchFilters) => {
        setSearchQuery(query);
        setSearchFilters(filters);
        loadNews(query, filters);
    };

    const handleRetry = () => {
        loadNews(searchQuery, searchFilters);
    };

    const handleNewsPress = (article: NewsArticle) => {
        // navigation.navigate('NewsDetail' as never, { article } as never);
        console.log('Navigate to NewsDetail:', article.title);
    };

    useEffect(() => {
        loadNews();
    }, []);

    const renderNewsItem = ({ item, index }: { item: NewsArticle; index: number }) => (
        <NewsCard
            key={index}
            article={item}
            onPress={() => handleNewsPress(item)}
            showImage={true}
            compact={false}
        />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>📰 오늘의 뉴스</Text>
            <Text style={styles.headerSubtitle}>개인화된 뉴스 요약</Text>
        </View>
    );

    const renderSearchSection = () => (
        <SearchComponent
            onSearch={handleSearch}
            placeholder="뉴스를 검색하세요..."
            showFilters={true}
            recentSearches={[]} // TODO: 실제 검색 기록 구현
            popularSearches={['AI', '주식', '부동산', '코로나', '경제']}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📋 표시할 뉴스가 없습니다</Text>
            <Text style={styles.emptySubText}>새로고침하여 최신 뉴스를 확인하세요</Text>
            <Button
                mode="outlined"
                onPress={onRefresh}
                style={styles.emptyContainer}
            >
                새로고침
            </Button>
        </View>
    );

    if (loading && news.length === 0) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <LoadingSpinner overlay={false} text="뉴스를 불러오는 중..." />
            </View>
        );
    }

    if (error && news.length === 0) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <ErrorDisplay
                    message={error}
                    onRetry={handleRetry}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={news}
                renderItem={renderNewsItem}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                ListHeaderComponent={renderSearchSection}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={[
                    styles.scrollView,
                    news.length === 0 && styles.emptyContainer
                ]}
                showsVerticalScrollIndicator={false}
            />

            {loading && news.length > 0 && (
                <LoadingSpinner overlay={true} text="업데이트 중..." />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    scrollView: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
});
