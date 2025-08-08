import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Chip, Text, Button } from 'react-native-paper';

interface SearchComponentProps {
    onSearch: (query: string, filters: SearchFilters) => void;
    placeholder?: string;
    showFilters?: boolean;
    recentSearches?: string[];
    popularSearches?: string[];
}

export interface SearchFilters {
    category?: string;
    dateRange?: string;
    sentiment?: string;
    source?: string;
}

const CATEGORIES = [
    { key: 'all', label: '전체' },
    { key: 'technology', label: '기술' },
    { key: 'business', label: '비즈니스' },
    { key: 'health', label: '건강' },
    { key: 'science', label: '과학' },
    { key: 'politics', label: '정치' },
    { key: 'sports', label: '스포츠' },
    { key: 'entertainment', label: '엔터테인먼트' },
];

const DATE_RANGES = [
    { key: 'all', label: '전체 기간' },
    { key: 'today', label: '오늘' },
    { key: 'week', label: '일주일' },
    { key: 'month', label: '한 달' },
];

const SENTIMENT_FILTERS = [
    { key: 'all', label: '전체' },
    { key: 'positive', label: '긍정적' },
    { key: 'neutral', label: '중립적' },
    { key: 'negative', label: '부정적' },
];

export const SearchComponent: React.FC<SearchComponentProps> = ({
    onSearch,
    placeholder = '뉴스를 검색하세요...',
    showFilters = true,
    recentSearches = [],
    popularSearches = ['AI', '주식', '부동산', '코로나', '경제'],
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        category: 'all',
        dateRange: 'all',
        sentiment: 'all',
    });

    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim(), filters);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionPress = (suggestion: string) => {
        setSearchQuery(suggestion);
        onSearch(suggestion, filters);
        setShowSuggestions(false);
    };

    const updateFilter = (key: keyof SearchFilters, value: string) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
        setFilters(newFilters);
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim(), newFilters);
        }
    };

    const clearFilters = () => {
        const clearedFilters = {
            category: 'all',
            dateRange: 'all',
            sentiment: 'all',
        };
        setFilters(clearedFilters);
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim(), {});
        }
    };

    const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder={placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    style={styles.searchbar}
                    inputStyle={styles.searchInput}
                    iconColor="#666"
                />
            </View>

            {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0 || popularSearches.length > 0) && (
                <View style={styles.suggestionsContainer}>
                    {recentSearches.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <Text style={styles.suggestionTitle}>최근 검색</Text>
                            <FlatList
                                horizontal
                                data={recentSearches.slice(0, 5)}
                                keyExtractor={(item, index) => `recent-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSuggestionPress(item)}
                                        style={styles.suggestionItem}
                                    >
                                        <Text style={styles.suggestionText}>🕒 {item}</Text>
                                    </TouchableOpacity>
                                )}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.suggestionsList}
                            />
                        </View>
                    )}

                    {popularSearches.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <Text style={styles.suggestionTitle}>인기 검색어</Text>
                            <FlatList
                                horizontal
                                data={popularSearches}
                                keyExtractor={(item, index) => `popular-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSuggestionPress(item)}
                                        style={styles.suggestionItem}
                                    >
                                        <Text style={styles.suggestionText}>🔥 {item}</Text>
                                    </TouchableOpacity>
                                )}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.suggestionsList}
                            />
                        </View>
                    )}
                </View>
            )}

            {showFilters && (
                <View style={styles.filtersContainer}>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>카테고리:</Text>
                        <FlatList
                            horizontal
                            data={CATEGORIES}
                            keyExtractor={(item) => item.key}
                            renderItem={({ item }) => (
                                <Chip
                                    mode={filters.category === item.key ? 'flat' : 'outlined'}
                                    selected={filters.category === item.key}
                                    onPress={() => updateFilter('category', item.key)}
                                    style={styles.filterChip}
                                    textStyle={styles.filterChipText}
                                >
                                    {item.label}
                                </Chip>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterList}
                        />
                    </View>

                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>기간:</Text>
                        <FlatList
                            horizontal
                            data={DATE_RANGES}
                            keyExtractor={(item) => item.key}
                            renderItem={({ item }) => (
                                <Chip
                                    mode={filters.dateRange === item.key ? 'flat' : 'outlined'}
                                    selected={filters.dateRange === item.key}
                                    onPress={() => updateFilter('dateRange', item.key)}
                                    style={styles.filterChip}
                                    textStyle={styles.filterChipText}
                                >
                                    {item.label}
                                </Chip>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterList}
                        />
                    </View>

                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>감정:</Text>
                        <FlatList
                            horizontal
                            data={SENTIMENT_FILTERS}
                            keyExtractor={(item) => item.key}
                            renderItem={({ item }) => (
                                <Chip
                                    mode={filters.sentiment === item.key ? 'flat' : 'outlined'}
                                    selected={filters.sentiment === item.key}
                                    onPress={() => updateFilter('sentiment', item.key)}
                                    style={styles.filterChip}
                                    textStyle={styles.filterChipText}
                                >
                                    {item.label}
                                </Chip>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterList}
                        />
                    </View>

                    {hasActiveFilters && (
                        <View style={styles.clearFiltersContainer}>
                            <Button
                                mode="outlined"
                                onPress={clearFilters}
                                style={styles.clearFiltersButton}
                                labelStyle={styles.clearFiltersText}
                            >
                                필터 초기화
                            </Button>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchbar: {
        elevation: 2,
        borderRadius: 12,
    },
    searchInput: {
        fontSize: 16,
    },
    suggestionsContainer: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    suggestionSection: {
        marginBottom: 12,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 16,
        marginBottom: 8,
    },
    suggestionsList: {
        paddingHorizontal: 16,
    },
    suggestionItem: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        elevation: 1,
    },
    suggestionText: {
        fontSize: 14,
        color: '#555',
    },
    filtersContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    filterRow: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    filterList: {
        paddingRight: 16,
    },
    filterChip: {
        marginRight: 8,
        height: 32,
    },
    filterChipText: {
        fontSize: 12,
    },
    clearFiltersContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    clearFiltersButton: {
        borderColor: '#666',
    },
    clearFiltersText: {
        color: '#666',
        fontSize: 12,
    },
});
