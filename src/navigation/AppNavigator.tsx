import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';

// Import contexts
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
function TabNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'apps';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: '홈' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: '프로필' }}
            />
        </Tab.Navigator>
    );
}

// Main App Navigator
export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null; // 또는 Loading 컴포넌트
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen
                        name="NewsDetail"
                        component={NewsDetailScreen}
                        options={{
                            headerShown: true,
                            title: '뉴스 상세'
                        }}
                    />
                </>
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}
