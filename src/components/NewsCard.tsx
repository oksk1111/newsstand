import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph, Chip, Text } from 'react-native-paper';
import { NewsArticle } from '../types/index';

interface NewsCardProps {
    article: NewsArticle;
    onPress: () => void;
    showImage?: boolean;
    compact?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
    article,
    onPress,
    showImage = true,
    compact = false,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            return '방금 전';
        } else if (diffHours < 24) {
            return `${diffHours}시간 전`;
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            technology: '#2196F3',
            business: '#4CAF50',
            health: '#FF9800',
            science: '#9C27B0',
            politics: '#F44336',
            sports: '#FF5722',
            entertainment: '#E91E63',
            general: '#607D8B',
        };
        return colors[category] || colors.general;
    };

    const getSentimentEmoji = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😟';
            default: return '😐';
        }
    };

    return (
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
            <Card style={[styles.card, compact && styles.compactCard]}>
                {showImage && article.imageUrl && (
                    <Card.Cover
                        source={{ uri: article.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <Card.Content style={compact ? styles.compactContent : styles.content}>
                    <View style={styles.header}>
                        <Chip
                            mode="outlined"
                            style={[
                                styles.categoryChip,
                                { borderColor: getCategoryColor(article.category) }
                            ]}
                            textStyle={{ color: getCategoryColor(article.category) }}
                        >
                            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                        </Chip>

                        <View style={styles.metadata}>
                            <Text style={styles.sentiment}>
                                {getSentimentEmoji(article.sentiment)}
                            </Text>
                            <Text style={styles.timestamp}>
                                {formatDate(article.publishedAt)}
                            </Text>
                        </View>
                    </View>

                    <Title
                        numberOfLines={compact ? 2 : 3}
                        style={[styles.title, compact && styles.compactTitle]}
                    >
                        {article.title}
                    </Title>

                    {!compact && (
                        <Paragraph
                            numberOfLines={3}
                            style={styles.summary}
                        >
                            {article.summary}
                        </Paragraph>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.source}>
                            📰 {article.source}
                        </Text>

                        {article.relevanceScore && (
                            <View style={styles.relevanceContainer}>
                                <Text style={styles.relevanceLabel}>관련도</Text>
                                <View style={styles.relevanceBar}>
                                    <View
                                        style={[
                                            styles.relevanceFill,
                                            { width: `${article.relevanceScore * 100}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.relevanceText}>
                                    {Math.round(article.relevanceScore * 100)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {article.tags && article.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {article.tags.slice(0, 3).map((tag, index) => (
                                <Chip
                                    key={index}
                                    mode="outlined"
                                    style={styles.tag}
                                    textStyle={styles.tagText}
                                >
                                    #{tag}
                                </Chip>
                            ))}
                            {article.tags.length > 3 && (
                                <Text style={styles.moreTagsText}>
                                    +{article.tags.length - 3}개 더
                                </Text>
                            )}
                        </View>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        marginBottom: 16,
    },
    card: {
        elevation: 3,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    compactCard: {
        marginBottom: 8,
    },
    image: {
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    content: {
        padding: 16,
    },
    compactContent: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryChip: {
        height: 28,
        backgroundColor: 'transparent',
    },
    metadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sentiment: {
        fontSize: 14,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
        marginBottom: 8,
        color: '#333',
    },
    compactTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    summary: {
        fontSize: 14,
        lineHeight: 20,
        color: '#555',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    source: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    relevanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 16,
    },
    relevanceLabel: {
        fontSize: 10,
        color: '#666',
        marginRight: 4,
    },
    relevanceBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginRight: 4,
    },
    relevanceFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 2,
    },
    relevanceText: {
        fontSize: 10,
        color: '#666',
        minWidth: 30,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 8,
    },
    tag: {
        height: 24,
        marginRight: 6,
        marginBottom: 4,
        backgroundColor: 'transparent',
    },
    tagText: {
        fontSize: 11,
        color: '#666',
    },
    moreTagsText: {
        fontSize: 11,
        color: '#888',
        fontStyle: 'italic',
    },
});
