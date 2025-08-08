import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, UserPreferences } from '@/types';
import { 
  savePreferencesToStorage, 
  getPreferencesFromStorage 
} from '@/utils/storage';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
  };
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SYSTEM_THEME_CHANGE'; payload: boolean };

interface ThemeContextType extends ThemeState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const lightColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#000000',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#FF6B6B',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

const darkColors = {
  primary: '#0A84FF',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  accent: '#FF6B6B',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9500',
};

const getInitialTheme = (systemScheme: 'light' | 'dark' | null): ThemeState => {
  const defaultTheme: Theme = 'auto';
  const isDark = systemScheme === 'dark';
  
  return {
    theme: defaultTheme,
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      const newTheme = action.payload;
      const isDark = newTheme === 'dark' || (newTheme === 'auto' && state.isDark);
      
      return {
        ...state,
        theme: newTheme,
        isDark,
        colors: isDark ? darkColors : lightColors,
      };
    
    case 'TOGGLE_THEME':
      const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
      
      return {
        ...state,
        theme: nextTheme,
        isDark: nextTheme === 'dark',
        colors: nextTheme === 'dark' ? darkColors : lightColors,
      };
    
    case 'SYSTEM_THEME_CHANGE':
      if (state.theme === 'auto') {
        return {
          ...state,
          isDark: action.payload,
          colors: action.payload ? darkColors : lightColors,
        };
      }
      return state;
    
    default:
      return state;
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [state, dispatch] = useReducer(
    themeReducer, 
    getInitialTheme(systemColorScheme)
  );

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    if (systemColorScheme) {
      dispatch({ 
        type: 'SYSTEM_THEME_CHANGE', 
        payload: systemColorScheme === 'dark' 
      });
    }
  }, [systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const preferences = await getPreferencesFromStorage() as UserPreferences | null;
      if (preferences?.theme) {
        dispatch({ type: 'SET_THEME', payload: preferences.theme });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setTheme = async (theme: Theme) => {
    try {
      dispatch({ type: 'SET_THEME', payload: theme });
      
      // Save to storage
      const currentPreferences = await getPreferencesFromStorage() as UserPreferences | null;
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        theme,
      } as UserPreferences;
      
      await savePreferencesToStorage(updatedPreferences);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    ...state,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
