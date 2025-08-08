import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationContextType {
    requestPermissions: () => Promise<boolean>;
    scheduleNotification: (title: string, body: string, trigger?: Date) => Promise<string>;
    cancelNotification: (notificationId: string) => Promise<void>;
    cancelAllNotifications: () => Promise<void>;
}

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    useEffect(() => {
        // Request permissions on app start
        requestPermissions();
    }, []);

    const requestPermissions = async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Failed to get push token for push notification!');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    };

    const scheduleNotification = async (
        title: string,
        body: string,
        trigger?: Date
    ): Promise<string> => {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: 'default',
                },
                trigger: trigger ? { date: trigger } : null,
            });

            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw error;
        }
    };

    const cancelNotification = async (notificationId: string): Promise<void> => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
            throw error;
        }
    };

    const cancelAllNotifications = async (): Promise<void> => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error canceling all notifications:', error);
            throw error;
        }
    };

    const value: NotificationContextType = {
        requestPermissions,
        scheduleNotification,
        cancelNotification,
        cancelAllNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
