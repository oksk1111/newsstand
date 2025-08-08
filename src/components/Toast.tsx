import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Card } from 'react-native-paper';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onHide,
}) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(duration),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (onHide) onHide();
            });
        }
    }, [visible, fadeAnim, duration, onHide]);

    if (!visible) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return { backgroundColor: '#4CAF50', icon: '✅' };
            case 'error':
                return { backgroundColor: '#F44336', icon: '❌' };
            case 'warning':
                return { backgroundColor: '#FF9800', icon: '⚠️' };
            default:
                return { backgroundColor: '#2196F3', icon: 'ℹ️' };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim }
            ]}
        >
            <Card style={[styles.toast, { backgroundColor: typeStyles.backgroundColor }]}>
                <Card.Content style={styles.content}>
                    <Text style={styles.icon}>{typeStyles.icon}</Text>
                    <Text style={styles.message}>{message}</Text>
                </Card.Content>
            </Card>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 1000,
        alignItems: 'center',
    },
    toast: {
        maxWidth: 350,
        elevation: 8,
        borderRadius: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },
});
