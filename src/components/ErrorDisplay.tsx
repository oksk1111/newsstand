import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

interface ErrorDisplayProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryText?: string;
    icon?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = '오류가 발생했습니다',
    message = '네트워크 연결을 확인하고 다시 시도해주세요.',
    onRetry,
    retryText = '다시 시도',
    icon = '⚠️',
}) => {
    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.content}>
                    <Text style={styles.icon}>{icon}</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    {onRetry && (
                        <Button
                            mode="contained"
                            onPress={onRetry}
                            style={styles.retryButton}
                        >
                            {retryText}
                        </Button>
                    )}
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        maxWidth: 350,
        width: '100%',
        elevation: 4,
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#333',
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
    },
});
