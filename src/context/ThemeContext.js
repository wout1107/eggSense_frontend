import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Custom light theme
const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2E7D32',
        primaryContainer: '#A5D6A7',
        secondary: '#4CAF50',
        secondaryContainer: '#C8E6C9',
        background: '#f5f5f5',
        surface: '#ffffff',
        surfaceVariant: '#f0f0f0',
        error: '#F44336',
        onPrimary: '#ffffff',
        onSecondary: '#ffffff',
        onBackground: '#1a1a1a',
        onSurface: '#1a1a1a',
        elevation: {
            level0: 'transparent',
            level1: '#ffffff',
            level2: '#f8f8f8',
            level3: '#f0f0f0',
            level4: '#e8e8e8',
            level5: '#e0e0e0',
        },
    },
};

// Custom dark theme
const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#81C784',
        primaryContainer: '#2E7D32',
        secondary: '#A5D6A7',
        secondaryContainer: '#388E3C',
        background: '#121212',
        surface: '#1e1e1e',
        surfaceVariant: '#2a2a2a',
        error: '#EF5350',
        onPrimary: '#1a1a1a',
        onSecondary: '#1a1a1a',
        onBackground: '#e0e0e0',
        onSurface: '#e0e0e0',
        elevation: {
            level0: 'transparent',
            level1: '#1e1e1e',
            level2: '#222222',
            level3: '#252525',
            level4: '#292929',
            level5: '#2c2c2c',
        },
    },
};

const THEME_STORAGE_KEY = '@eggsense_theme';

const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => { },
    theme: lightTheme,
    colors: lightTheme.colors,
});

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);
    const colors = useMemo(() => theme.colors, [theme]);

    const value = useMemo(
        () => ({
            isDarkMode,
            toggleTheme,
            theme,
            colors,
            isLoading,
        }),
        [isDarkMode, theme, colors, isLoading]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { lightTheme, darkTheme };
