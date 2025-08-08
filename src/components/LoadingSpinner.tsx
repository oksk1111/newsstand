import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    text?: string;
    color?: string;
    overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    text = '로딩 중...',
    color,
    overlay = false,
}) => {
    const containerStyle = overlay ? [styles.container, styles.overlay] : styles.container;

    return (
        <View style={containerStyle}>
            <ActivityIndicator
                size={size}
                color={color}
                style={styles.spinner}
            />
            {text && (
                <Text style={styles.text}>{text}</Text>
            )}
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
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
    },
    spinner: {
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
