import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@eggsense_settings';

const defaultSettings = {
    notificationsEnabled: true,
    lowStockAlerts: true,
    dataSaverMode: false,
    wifiOnlyImages: false,
    language: 'nl',
    defaultStallId: null,
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
