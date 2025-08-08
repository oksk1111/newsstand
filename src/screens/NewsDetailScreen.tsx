import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Share,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { NewsArticle } from '../types';

export default function NewsDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { article } = route.params as { article: NewsArticle };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${article.title}\n\n${article.summary}\n\n${article.url || ''}`,
                title: article.title,
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Chip mode="outlined" style={styles.categoryChip}>
                        {article.category || '일반'}
                    </Chip>
                    <Text style={styles.timestamp}>
                        {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                            : ''
                        }
                    </Text>
                </View>

                <Title style={styles.title}>{article.title}</Title>

                {article.source && (
                    <Text style={styles.source}>📰 {article.source}</Text>
                )}
            </View>

            <Card style={styles.contentCard}>
                <Card.Content>
                    {article.summary && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📋 요약</Text>
                            <Paragraph style={styles.description}>
                                {article.summary}
                            </Paragraph>
                        </View>
                    )}

                    {article.content && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📖 전체 내용</Text>
                            <Paragraph style={styles.content}>
                                {article.content}
                            </Paragraph>
                        </View>
                    )}

                    {article.tags && article.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🏷️ 태그</Text>
                            <View style={styles.tagsContainer}>
                                {article.tags.map((tag: string, index: number) => (
                                    <Chip key={index} style={styles.tag}>
                                        {tag}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}
                </Card.Content>
            </Card>

            <View style={styles.actionButtons}>
                <Button
                    mode="contained"
                    onPress={handleShare}
                    style={styles.shareButton}
                    icon="share"
                >
                    공유하기
                </Button>

                {article.url && (
                    <Button
                        mode="outlined"
                        onPress={() => {
                            // 원본 기사 링크 열기 (웹에서는 새 탭)
                            if (typeof window !== 'undefined') {
                                window.open(article.url, '_blank');
                            }
                        }}
                        style={styles.linkButton}
                        icon="open-in-new"
                    >
                        원본 기사 보기
                    </Button>
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    mode="text"
                    onPress={handleGoBack}
                    style={styles.backButton}
                >
                    ← 뒤로 가기
                </Button>
            </View>
        </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryChip: {
        height: 28,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 30,
        color: '#333',
        marginBottom: 12,
    },
    source: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    contentCard: {
        margin: 16,
        elevation: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    summary: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    content: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        marginRight: 8,
        marginBottom: 4,
    },
    actionButtons: {
        padding: 16,
        gap: 12,
    },
    shareButton: {
        paddingVertical: 4,
    },
    linkButton: {
        paddingVertical: 4,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    backButton: {
        paddingVertical: 4,
    },
});
