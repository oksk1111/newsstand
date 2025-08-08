import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import 'react-native-url-polyfill/auto';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const initializeApp = async (): Promise<void> => {
  try {
    // Load custom fonts if needed
    await Font.loadAsync({
      // Add your custom fonts here
      // 'CustomFont-Regular': require('@assets/fonts/CustomFont-Regular.ttf'),
    });

    // Initialize other services here
    // await initializeNotifications();
    // await initializeAnalytics();

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  } finally {
    // Hide the splash screen
    SplashScreen.hideAsync();
  }
};

export const resetApp = async (): Promise<void> => {
  try {
    // Clear all storage
    const { clearAllStorage } = await import('@/utils/storage');
    await clearAllStorage();
    
    // Reset any other app state
    console.log('App reset successfully');
  } catch (error) {
    console.error('Error resetting app:', error);
    throw error;
  }
};
