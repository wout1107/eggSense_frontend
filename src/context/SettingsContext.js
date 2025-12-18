import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@eggsense_settings';

// Simplified settings - only 3 functional settings
const defaultSettings = {
    // Setting 1: Default stal selection for quick access
    defaultStallId: null,
    // Setting 2: Low stock alert threshold (days of feed remaining)
    lowStockAlertDays: 7,
    // Setting 3: Auto-refresh interval (minutes) - 0 = disabled
    autoRefreshInterval: 5,
};

const SettingsContext = createContext({
    settings: defaultSettings,
    updateSetting: () => { },
    resetSettings: () => { },
    isLoading: true,
});

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved settings
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings !== null) {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        try {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    };

    const resetSettings = async () => {
        try {
            setSettings(defaultSettings);
            await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
        } catch (error) {
            console.error('Error resetting settings:', error);
        }
    };

    const value = useMemo(
        () => ({
            settings,
            updateSetting,
            resetSettings,
            isLoading,
        }),
        [settings, isLoading]
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export { defaultSettings };
