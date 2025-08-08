import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_PREFERENCES_KEY = 'user_preferences';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

// Use SecureStore for sensitive data on native platforms, AsyncStorage for web
const isNative = Platform.OS !== 'web';

// Token storage
export const saveTokenToStorage = async (token: string): Promise<void> => {
  try {
    if (isNative) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    if (isNative) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } else {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeTokenFromStorage = async (): Promise<void> => {
  try {
    if (isNative) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

// User preferences storage
export const savePreferencesToStorage = async (preferences: object): Promise<void> => {
  try {
    const prefString = JSON.stringify(preferences);
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, prefString);
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

export const getPreferencesFromStorage = async (): Promise<object | null> => {
  try {
    const prefString = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    return prefString ? JSON.parse(prefString) : null;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
};

export const removePreferencesFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
  } catch (error) {
    console.error('Error removing preferences:', error);
    throw error;
  }
};

// Onboarding status
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    throw error;
  }
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Clear all storage
export const clearAllStorage = async (): Promise<void> => {
  try {
    await Promise.all([
      removeTokenFromStorage(),
      removePreferencesFromStorage(),
      AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

// Generic storage functions
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
    throw error;
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return null;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
    throw error;
  }
};
