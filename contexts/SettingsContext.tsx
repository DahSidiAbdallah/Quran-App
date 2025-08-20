import React, { createContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Settings } from '../types';

const defaultSettings: Settings = {
    theme: 'light',
    reciter: 'ar.alafasy',
    translation: 'en.asad',
    tafsir: 'en.tafsir.ibn.kathir',
    arabicFont: 'amiri',
    translationFont: 'poppins',
    arabicFontSize: 30,
    translationFontSize: 16
};

export const SettingsContext = createContext<{
    settings: Settings;
    setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}>({
    settings: defaultSettings,
    setSetting: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useLocalStorage<Settings>('settings', defaultSettings);

    const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [key]: value
        }));
    };

    useEffect(() => {
        const root = document.documentElement;
        // Theme
        root.classList.remove('light', 'dark');
        if (settings.theme !== 'sepia') {
            root.classList.add(settings.theme);
        }
        
        // Fonts
        root.style.setProperty('--font-size-translation', `${settings.translationFontSize}px`);
        root.style.setProperty('--font-size-arabic', `${settings.arabicFontSize}px`);
        const arabicFontFamily = settings.arabicFont === 'naskh' ? "'Noto Naskh Arabic', serif" : "'Amiri', serif";
        root.style.setProperty('--font-family-arabic', arabicFontFamily);

    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, setSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};
