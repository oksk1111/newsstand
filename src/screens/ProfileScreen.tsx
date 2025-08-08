import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, List } from 'react-native-paper';

import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>👤 프로필</Text>
            </View>

            <Card style={styles.profileCard}>
                <Card.Content style={styles.profileContent}>
                    <Avatar.Text
                        size={80}
                        label={user?.name?.charAt(0).toUpperCase() || 'G'}
                        style={styles.avatar}
                    />
                    <Title style={styles.userName}>
                        {user?.name || '게스트 사용자'}
                    </Title>
                    <Paragraph style={styles.userEmail}>
                        {user?.email || '게스트 세션'}
                    </Paragraph>
                    <Text style={styles.userType}>
                        {user?.type === 'guest' ? '🎭 게스트' : '👤 회원'}
                    </Text>
                </Card.Content>
            </Card>

            <Card style={styles.menuCard}>
                <Card.Content>
                    <Title style={styles.menuTitle}>📊 이용 현황</Title>

                    <List.Item
                        title="읽은 뉴스"
                        description="오늘 5개 / 이번 주 23개"
                        left={(props) => <List.Icon {...props} icon="book-open" />}
                    />

                    <List.Item
                        title="관심 카테고리"
                        description="기술, 비즈니스, 과학"
                        left={(props) => <List.Icon {...props} icon="heart" />}
                    />

                    <List.Item
                        title="알림 설정"
                        description="푸시 알림 켜짐"
                        left={(props) => <List.Icon {...props} icon="bell" />}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.menuCard}>
                <Card.Content>
                    <Title style={styles.menuTitle}>⚙️ 설정</Title>

                    <List.Item
                        title="테마 설정"
                        description="시스템 기본값"
                        left={(props) => <List.Icon {...props} icon="palette" />}
                        onPress={() => { }}
                    />

                    <List.Item
                        title="언어 설정"
                        description="한국어"
                        left={(props) => <List.Icon {...props} icon="translate" />}
                        onPress={() => { }}
                    />

                    <List.Item
                        title="개인정보 보호"
                        description="데이터 관리"
                        left={(props) => <List.Icon {...props} icon="shield-check" />}
                        onPress={() => { }}
                    />
                </Card.Content>
            </Card>

            <View style={styles.logoutContainer}>
                <Button
                    mode="outlined"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    contentStyle={styles.logoutButtonContent}
                >
                    🚪 로그아웃
                </Button>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Newsstand v1.0.0
                </Text>
                <Text style={styles.footerSubText}>
                    안전하고 스마트한 뉴스 경험
                </Text>
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
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    profileCard: {
        margin: 16,
        marginBottom: 8,
        elevation: 2,
    },
    profileContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatar: {
        marginBottom: 16,
        backgroundColor: '#007AFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    userType: {
        fontSize: 14,
        color: '#888',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    menuCard: {
        margin: 16,
        marginVertical: 8,
        elevation: 2,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    logoutContainer: {
        margin: 16,
        marginVertical: 24,
    },
    logoutButton: {
        borderColor: '#ff4444',
    },
    logoutButtonContent: {
        paddingVertical: 8,
    },
    footer: {
        alignItems: 'center',
        padding: 20,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#888',
        fontWeight: 'bold',
    },
    footerSubText: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 4,
    },
});
